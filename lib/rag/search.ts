// Semantic search with embeddings and similarity threshold
// Uses pre-computed embeddings from embeddings.json

import { Chunk, chunks } from './chunks'
import { classifyIntent, getSectionsForIntent, QueryIntent } from './intent'
import { google } from '@ai-sdk/google'
import { embedMany, embed } from 'ai'

// Similarity threshold - chunks below this are discarded
const SIMILARITY_THRESHOLD = 0.25
const TOP_K = 3

export interface SearchResult {
    chunk: Chunk
    score: number
}

export interface RAGSearchResult {
    intent: QueryIntent
    results: SearchResult[]
    fallbackUsed: boolean
}

// Store embeddings in memory (loaded from JSON or generated)
let chunkEmbeddings: Map<string, number[]> | null = null

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
}

/**
 * Load pre-computed embeddings from JSON
 * Falls back to generating on-the-fly if not available
 */
export async function loadEmbeddings(): Promise<Map<string, number[]>> {
    if (chunkEmbeddings) return chunkEmbeddings

    try {
        // Try to load from JSON file
        const embeddingsData = await import('./embeddings.json')
        chunkEmbeddings = new Map(Object.entries(embeddingsData.default || embeddingsData))
        console.log(`Loaded ${chunkEmbeddings.size} pre-computed embeddings`)
        return chunkEmbeddings
    } catch {
        console.log('No pre-computed embeddings found, will generate on-demand')
        chunkEmbeddings = new Map()
        return chunkEmbeddings
    }
}

/**
 * Get or generate embedding for a chunk
 */
async function getChunkEmbedding(chunk: Chunk): Promise<number[]> {
    const embeddings = await loadEmbeddings()

    if (embeddings.has(chunk.id)) {
        return embeddings.get(chunk.id)!
    }

    // Generate if not cached
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: chunk.text
    })

    embeddings.set(chunk.id, embedding)
    return embedding
}

/**
 * Embed a search query
 */
async function embedQuery(query: string): Promise<number[]> {
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: query
    })
    return embedding
}

/**
 * Get fallback chunks (identity + philosophy) when no good matches
 */
function getFallbackChunks(): Chunk[] {
    return chunks.filter(c =>
        c.id === 'identity-about' ||
        c.id === 'identity-philosophy'
    )
}

/**
 * Main RAG search function
 * 1. Classify intent
 * 2. Filter chunks by intent
 * 3. Compute similarity scores
 * 4. Return top-K above threshold
 */
export async function ragSearch(query: string): Promise<RAGSearchResult> {
    // Step 1: Classify intent
    const intent = classifyIntent(query)
    const relevantSections = getSectionsForIntent(intent)

    // Step 2: Filter chunks by intent
    const relevantChunks = chunks.filter(c =>
        relevantSections.includes(c.source.section)
    )

    // Step 3: Embed query
    const queryEmbedding = await embedQuery(query)

    // Step 4: Compute similarity for each chunk
    const results: SearchResult[] = []

    for (const chunk of relevantChunks) {
        const chunkEmbedding = await getChunkEmbedding(chunk)
        const score = cosineSimilarity(queryEmbedding, chunkEmbedding)

        // Only include if above threshold
        if (score >= SIMILARITY_THRESHOLD) {
            results.push({ chunk, score })
        }
    }

    // Step 5: Sort by score and take top-K
    results.sort((a, b) => b.score - a.score)
    const topResults = results.slice(0, TOP_K)

    // Step 6: Fallback if no results above threshold
    if (topResults.length === 0) {
        const fallbackChunks = getFallbackChunks()
        return {
            intent,
            results: fallbackChunks.map(c => ({ chunk: c, score: 0 })),
            fallbackUsed: true
        }
    }

    return {
        intent,
        results: topResults,
        fallbackUsed: false
    }
}

/**
 * Format search results as context for Gemini
 */
export function formatContextForLLM(searchResult: RAGSearchResult): string {
    const { intent, results, fallbackUsed } = searchResult

    let context = `Query Intent: ${intent}\n`

    if (fallbackUsed) {
        context += `Note: No strong matches found. Using general overview.\n\n`
    }

    context += `Retrieved Context:\n`

    for (const { chunk, score } of results) {
        const sourceLabel = chunk.source.projectName
            ? `${chunk.source.section}/${chunk.source.projectName}`
            : chunk.source.section

        context += `\n[Source: ${sourceLabel}] (relevance: ${(score * 100).toFixed(0)}%)\n`
        context += chunk.text + '\n'
    }

    return context
}
