# API Contract

This document specifies the behavior of the portfolio's API endpoints. It defines inputs, outputs, and state transitions clearly so that behavior is predictable and verifiable.

---

## Overview

The portfolio uses a single API endpoint for search:

```
POST /api/query
```

This endpoint implements a RAG (Retrieval Augmented Generation) pipeline:
1. Classify query intent
2. Search relevant chunks via embeddings
3. Generate response with Gemini
4. Return structured result with citations

---

## POST /api/query

### Purpose

Process a natural language question about the portfolio and return a structured response with relevant information and citations.

---

### Request

```typescript
{
  query: string      // The user's question (required)
  context?: string   // Previous topic for follow-up questions (optional)
}
```

**Validation:**
- `query` must be a non-empty string
- `query` is normalized (trimmed, lowercased) for caching

---

### Response (Success)

```typescript
{
  success: true
  data: {
    title: string                    // Response title
    type: PanelType                  // Content category
    content: {
      title: string
      description: string            // Main text (may contain [key] markers)
      highlightedWords: string[]     // Words to highlight in UI
      bulletPoints?: string[]        // Optional list items
      deeperContext?: string         // Additional context for follow-up
    }
    suggestions: string[]            // Related queries to explore
    canContinue: boolean             // Whether more detail exists
    searchPlaceholder: string        // Placeholder for follow-up search
    citations?: Citation[]           // Referenced sources
  }
  cached: boolean                    // Whether response was from cache
  rag?: {                            // RAG metadata (when not cached)
    intent: QueryIntent              // Classified query intent
    chunksRetrieved: number          // Number of chunks used
    fallbackUsed: boolean            // Whether fallback was triggered
  }
}
```

---

### Response (Error)

```typescript
{
  success: false
  error: string      // Error message
}
```

**HTTP Status Codes:**
- `200` — Success (including fallback responses)
- `400` — Invalid request (missing query)
- `429` — Rate limit exceeded
- `500` — Server error

---

## Types

### PanelType

```typescript
type PanelType =
  | "summary"
  | "projects"
  | "skills"
  | "resume"
  | "learning_path"
  | "failure"
  | "contact"
  | "unknown"
```

### QueryIntent

```typescript
type QueryIntent =
  | "project"
  | "skills"
  | "contact"
  | "identity"
  | "dsa"
  | "creative"
  | "community"
  | "general"
```

### Citation

```typescript
interface Citation {
  key: string        // Matches [key] marker in description
  title: string      // Preview card title
  subtitle: string   // Preview card description
  imageUrl: string   // Preview image URL
  link?: string      // Clickable destination URL
}
```

---

## RAG Pipeline Behavior

### 1. Intent Classification

Query is classified using keyword heuristics before embedding:

| Intent | Keywords |
|--------|----------|
| contact | contact, email, linkedin, github, links |
| project | project, built, still, trace, trinera |
| skills | skill, tech, javascript, react, backend |
| identity | who, about, shivam, philosophy |
| dsa | dsa, leetcode, algorithm |
| creative | video, editing, after effects |
| community | open source, hacktoberfest, contributions |
| general | (default) |

### 2. Chunk Retrieval

- Chunks are filtered by intent category
- Query is embedded using `text-embedding-004`
- Cosine similarity computed against pre-computed chunk embeddings
- Only chunks with similarity ≥ 0.25 are included
- Top 3 chunks returned

### 3. Fallback Behavior

If no chunks pass the threshold:
- `fallbackUsed: true` in response
- Identity and philosophy chunks used as context
- Response indicates no strong match found

---

## Caching Behavior

### Cache Key

```
normalizedQuery + (context ? "__" + context : "")
```

### Cache Duration

Responses are cached in-memory with a TTL. Subsequent identical queries return cached results.

### Cache Indicators

- `cached: true` — Response served from cache
- `cached: false` — Fresh API call made

---

## Rate Limiting

### Limits

- Based on client IP address
- Limits applied per time window
- Returns 429 with reset time when exceeded

### Response (Rate Limited)

```typescript
{
  success: false
  error: "Rate limit exceeded. Please wait X seconds."
}
```

---

## Example Requests

### Basic Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What projects has Shivam built?"}'
```

### Follow-up Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me more", "context": "Still project"}'
```

---

## Chunk Structure

Each chunk in the RAG system has:

```typescript
interface Chunk {
  id: string           // Unique identifier
  text: string         // Searchable content
  source: {
    section: ChunkSection    // Category
    projectName?: string     // For project chunks
  }
}

type ChunkSection =
  | "identity"
  | "project"
  | "skills"
  | "creative"
  | "community"
  | "contact"
  | "dsa"
```

---

## Embedding Specification

| Property | Value |
|----------|-------|
| Model | text-embedding-004 |
| Dimensions | 768 |
| Storage | lib/rag/embeddings.json |
| Generation | npx tsx scripts/generate-embeddings.ts |

Embeddings are generated at build time, not runtime.

---

## Error Handling

### API Key Missing

If `GOOGLE_GENERATIVE_AI_API_KEY` is not set:
- Gemini calls fail
- Fallback responses used
- No error exposed to client

### Gemini Quota Exceeded

If Gemini API quota is exceeded:
- Fallback to pre-defined responses
- `fallback: true` in response
- Graceful degradation, not failure

### Invalid Query

If query is empty or invalid:
- 400 status code
- `success: false` with error message

---

## Invariants

1. **Query is always required** — No query, no response
2. **Citations match markers** — Every `[key]` in description has a matching citation
3. **Relevance is enforced** — Only chunks above threshold are used
4. **Fallback is graceful** — API never fails, only degrades
5. **Provenance is preserved** — Every chunk carries its source
