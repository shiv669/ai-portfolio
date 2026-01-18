import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { portfolioData, fallbackResponses, mapQueryToFallback, type PanelResponse } from "@/lib/portfolio-data"
import { getCachedResponse, setCachedResponse, checkRateLimit } from "@/lib/cache"

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
      .max(5)
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
})

const systemPrompt = `You are a neutral, factual information retrieval system for Shivam Gawali's portfolio.

CRITICAL RULES:
1. You can ONLY use information from the provided portfolio data below
2. You MUST NOT invent, assume, or hallucinate ANY information
3. If the query asks about something not in the data, return type "unknown"
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

PORTFOLIO DATA (This is your ONLY source of truth):
${JSON.stringify(portfolioData, null, 2)}

OUTPUT FORMAT:
- title: Clear, descriptive title
- type: Match to appropriate category  
- content.description: Factual, neutral summary from portfolio data only
- content.highlightedWords: Key terms that appear in description
- content.bulletPoints: Optional list items
- suggestions: 2-3 related topics the user might explore
- canContinue: true if more detail is available in data`

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

    // Try Gemini API
    try {
      const prompt = context
        ? `Previous topic: "${context}"\nUser wants to know more: "${query}"\n\nProvide additional details or deeper information about this topic based on the portfolio data. Be factual and neutral.`
        : `User query: "${query}"\n\nProvide relevant information from the portfolio data. Be factual and neutral in tone.`

      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: panelResponseSchema,
        system: systemPrompt,
        prompt,
        maxRetries: 1, // Reduce retries to avoid quota issues
      })

      const response = object as PanelResponse
      setCachedResponse(cacheKey, response)

      return Response.json({
        success: true,
        data: response,
        cached: false,
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
