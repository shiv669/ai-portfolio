// Types for the AI Knowledge Panel system

export interface CacheEntry {
  response: import("./portfolio-data").PanelResponse
  timestamp: number
  ttl: number
}

export interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface SearchHistoryItem {
  query: string
  count: number
  lastSearched: number
}

export interface GeminiRequest {
  query: string
}

export interface GeminiResponse {
  success: boolean
  data?: import("./portfolio-data").PanelResponse
  error?: string
  cached?: boolean
}
