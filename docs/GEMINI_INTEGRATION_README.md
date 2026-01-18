# Shivam Gawali AI Knowledge Panel Portfolio - Integration Guide

## Product Overview

This is an AI-powered searchable personal knowledge panel that behaves like a Google-style AI knowledge panel. It is NOT a chatbot, NOT a resume page - it's a structured knowledge retrieval system.

### Core Philosophy
- User understands portfolio in 0.5 seconds
- No chat UI, no avatars, no typing indicators
- AI controls content, Frontend controls layout
- Structured JSON responses, not conversational

---

## Gemini Model Selection

### Recommended: `gemini-2.5-flash` (via Vercel AI Gateway)

**Why this model:**
- Free tier: 15 RPM, 250k TPM, ~500 RPD
- Paid tier: $0.30/M input, $2.50/M output
- Fast response times (optimized for speed)
- Supports 1M token context window
- Perfect for structured JSON output
- Good balance of capability vs cost

**Alternative Options:**
| Model | Free Tier | Paid (per 1M tokens) | Best For |
|-------|-----------|---------------------|----------|
| `gemini-2.5-flash-lite` | 15 RPM, 1000 RPD | $0.10 input, $0.40 output | High volume, cost-sensitive |
| `gemini-2.5-flash` | 10 RPM, 500 RPD | $0.30 input, $2.50 output | Balanced (RECOMMENDED) |
| `gemini-2.5-pro` | 5 RPM, 100 RPD | $1.25 input, $10.00 output | Complex reasoning |

### Free Tier Limits (as of January 2026)
- **RPM (Requests Per Minute):** 5-15 depending on model
- **TPM (Tokens Per Minute):** 250,000
- **RPD (Requests Per Day):** 20-1000 depending on model
- **Note:** Free tier data may be used to improve Google products

---

## Integration with Vercel AI SDK v5

### Using the Vercel AI Gateway (Recommended - Zero Config)

The Vercel AI Gateway handles authentication automatically. No API key needed for supported models.

```typescript
// app/api/query/route.ts
import { generateObject } from 'ai';
import { z } from 'zod';

const knowledgePanelSchema = z.object({
  title: z.string(),
  type: z.enum(['summary', 'project_list', 'skills', 'resume', 'learning_path', 'failure', 'contact']),
  content: z.any(),
  suggestions: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const { query } = await req.json();

  const { object } = await generateObject({
    model: 'google/gemini-2.5-flash', // Vercel AI Gateway handles routing
    schema: knowledgePanelSchema,
    system: `You format portfolio information into structured JSON knowledge panels. 
You never chat. You never explain. You only output structured JSON based on the query.
Portfolio data: ${JSON.stringify(PORTFOLIO_DATA)}`,
    prompt: query,
    maxOutputTokens: 2000,
  });

  return Response.json(object);
}
```

### Direct Google AI Integration (Requires API Key)

If you need direct access or the Gateway doesn't support your use case:

```bash
# Install Google AI provider
npm install @ai-sdk/google
```

```typescript
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: google('gemini-2.5-flash'),
  // ... rest of config
});
```

Required environment variable:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

---

## System Prompt Design

```typescript
const SYSTEM_PROMPT = `You are a knowledge panel formatter for Shivam Gawali's portfolio.

RULES:
1. Output ONLY valid JSON matching the schema
2. Never use conversational language
3. Never explain or apologize
4. Select the most appropriate content type based on query
5. Include 2-3 related query suggestions

CONTENT TYPES:
- summary: paragraph + bullet points
- project_list: card grid data
- skills: categorized arrays
- resume: text block + download flag
- learning_path: timeline blocks
- failure: single story object
- contact: link objects

PORTFOLIO DATA:
${JSON.stringify(PORTFOLIO_DATA)}`;
```

---

## Response Schema

```typescript
interface KnowledgePanelResponse {
  title: string;
  type: 'summary' | 'project_list' | 'skills' | 'resume' | 'learning_path' | 'failure' | 'contact';
  content: SummaryContent | ProjectListContent | SkillsContent | ResumeContent | TimelineContent | StoryContent | ContactContent;
  suggestions?: string[];
}

// Content type examples
interface SummaryContent {
  paragraph: string;
  bullets: string[];
}

interface ProjectListContent {
  projects: Array<{
    name: string;
    tagline: string;
    achievement?: string;
    techniques?: string[];
  }>;
}

interface SkillsContent {
  categories: Array<{
    name: string;
    items: string[];
  }>;
}
```

---

## UI Behavior on Query

### Animation Flow (300ms total)
1. Background blur increases
2. Panel expands vertically (scale + fade)
3. Content loads with staggered fade
4. Skeleton cards shown during loading (no spinners)

### Design Constraints
- No page navigation (single panel expands)
- No chat bubbles or conversation log
- No AI personality or typing animation
- No conversational tone in responses

---

## Caching Strategy

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function getCachedOrFetch(query: string, fetcher: () => Promise<any>) {
  const normalized = query.toLowerCase().trim();
  const cached = cache.get(normalized);
  
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(normalized, { data, timestamp: Date.now() });
  return data;
}
```

For production, consider Redis:
```typescript
import { kv } from '@vercel/kv';

await kv.set(`query:${normalized}`, data, { ex: 21600 }); // 6 hours
const cached = await kv.get(`query:${normalized}`);
```

---

## Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 10; // requests per minute
const WINDOW = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/query')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW });
    return NextResponse.next();
  }

  if (record.count >= LIMIT) {
    return NextResponse.json(
      { error: 'Please wait before querying again.' },
      { status: 429 }
    );
  }

  record.count++;
  return NextResponse.next();
}
```

---

## Cost Estimation

### Free Tier Usage
- ~500 queries/day possible with gemini-2.5-flash
- Sufficient for portfolio showcase and moderate traffic

### Paid Tier (if needed)
For 1,000 queries/day with average 2,000 tokens each:
```
Monthly input: 1000 × 2000 × 30 = 60M tokens
Monthly output: 1000 × 500 × 30 = 15M tokens

Cost (gemini-2.5-flash):
Input: 60M × $0.30/M = $18
Output: 15M × $2.50/M = $37.50
Total: ~$55.50/month
```

With context caching (75% savings on repeated system prompts):
```
Estimated: ~$20-30/month
```

---

## Portfolio Data Structure

```typescript
const PORTFOLIO_DATA = {
  identity: {
    name: "Shivam Gawali",
    role: "AI & Data Science student",
    focus: ["Backend system design", "Correctness", "Learning through iteration"],
    philosophy: "I prefer understanding fundamentals deeply before moving to abstractions."
  },
  
  links: {
    github: "https://github.com/shiv669",
    linkedin: "https://www.linkedin.com/in/shivam-gawali-0b7122224",
    instagram: "https://www.instagram.com/thpersnshivam",
    holopin: "https://holopin.io/@shiv669"
  },
  
  projects: [
    {
      name: "Still",
      tagline: "A forum where answers expire unless they're still true.",
      theme: "Correctness over popularity",
      achievement: "Vercel x Foru.ms Hackathon Featured Winner"
    },
    {
      name: "Trace",
      tagline: "Detects interruptions and guides users back physically.",
      techniques: ["Kalman filtering", "Madgwick fusion", "Behavioral variance detection"],
      principles: ["Privacy first", "Local processing", "Human guidance over instruction"]
    },
    { name: "Ravel Core", type: "System design learning project" },
    { name: "Ravel Insights", type: "Applied ML monitoring exploration" }
  ],
  
  skills: {
    languages: ["JavaScript", "C", "C++", "SQL"],
    backend: ["Node.js", "Express", "REST APIs"],
    databases: ["SQLite", "MySQL"],
    frontend: ["React", "Vite"],
    tools: ["Git", "Docker", "Linux"],
    learning_focus: ["Relational modeling", "State invariants", "API correctness"]
  }
};
```

---

## Query Flow Diagram

```
User submits query
       ↓
  Cache lookup
       ↓
  ┌────┴────┐
  │         │
Hit       Miss
  │         │
  ↓         ↓
Return   Gemini API
cached   formats data
  │         │
  │         ↓
  │    Store in cache
  │         │
  └────┬────┘
       ↓
  Return to UI
       ↓
  UI renders template
```

---

## Content Filtering (Sensitive Content)

The search suggestions system already implements content filtering. For Gemini responses, add:

```typescript
const CONTENT_POLICY = `
CONTENT POLICY:
- Reject queries about: personal contact beyond provided links, private information, inappropriate content
- For off-topic queries, return: { "title": "Not Found", "type": "summary", "content": { "paragraph": "This query is outside the scope of this portfolio.", "bullets": [] } }
`;
```

---

## Files to Create

1. `app/api/query/route.ts` - Main Gemini API endpoint
2. `lib/portfolio-data.ts` - Portfolio JSON data
3. `lib/cache.ts` - Caching utilities
4. `lib/gemini-schema.ts` - Zod schemas for responses
5. `components/ui/knowledge-panel.tsx` - Result display component
6. `components/ui/panel-templates/` - Template components for each content type

---

## Environment Variables

```env
# Optional - Only if using direct Google AI integration
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# For production caching (optional)
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
```

---

## Next Steps

1. Create the API route with Gemini integration
2. Build the knowledge panel UI component
3. Create template components for each content type
4. Implement the expand/collapse animation
5. Add caching layer
6. Test with various queries
7. Add rate limiting for production
