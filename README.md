# Gemini Portfolio — AI-Powered Developer Portfolio

A portfolio that doesn't just list projects — it **understands questions**.

Built for the **Google AI "New Year, New You" Portfolio Challenge 2026**.

---

## What Makes This Different

Most portfolios are static pages. You scroll, you read, you leave.

This one is different. **You ask questions.**

> "What projects has Shivam built?"

> "Tell me about Still"

> "What are his skills?"

The portfolio understands your intent, retrieves relevant information, and responds with citations you can hover and click.

---

## The Technology

### Semantic Search, Not Just Keywords

This isn't a chatbot with your resume copy-pasted into a prompt.

It's a **real RAG (Retrieval Augmented Generation) system**:

1. **You type a question**
2. **Intent classification** determines what you're asking about (projects, skills, contact, etc.)
3. **Semantic search** finds the most relevant information using embeddings
4. **Only relevant content** is sent to Gemini — not the entire portfolio
5. **Gemini generates** a contextual response with citations
6. **Citations are clickable** — they link directly to GitHub repos and live sites

This is how production AI search systems work. Not prompt stuffing.

---

## Technical Architecture

```
Query → Intent Classification → Embed Query (text-embedding-004)
                                      ↓
              Cosine Similarity Search (threshold ≥ 0.25)
                                      ↓
                    Top 3 Relevant Chunks with Provenance
                                      ↓
                         Gemini 3 Flash → Response
                                      ↓
                    Rendered with Hover Previews + Clickable Links
```

### What Powers It

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16 + TypeScript + Framer Motion |
| **AI Model** | Gemini 3 Flash Preview |
| **Embeddings** | Google text-embedding-004 (768 dimensions) |
| **Animations** | Unicorn Studio WebGL + Three.js |
| **Search** | Custom semantic search with cosine similarity |

---

## Key Features

### 1. Real Semantic Search
- 21 pre-computed embeddings covering all portfolio content
- Similarity threshold (0.25) filters out weak matches
- Fallback to identity/philosophy when no strong matches exist

### 2. Intent Classification
- Lightweight keyword-based classification
- Biases search results by category
- No ML overhead — just smart pattern matching

### 3. Chunk Provenance
Every piece of retrieved content has a source:
```typescript
source: {
  section: "project",
  projectName: "Still"
}
```
This enables transparent citations and honest AI behavior.

### 4. Clickable Citations
Citations aren't just text — they link to:
- GitHub repositories
- Live deployed sites
- LinkedIn, LeetCode, and other profiles

### 5. Visual Excellence
- WebGL liquid animation on home screen
- Energy beam background on results
- Smooth transitions with Framer Motion
- Shining "Searching..." loading animation

---

## UI/UX Philosophy

### Why a Search Box, Not a Menu

Traditional portfolios have navigation: About, Projects, Skills, Contact.

We replaced all of that with **one search box**.

The reasoning:
- **Removes decision fatigue** — Users don't have to figure out where information lives
- **Faster access** — Type "contact" instead of hunting for a link
- **Natural interaction** — Questions are how humans think, not categories
- **Memorable** — Nobody remembers a menu, but they remember asking a question

The search box is placed dead center. No distractions. One clear action.

---

### Why WebGL Backgrounds, Not Static Images

The background isn't decoration. It's **emotional design**.

**Home screen (Liquid Effect):**
- Organic, flowing movement
- Dark, mysterious atmosphere
- Suggests depth and possibility
- Makes the search box feel like a portal

**Results screen (Energy Beam):**
- Bright, energetic beams radiating outward
- Suggests knowledge flowing from the answer
- Creates visual distinction between states
- Makes results feel dynamic, not static

Both animations are intentionally **subtle**. They enhance mood without distracting from content.

---

### Why Results Appear Centered, Not Sidebar

Many search engines show results in a left panel.

We center everything because:
- **Focus** — One thing to look at, not two
- **Mobile-first** — Same layout on all devices
- **Reading flow** — Natural eye movement from top to bottom
- **Elegance** — Centered layouts feel intentional and premium

---

### Why Hide the Search Bar During Loading

When "Searching..." appears, the follow-up search bar disappears.

This is deliberate:
- **Reduces visual noise** — One thing happening at a time
- **Prevents double-submission** — Can't accidentally search twice
- **Creates anticipation** — The empty space builds expectation
- **Signals state change** — User knows something is happening

---

### Why Citations Use Hover Previews

Citations could have been simple links. But links require commitment — you click, you leave.

Hover previews let you **peek without leaving**:
- See the project image
- Read what it is
- Decide if you want to explore further

This reduces friction. More exploration, less bouncing.

---

### Why the Glowing Search Bar

The search bar has a gradient glow animation.

This serves multiple purposes:
- **Draws attention** — First thing your eye sees
- **Suggests activity** — The site feels alive, not dead
- **Premium feel** — Glows suggest high-end interfaces
- **Clear affordance** — Obviously interactive, obviously important

---

### Color Philosophy

**Home screen:** Dark with deep blues and purples
- Creates mystery and depth
- Makes the white search box pop
- Professional, not playful

**Results screen:** Bright gradients with white text
- Shift from mystery to clarity
- Answers should feel illuminating
- Energy and excitement

This contrast between screens reinforces the **question → answer** journey.

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY

# Generate embeddings (only needed when portfolio data changes)
npx tsx scripts/generate-embeddings.ts

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
├── app/
│   ├── api/query/route.ts      # RAG + Gemini API endpoint
│   └── page.tsx                # Main portfolio page
├── components/ui/
│   ├── simplified-result-panel.tsx  # Results with citations
│   ├── animated-glowing-search-bar.tsx
│   ├── liquid-effect-animation.tsx  # Three.js home animation
│   └── energy-beam-background.tsx   # Unicorn Studio WebGL
├── lib/
│   ├── portfolio-data.ts       # All portfolio content
│   └── rag/
│       ├── chunks.ts           # Content chunking with provenance
│       ├── intent.ts           # Query intent classification
│       ├── search.ts           # Semantic similarity search
│       └── embeddings.json     # Pre-computed vectors
└── scripts/
    └── generate-embeddings.ts  # Embedding generation script
```

---

## Why This Approach

### The Problem with "AI Portfolios"

Most AI-integrated portfolios do this:
```
System Prompt: "Here's everything about me: [entire resume]"
User: "What projects have you built?"
AI: [generates response from entire context]
```

This is **not** AI-powered search. It's a chatbot with a really long system prompt.

### What We Built Instead

```
User: "What projects have you built?"
→ Embed query using text-embedding-004
→ Find semantically similar chunks (projects related)
→ Send ONLY relevant chunks to Gemini
→ Generate response with proper citations
```

This is **retrieval augmented generation**. The AI only sees what's relevant.

---

## What's Next

- [ ] Deploy to Google Cloud Run
- [ ] Add more portfolio content (achievements, blog posts)
- [ ] Voice search integration
- [ ] Analytics on search patterns

---

## Built By

**Shivam Gawali** — AI & Data Science Student

- [GitHub](https://github.com/shiv669)
- [LinkedIn](https://www.linkedin.com/in/shivam-gawali-0b7122224)
- [DEV.to](https://dev.to/shiv669)

---

## License

MIT