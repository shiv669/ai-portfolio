// Search utility functions for suggestion ranking and content filtering

// Default suggestions for first-time users
export const DEFAULT_SUGGESTIONS = [
  "Career summary",
  "Top projects",
  "Skills overview",
  "Failure story",
  "Learning path",
  "Resume format",
  "Contact information",
]

// Inappropriate content patterns (regex-based filtering)
const INAPPROPRIATE_PATTERNS = [
  /\b(porn|xxx|sex|nude|naked|adult|nsfw|hentai|erotic)\b/i,
  /\b(fuck|shit|ass|bitch|dick|cock|pussy|cunt)\b/i,
  /\b(drugs|cocaine|heroin|meth|weed|marijuana)\b/i,
  /\b(kill|murder|suicide|die|death threat)\b/i,
  /\b(racist|sexist|homophobic|slur)\b/i,
]

// Check if content is inappropriate
export function isInappropriate(text: string): boolean {
  return INAPPROPRIATE_PATTERNS.some((pattern) => pattern.test(text))
}

// Search history item type
export interface SearchHistoryItem {
  query: string
  count: number
  lastSearched: number
}

// Get search history from localStorage
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const history = localStorage.getItem("search_history")
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

// Save search to history
export function saveToHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return
  if (isInappropriate(query)) return // Don't save inappropriate searches

  const history = getSearchHistory()
  const normalizedQuery = query.trim().toLowerCase()
  const existingIndex = history.findIndex((item) => item.query.toLowerCase() === normalizedQuery)

  if (existingIndex >= 0) {
    // Increment count and update timestamp
    history[existingIndex].count += 1
    history[existingIndex].lastSearched = Date.now()
  } else {
    // Add new search
    history.push({
      query: query.trim(),
      count: 1,
      lastSearched: Date.now(),
    })
  }

  // Keep only last 100 searches
  const sortedHistory = history.sort((a, b) => b.lastSearched - a.lastSearched).slice(0, 100)

  localStorage.setItem("search_history", JSON.stringify(sortedHistory))
}

// Calculate suggestion score (Google-like ranking)
function calculateScore(item: SearchHistoryItem, currentTime: number): number {
  const recencyWeight = 0.4
  const frequencyWeight = 0.6

  // Time decay factor (searches within last hour get higher score)
  const hoursSinceSearch = (currentTime - item.lastSearched) / (1000 * 60 * 60)
  const recencyScore = Math.exp(-hoursSinceSearch / 24) // Decay over 24 hours

  // Frequency score with diminishing returns
  const frequencyScore = Math.log10(item.count + 1)

  return recencyWeight * recencyScore + frequencyWeight * frequencyScore
}

// Get ranked suggestions based on search history and input
export function getSuggestions(input: string): string[] {
  const history = getSearchHistory()
  const currentTime = Date.now()
  const normalizedInput = input.trim().toLowerCase()

  if (!normalizedInput) {
    // No input - show ranked history or defaults
    if (history.length === 0) {
      return DEFAULT_SUGGESTIONS
    }

    // Rank by score and return top suggestions
    const rankedHistory = history
      .map((item) => ({
        ...item,
        score: calculateScore(item, currentTime),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map((item) => item.query)

    // Fill with defaults if needed
    const remaining = DEFAULT_SUGGESTIONS.filter(
      (def) => !rankedHistory.some((h) => h.toLowerCase() === def.toLowerCase()),
    )

    return [...rankedHistory, ...remaining].slice(0, 7)
  }

  // Filter and rank based on input
  const matchingHistory = history
    .filter((item) => item.query.toLowerCase().includes(normalizedInput))
    .map((item) => ({
      ...item,
      score: calculateScore(item, currentTime),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.query)

  // Add matching defaults
  const matchingDefaults = DEFAULT_SUGGESTIONS.filter(
    (def) =>
      def.toLowerCase().includes(normalizedInput) &&
      !matchingHistory.some((h) => h.toLowerCase() === def.toLowerCase()),
  )

  return [...matchingHistory, ...matchingDefaults].slice(0, 7)
}

// Clear search history
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("search_history")
}
