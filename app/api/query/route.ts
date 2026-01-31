import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { fallbackResponses, mapQueryToFallback, type PanelResponse } from "@/lib/portfolio-data"
import { getCachedResponse, setCachedResponse, checkRateLimit, incrementDailyCallCount, isDailyQuotaExceeded } from "@/lib/cache"
import { ragSearch, formatContextForLLM } from "@/lib/rag/search"

const contentBlockSchema = z.object({
  type: z.enum(["text", "image", "bullets"]).describe("Type of content block"),
  text: z.string().optional().describe("Text content for text blocks"),
  highlightedWords: z
    .array(z.string())
    .max(5)
    .optional()
    .describe("Words to highlight with pointer effect (must exist in text)"),
  bullets: z.array(z.string()).max(6).optional().describe("Bullet points for bullets blocks"),
  imageUrl: z.string().optional().describe("Image URL from Unsplash for image blocks"),
  imageAlt: z.string().optional().describe("Alt text for image"),
})

const panelResponseSchema = z.object({
  title: z.string().describe("A clear, concise title for the result panel"),
  type: z
    .enum(["summary", "projects", "skills", "resume", "learning_path", "failure", "contact", "unknown"])
    .describe("The content type"),
  content: z.object({
    title: z.string(),
    description: z.string().describe("Main description text, 2-4 sentences max"),
    highlightedWords: z
      .array(z.string())
      .max(12)
      .describe("Important words/phrases to highlight with pointer animation (must exist exactly in description)"),
    bulletPoints: z.array(z.string()).max(6).optional().describe("Optional bullet points for lists"),
    contentBlocks: z
      .array(contentBlockSchema)
      .max(6)
      .optional()
      .describe("Optional structured content with images anywhere"),
    deeperContext: z.string().optional().describe("Additional context for 'Continue the thought' feature"),
  }),
  suggestions: z.array(z.string()).max(5).describe("Related queries to explore (max 3 preferred)"),
  canContinue: z.boolean().describe("Whether user can continue exploring this topic"),
  searchPlaceholder: z.string().max(50).describe("A short 5-6 word AI opinion/prompt for the follow-up search box placeholder"),
  citations: z.array(z.object({
    key: z.string().describe("Unique key matching [key] marker in description text"),
    title: z.string().describe("Preview card title"),
    subtitle: z.string().describe("Preview card subtitle/description"),
    imageUrl: z.string().describe("Image URL for preview card (use Unsplash or project image)"),
    link: z.string().optional().describe("URL to redirect when citation is clicked (GitHub repo, live site, LinkedIn, etc. from portfolio data)")
  })).max(4).optional().describe("Citations referenced in description as [key] markers")
})

// Base system prompt - context will be injected dynamically
const baseSystemPrompt = `You are a neutral, factual information retrieval system for Shivam Gawali's portfolio.

CRITICAL RULES:
1. You can ONLY use information from the RETRIEVED CONTEXT below
2. You MUST NOT invent, assume, or hallucinate ANY information
3. If the retrieved context doesn't answer the query, return type "unknown"
4. Keep descriptions concise (2-4 sentences max)
5. highlightedWords MUST be exact words/phrases that exist in your description
6. BE NEUTRAL AND HONEST - do not oversell or use promotional language
7. Present facts objectively without excessive praise or marketing speak
8. Acknowledge limitations - if something is a learning project, say so honestly
9. Use straightforward language, avoid words like "exceptional", "amazing", "outstanding"

TONE GUIDANCE:
- Write as a neutral third-party describing facts
- If something is work-in-progress or learning-focused, be transparent
- Avoid superlatives and promotional language
- Present achievements factually without exaggeration

POINTER HIGHLIGHT:
- The highlightedWords array creates animated pointer cursor effects
- Choose 2-4 most important terms that appear in the description
- Words MUST appear exactly as written in the description text

CITATIONS (STRICT LIMITS):
- MAXIMUM 3 CITATIONS TOTAL - be very selective!
- Only cite major projects mentioned in the retrieved context
- Use [key] markers in description text, provide matching citation objects
- Citation object format: {key, title, subtitle, imageUrl, link}
- imageUrl: Use Unsplash (e.g., https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=280&h=160&fit=crop)
- link: Include the relevant URL from portfolio data (GitHub repo, live site, LinkedIn, etc.)
  - For projects: use GitHub or live site URL from the project's links
  - For contact/social: use the platform URL (LinkedIn, GitHub profile, etc.)
- Example: "He built [still]" → citations: [{key: "still", title: "Still", subtitle: "...", imageUrl: "...", link: "https://github.com/shiv669/still"}]
- DO NOT cite common technologies like JavaScript, React, etc.

OUTPUT FORMAT:
- title: Clear, descriptive title
- type: Match to appropriate category  
- content.description: Factual, neutral summary with [key] citation markers where appropriate
- content.highlightedWords: Key terms that appear in description (excluding [key] markers)
- citations: Array of citation objects for each [key] used
- suggestions: 2-3 related topics the user might explore
- canContinue: true if more detail is available
- searchPlaceholder: A short 5-6 word engaging prompt for the follow-up search`

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

    // Rate limiting
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return Response.json(
        {
          success: false,
          error: `Rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
        },
        { status: 429 },
      )
    }

    const { query, context } = await req.json()

    if (!query || typeof query !== "string") {
      return Response.json({ success: false, error: "Query is required" }, { status: 400 })
    }

    const normalizedQuery = query.trim().toLowerCase()

    // Check cache
    const cacheKey = context ? `${normalizedQuery}__${context}` : normalizedQuery
    const cachedResponse = getCachedResponse(cacheKey)
    if (cachedResponse) {
      return Response.json({
        success: true,
        data: cachedResponse,
        cached: true,
      })
    }

    // Try RAG + Gemini API
    try {
      // Step 1: Semantic search to retrieve relevant chunks
      const searchResult = await ragSearch(query)

      // Check daily quota
      const isQuotaExceeded = isDailyQuotaExceeded()

      if (isQuotaExceeded) {
        console.log("Daily quota exceeded. Using RAG chunks directly.")

        // Use RAG chunks to build a fallback response
        if (searchResult.results.length > 0) {
          const topResult = searchResult.results[0]
          const topChunk = topResult.chunk

          const fallbackResponse: PanelResponse = {
            title: topChunk.source.projectName || "Related Information",
            type: searchResult.intent === "project" ? "projects" : "summary",
            content: {
              title: topChunk.source.projectName || "Search Result",
              description: topChunk.text.length > 400 ? topChunk.text.substring(0, 400) + "..." : topChunk.text,
              highlightedWords: [],
            },
            suggestions: ["Home", "Projects", "Skills"],
            canContinue: false,
            searchPlaceholder: "Checking GitHub...",
            citations: [{
              key: "source",
              title: topChunk.source.projectName || "Source",
              subtitle: "Indexed Content",
              imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=280&h=160&fit=crop"
            }]
          }

          return Response.json({
            success: true,
            data: fallbackResponse,
            cached: false,
            rag: {
              intent: searchResult.intent,
              chunksRetrieved: searchResult.results.length,
              fallbackUsed: true
            },
            quotaReached: true
          })
        }
      }

      // Step 2: Build dynamic system prompt with retrieved context
      const retrievedContext = formatContextForLLM(searchResult)
      console.log(`RAG Search: intent=${searchResult.intent}, chunks=${searchResult.results.length}, fallback=${searchResult.fallbackUsed}`)

      const systemPrompt = `${baseSystemPrompt}

RETRIEVED CONTEXT (This is your ONLY source of truth):
${retrievedContext}`

      // Step 3: Generate response with Gemini
      const prompt = context
        ? `Previous topic: "${context}"\nUser wants to know more: "${query}"\n\nProvide additional details based on the retrieved context. Be factual and neutral.`
        : `User query: "${query}"\n\nProvide relevant information from the retrieved context. Be factual and neutral in tone.`

      const { object } = await generateObject({
        model: google("gemini-3-flash-preview"),
        schema: panelResponseSchema,
        system: systemPrompt,
        prompt,
        maxRetries: 1,
      })

      // Increment quota only on success
      incrementDailyCallCount()

      const response = object as PanelResponse
      setCachedResponse(cacheKey, response)

      return Response.json({
        success: true,
        data: response,
        cached: false,
        rag: {
          intent: searchResult.intent,
          chunksRetrieved: searchResult.results.length,
          fallbackUsed: searchResult.fallbackUsed
        },
        quotaReached: false
      })
    } catch (geminiError) {
      console.error("Gemini API error, using fallback:", geminiError)

      // Fallback to pre-defined responses
      const fallbackKey = mapQueryToFallback(query)
      if (fallbackKey && fallbackResponses[fallbackKey]) {
        const fallbackResponse = fallbackResponses[fallbackKey]
        setCachedResponse(cacheKey, fallbackResponse)

        return Response.json({
          success: true,
          data: fallbackResponse,
          cached: false,
          fallback: true,
        })
      }

      // No matching fallback - return "no information"
      return Response.json({
        success: true,
        data: fallbackResponses.no_information,
        cached: false,
        fallback: true,
      })
    }
  } catch (error) {
    console.error("API error:", error)
    return Response.json({ success: false, error: "An error occurred" }, { status: 500 })
  }
}
