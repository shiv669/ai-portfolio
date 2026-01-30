// Lightweight intent classification using keyword heuristics
// No ML needed - just pattern matching

export type QueryIntent = "project" | "skills" | "contact" | "identity" | "dsa" | "creative" | "community" | "general"

interface IntentPattern {
    intent: QueryIntent
    keywords: string[]
    priority: number // Higher = checked first
}

const intentPatterns: IntentPattern[] = [
    // High priority - very specific
    {
        intent: "contact",
        keywords: ["contact", "email", "reach", "connect", "social", "linkedin", "github", "instagram", "links", "twitter", "devto", "leetcode"],
        priority: 10
    },
    {
        intent: "dsa",
        keywords: ["dsa", "leetcode", "algorithm", "data structure", "competitive", "coding practice"],
        priority: 10
    },

    // Medium priority - categorical
    {
        intent: "project",
        keywords: ["project", "projects", "built", "made", "created", "still", "trace", "trinera", "localaid", "ravel", "code review", "memory manager", "hackathon", "work", "portfolio"],
        priority: 5
    },
    {
        intent: "skills",
        keywords: ["skill", "skills", "tech", "technology", "stack", "languages", "know", "experience", "expertise", "javascript", "react", "node", "c++", "sql", "backend", "frontend", "database"],
        priority: 5
    },
    {
        intent: "creative",
        keywords: ["video", "editing", "creative", "after effects", "premiere", "capcut", "freelance", "visual"],
        priority: 5
    },
    {
        intent: "community",
        keywords: ["open source", "opensource", "contribution", "hacktoberfest", "goose", "community", "github contributions"],
        priority: 5
    },

    // Low priority - identity/general
    {
        intent: "identity",
        keywords: ["who", "about", "introduction", "intro", "summary", "shivam", "background", "philosophy", "approach", "learning style"],
        priority: 3
    }
]

/**
 * Classify query intent using keyword matching
 * Returns the most specific matching intent
 */
export function classifyIntent(query: string): QueryIntent {
    const q = query.toLowerCase().trim()

    // Sort by priority (highest first)
    const sortedPatterns = [...intentPatterns].sort((a, b) => b.priority - a.priority)

    for (const pattern of sortedPatterns) {
        if (pattern.keywords.some(kw => q.includes(kw))) {
            return pattern.intent
        }
    }

    return "general"
}

/**
 * Get chunk sections to search based on intent
 * Returns sections in order of relevance
 */
export function getSectionsForIntent(intent: QueryIntent): string[] {
    switch (intent) {
        case "project":
            return ["project", "identity"]
        case "skills":
            return ["skills", "identity"]
        case "contact":
            return ["contact"]
        case "identity":
            return ["identity"]
        case "dsa":
            return ["dsa", "skills"]
        case "creative":
            return ["creative", "identity"]
        case "community":
            return ["community", "identity"]
        case "general":
        default:
            // Search all sections for general queries
            return ["identity", "project", "skills", "creative", "community", "contact", "dsa"]
    }
}
