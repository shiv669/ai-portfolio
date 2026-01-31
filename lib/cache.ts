// Simple in-memory cache for responses
import type { CacheEntry, RateLimitEntry } from "./types"
import type { PanelResponse } from "./portfolio-data"

const responseCache = new Map<string, CacheEntry>()
const rateLimitMap = new Map<string, RateLimitEntry>()

const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
const RATE_LIMIT = 10 // queries per minute from single IP
const RATE_WINDOW = 60 * 1000 // 1 minute in milliseconds

// Global daily limit (resets on instance restart/deployment)
const DAILY_LIMIT = 12
let dailyCallCount = 0

export function isDailyQuotaExceeded(): boolean {
  return dailyCallCount >= DAILY_LIMIT
}

export function incrementDailyCallCount(): void {
  dailyCallCount++
}

export function getDailyCallCount(): number {
  return dailyCallCount
}

export function getCachedResponse(query: string): PanelResponse | null {
  const normalizedQuery = query.toLowerCase().trim()
  const entry = responseCache.get(normalizedQuery)

  if (!entry) return null

  // Check if cache is still valid
  if (Date.now() - entry.timestamp > entry.ttl) {
    responseCache.delete(normalizedQuery)
    return null
  }

  return entry.response
}

export function setCachedResponse(query: string, response: PanelResponse): void {
  const normalizedQuery = query.toLowerCase().trim()
  responseCache.set(normalizedQuery, {
    response,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  })
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_WINDOW,
    })
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW }
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetTime - now }
}
