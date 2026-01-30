# Design Notes and Learnings

This document captures the real design journey of building an AI-powered portfolio. It intentionally documents incorrect assumptions, flawed reasoning, and how each was corrected.

The goal was not to build a portfolio quickly, but to understand how semantic search should be modeled, implemented, and exercised end to end.

The final design is the result of multiple iterations, failures, and corrections.

---

## The Starting Point

### The Initial Problem

I wanted a portfolio that stood out for the Google AI "New Year, New You" challenge. The obvious approach was to add a Gemini chatbot.

But there's a problem with this obvious approach.

Most "AI portfolios" do something like this:

```
System prompt: "You are a helpful assistant. Here's everything about Shivam: [paste entire resume]"
User: "What projects have you built?"
AI: generates response
```

This isn't AI-powered search. It's a chatbot with a really long context window.

I wanted something defensible. Something where "AI-powered search" actually meant search.

---

## Early Mistakes

### Mistake 1: Sending Everything to the AI

The first implementation was simple. Take the user's query, append my entire `portfolio-data.ts` to the system prompt, and let Gemini figure it out.

It worked. But it had problems:

1. **Not scalable** — If my portfolio grows, the context grows
2. **Not actually search** — No retrieval, no ranking, no relevance scoring
3. **Not defensible** — Any judge who understands AI would see through it

The key realization: sending everything to the AI is not search. It's prompt stuffing.

---

### Mistake 2: Thinking RAG Requires a Vector Database

When I decided to build real RAG, my first assumption was that I needed:
- Pinecone
- Supabase with pgvector
- Some external vector database

This was wrong for a portfolio.

A portfolio has maybe 20-30 pieces of content. That's tiny. Vector databases are for millions of documents, not dozens.

The correction: **JSON file with pre-computed embeddings**. Simple, fast, no external dependencies.

---

### Mistake 3: No Intent Classification

Early versions retrieved chunks purely by semantic similarity. Ask "what are your skills?" and it might return project descriptions that happen to mention technologies.

The problem: semantic similarity alone doesn't understand query categories.

The correction: **Lightweight intent classification**. Before embedding, classify the query as project, skills, contact, etc. Then bias the search toward relevant chunks.

This cost almost nothing (keyword matching) but significantly improved accuracy.

---

### Mistake 4: No Similarity Threshold

The first search implementation returned the top 3 chunks regardless of score. Ask something completely unrelated, and you'd still get 3 chunks — even if none were relevant.

This made the system feel random. Worse, it made the AI hallucinate from irrelevant context.

The correction: **Similarity threshold of 0.25**. If no chunks pass the threshold, fall back to identity/philosophy rather than forcing bad results.

This is how real search systems work. No results is better than wrong results.

---

### Mistake 5: Citations Without Provenance

Early citation implementations had no source tracking. The AI generated citations, but there was no connection to where the information came from.

This made the system feel like a black box. You couldn't verify what the AI was basing its answers on.

The correction: **Chunk provenance**. Every chunk carries its source:

```typescript
source: {
  section: "project",
  projectName: "Still"
}
```

This enables transparent citations. The user can see exactly where information came from.

---

## Core Design Decisions

### Chunks as Semantic Units

Each chunk represents one meaningful piece of information:
- One chunk per project
- One chunk per skill category
- One chunk for identity
- One chunk for philosophy

Total: 21 chunks covering the entire portfolio.

This granularity matters. Too coarse (fewer, larger chunks) and retrieval loses precision. Too fine (many tiny chunks) and you lose context.

---

### Embeddings at Build Time, Search at Runtime

A key decision was separating embedding generation from search.

Embeddings are generated once when portfolio content changes:
```bash
npx tsx scripts/generate-embeddings.ts
```

At runtime, only the query is embedded. Chunk embeddings are loaded from JSON.

This means:
- No embedding API calls per search (saves quota)
- Fast search (just cosine similarity)
- Easy updates (regenerate embeddings when content changes)

---

### The RAG Pipeline

The final pipeline:

```
1. User submits query
2. Classify intent (keyword heuristics)
3. Embed query (text-embedding-004)
4. Load pre-computed embeddings
5. Filter chunks by intent category
6. Compute cosine similarity
7. Filter by threshold (≥ 0.25)
8. Take top 3 chunks
9. Format context with provenance
10. Send to Gemini with reduced context
11. Generate response with citations
12. Render with clickable links
```

Each step has a clear responsibility. The system is composable and debuggable.

---

## UI/UX Iterations and Philosophy

This section documents not just what the UI does, but **why** every decision was made.

---

### Core Philosophy: Search as Interface

The fundamental choice was to replace traditional navigation with a search box.

**Why this matters:**

Traditional portfolios force users to navigate categories. "Where would skills be? Under About? A separate page?"

Search removes this friction. You don't navigate — you ask.

This is a bet on how people actually think. They don't think in categories. They think in questions.

---

### The Home Screen Design

**What it is:** Dark background, centered search bar, flowing liquid animation.

**Why dark:**
The dark background serves multiple purposes:
- Creates focus on the one bright element (the search bar)
- Feels professional and serious
- Provides contrast for the WebGL animation
- Doesn't compete with content that doesn't exist yet

**Why liquid animation:**
The liquid effect was chosen specifically because:
- Organic movement suggests life without demanding attention
- Dark, flowing shapes create depth and mystery
- It's mesmerizing enough to hold attention during the "what should I ask?" moment
- Unlike particle systems, it doesn't feel chaotic or overwhelming

**Why centered:**
The search box sits exactly at the center of the screen because:
- There's literally one thing to do — make it obvious
- Centering creates balance and intentionality
- Works identically on mobile and desktop
- No sidebar, no header, no distractions

---

### The Results Screen Design

**What it is:** Bright energy beam background, centered text, follow-up search below.

**Why bright:**
The shift from dark (home) to bright (results) is deliberate:
- Answers should feel illuminating
- The contrast marks a state transition
- Energy beams suggest knowledge radiating outward
- Creates excitement and satisfaction

**Why energy beams, not continued liquid:**
The background changes to reinforce that something happened:
- Same background = nothing changed
- Different background = state transition complete
- Beams radiating outward = answer flowing from the query
- Abstract enough not to distract from text

**Why text is centered with large font:**
- The answer is the star — give it presence
- Large text conveys confidence in the response
- Centered layout maintains the single-column focus
- No competing UI elements in peripheral vision

---

### The Loading State Problem

**Early mistake:** No loading indicator. User clicked search, nothing visible happened for 1-2 seconds.

**Why this was bad:**
- Users didn't know if their click registered
- Uncertainty leads to double-clicking
- The delay felt like the site was broken

**The correction:** Shining "Searching..." animation.

**Why this specific animation:**
- Gradient shimmer suggests progress without promising time
- The word "Searching..." explains what's happening
- Hiding the search bar during loading prevents accidental resubmission
- Animation is subtle — doesn't feel frantic

**Additional decision:** Hide the follow-up search bar during loading.
- Reduces visual noise
- Creates anticipation (empty space is filled by loading, then by answer)
- Prevents confused double-searches

---

### Citation Hover Previews

**Early mistake:** Citations were just text markers like `[still]`.

**Why this was bad:**
- No visual interest
- Users didn't know citations were interactive
- Clicking felt like a commitment (leaving the page)

**The correction:** Rich hover previews.

**Why hover instead of always-visible:**
- Always-visible previews would clutter the text flow
- Hover allows progressive disclosure
- Users can scan text quickly, then explore what interests them
- Respects user attention — only show detail when requested

**What the preview shows:**
- Image: Creates visual recognition
- Title: Confirms what you're hovering
- Subtitle: Brief context without clicking

**Why previews appear near cursor:**
- Follows the user's attention
- Doesn't require eye movement to another part of screen
- Feels like information is "attached" to the citation

---

### Clickable Citations

**Evolution:** First text only → then hover preview → finally clickable links.

**Why not clickable from the start:**
Initial focus was on the AI response quality. Links were added when the system became reliable enough that users would want to verify.

**Where links go:**
- Project citations → GitHub or live site
- Contact citations → LinkedIn, LeetCode, etc.
- The AI chooses the most relevant link from portfolio data

**Why links open in new tab:**
- Keeps the portfolio open
- User can explore and return
- Doesn't break the search flow

---

### The Glowing Search Bar

**What it is:** A gradient animation that pulses around the search input.

**Why it exists:**
- Draws the eye immediately to the one interactive element
- Suggests the input is "alive" and ready
- Premium feel — glows are associated with high-end interfaces
- Creates affordance — this is obviously interactive

**Why subtle, not flashy:**
- Loud animations distract from thinking
- Subtle glow catches attention without demanding it
- Respects that users might be formulating their question

---

### Color System

**Home screen colors:**
- Background: Near-black with blue undertones
- Accent: Deep purples and blues
- Search bar: White with gradient border
- Purpose: Mystery, depth, invitation

**Results screen colors:**
- Background: Bright gradients (blues, purples, magentas)
- Text: White for contrast
- Citations: Sky blue to indicate interactivity
- Purpose: Energy, clarity, satisfaction

**Why two distinct palettes:**
The shift reinforces the state change:
- Dark → question, uncertainty, possibility
- Bright → answer, clarity, knowledge

This is emotional design. The colors tell a story.

---

### Mobile Considerations

Every design decision was validated for mobile:
- Centered layout works identically
- Touch targets are appropriately sized
- Hover previews work on tap
- No horizontal scrolling
- Text scales appropriately

Mobile wasn't an afterthought — the centered, single-column design naturally adapts.

---

### Performance vs. Visual Quality

**The tension:** WebGL animations are beautiful but expensive.

**How we balanced it:**
- FPS throttled to 20 (not 60) — still smooth, half the cost
- Resolution scales on low-end devices
- Animations pause when tab is hidden
- Animations pause during AI calls (frees main thread)

**Why not skip animations entirely:**
The animations aren't decoration. They create emotional response:
- Liquid effect makes the site feel alive
- Energy beams make answers feel exciting
- Without them, it's just text on a page

The goal was maximum emotional impact with minimum performance cost.

---

## API Quota Management

### The Rate Limit Problem

Gemini's free tier has limits. During development, I hit quota errors repeatedly.

Symptoms:
- 429 errors from the API
- Fallback responses instead of AI responses
- Inconsistent behavior

Solutions implemented:
1. **Response caching** — Same queries return cached results
2. **Model switching** — Tested multiple Gemini models with separate quotas
3. **Reduced retries** — `maxRetries: 1` to avoid quota consumption on failures
4. **Pre-computed embeddings** — No embedding calls per search

---

## Performance Optimizations

### WebGL Animation Control

The WebGL animations (liquid effect, energy beam) were consuming significant resources.

Optimizations:
- **FPS throttling** — Animations run at 20 FPS, not 60
- **Resolution scaling** — Reduced pixel ratio on lower-end devices
- **Visibility detection** — Animations pause when not visible
- **INP optimization** — Animation pauses during search to free the main thread

---

## What I Learned

### 1. "AI-Powered" Must Be Defensible

Adding AI that just prompts with your resume isn't AI-powered search. Real RAG has:
- Retrieval (finding relevant content)
- Embedding (semantic understanding)
- Threshold (quality control)
- Generation (contextual response)

If you can't explain how retrieval works, it's not retrieval.

---

### 2. Simplicity Beats Complexity

I could have used:
- Pinecone for vectors
- BM25 + embedding hybrid search
- Multi-hop reasoning
- Tool-calling chains

I didn't. JSON file with 21 embeddings works perfectly for a portfolio.

The right solution fits the problem size.

---

### 3. Provenance Enables Trust

When the AI returns information, users should be able to trace its source.

This isn't just about accuracy. It's about building trust in AI systems.

---

### 4. Thresholds Prevent Hallucination

Forcing the AI to always return results leads to forced answers. No match is better than wrong match.

The similarity threshold (0.25) was the single most important quality improvement.

---

### 5. Honest Documentation Matters

I documented every mistake in this file. Not to show failure, but to show learning.

Good engineering isn't about never making mistakes. It's about recognizing them and correcting them systematically.

---

## Final Architecture

```
portfolio-data.ts     →    chunks.ts         →    embeddings.json
   (source data)           (chunking)             (768-dim vectors)
                              ↓
                          intent.ts
                       (classification)
                              ↓
                          search.ts
                    (similarity + threshold)
                              ↓
                         route.ts
                   (RAG + Gemini generation)
                              ↓
               simplified-result-panel.tsx
                (render with citations)
```

Each layer has one responsibility. Changes propagate predictably.

---

## What's Next

1. **Deploy to Google Cloud Run** — Required for challenge submission
2. **Write submission post** — Document the journey for DEV.to
3. **Add more content** — Blog posts, achievements, testimonials
4. **Analytics** — Track which queries users ask most

The portfolio is never "done." But the foundation is solid.
