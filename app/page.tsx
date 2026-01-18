"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import SearchComponent from "@/components/ui/animated-glowing-search-bar"
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation"
import { PointerHighlight } from "@/components/ui/pointer-highlight"
import { ResultPanel, ResultPanelSkeleton } from "@/components/ui/result-panel"
import type { PanelResponse } from "@/lib/portfolio-data"

function HomeSkeleton() {
  return (
    <div className="h-full flex flex-col animate-pulse">
      {/* Hero skeleton */}
      <div className="relative w-full h-[35vh] sm:h-[40vh] md:h-[45vh] bg-sky-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/10 to-transparent" />
      </div>

      {/* Description skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-[600px] space-y-3">
          <div className="h-6 w-full rounded bg-sky-100/5" />
          <div className="h-6 w-4/5 mx-auto rounded bg-sky-100/5" />
          <div className="h-6 w-3/4 mx-auto rounded bg-sky-100/5" />
        </div>
      </div>

      {/* Search skeleton */}
      <div className="flex flex-col items-center justify-center pb-4 md:pb-12 pt-2 md:pt-4">
        <div className="w-full max-w-[280px] h-[46px] rounded-lg bg-sky-100/5 mb-3" />
        <div className="h-3 w-24 rounded bg-sky-100/5" />
      </div>
    </div>
  )
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<PanelResponse | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")
  const [queryHistory, setQueryHistory] = useState<string[]>([])

  // Check if hero image has loaded
  useEffect(() => {
    const heroImageUrl = "/images/shivam-gawali.jpg"
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setHeroImageLoaded(true)
    }
    img.onerror = () => {
      // Even if image fails, proceed after timeout
      setHeroImageLoaded(true)
    }
    img.src = heroImageUrl

    // Fallback timeout if image takes too long
    const timeout = setTimeout(() => {
      setHeroImageLoaded(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  // Only hide skeleton when hero image is loaded
  useEffect(() => {
    if (heroImageLoaded) {
      // Add small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [heroImageLoaded])

  const handleSearch = useCallback(async (query: string, context?: string) => {
    setIsSearching(true)
    setShowResult(true)
    setSearchResult(null)
    setCurrentQuery(query)
    setQueryHistory((prev) => [...prev, query])

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setSearchResult(data.data)
      } else {
        setSearchResult({
          title: "Error",
          type: "unknown",
          content: {
            title: "Error",
            description: data.error || "Something went wrong. Please try again.",
          },
          suggestions: ["Career summary", "Top projects", "Skills overview"],
          canContinue: false,
        })
      }
    } catch {
      setSearchResult({
        title: "Connection Error",
        type: "unknown",
        content: {
          title: "Connection Error",
          description: "Unable to connect. Please check your connection and try again.",
        },
        suggestions: ["Career summary", "Top projects", "Skills overview"],
        canContinue: false,
      })
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleContinue = useCallback(
    (query: string) => {
      handleSearch(query, currentQuery)
    },
    [handleSearch, currentQuery],
  )

  const handleBack = useCallback(() => {
    setShowResult(false)
    setSearchResult(null)
    setCurrentQuery("")
    setQueryHistory([])
  }, [])

  return (
    <div className="h-screen bg-[#0a0a0a] overflow-hidden">
      <main className="h-full flex flex-col relative">
        {isLoading ? (
          <HomeSkeleton />
        ) : showResult ? (
          // RESULT VIEW - Full screen with hero image
          <div className="h-full relative bg-[#0a0a0a]">
            {isSearching || !searchResult ? (
              <ResultPanelSkeleton />
            ) : (
              <ResultPanel
                data={searchResult}
                currentQuery={currentQuery}
                onContinue={handleContinue}
                onBack={handleBack}
              />
            )}
          </div>
        ) : (
          // HOME VIEW
          <>
            {/* Hero section with liquid animation */}
            <div className="relative w-full h-[35vh] sm:h-[40vh] md:h-[45vh] overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 w-8 pointer-events-none z-20"
                style={{
                  background: "linear-gradient(to right, rgba(125, 211, 252, 0.03) 0%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-8 pointer-events-none z-20"
                style={{
                  background: "linear-gradient(to left, rgba(125, 211, 252, 0.03) 0%, transparent 100%)",
                }}
              />
              <LiquidEffectAnimation />
            </div>

            {/* Description */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
              <p
                className="text-center text-lg md:text-xl lg:text-2xl leading-relaxed max-w-[700px] px-2 font-semibold tracking-tight"
                style={{ color: "rgba(186, 230, 253, 0.9)" }}
              >
                This is my portfolio. You can explore my projects, skills, experience, and learning journey using{" "}
                <PointerHighlight
                  rectangleClassName="border-sky-400/40"
                  pointerClassName="text-sky-400"
                  containerClassName="inline-block"
                >
                  <span className="text-sky-300 font-bold">AI-powered profile search</span>
                </PointerHighlight>
                .
              </p>
            </div>

            {/* Search section */}
            <div className="flex flex-col items-center justify-center pb-4 md:pb-12 pt-2 md:pt-4 relative">
              <div
                className="absolute left-0 right-0 h-[5px] z-0"
                style={{
                  top: "calc(50% - 20px)",
                  background:
                    "linear-gradient(to right, transparent 0%, rgba(125, 211, 252, 0.3) 15%, rgba(186, 230, 253, 0.25) 50%, rgba(125, 211, 252, 0.3) 85%, transparent 100%)",
                }}
              />

              <div className="w-full max-w-[400px] px-6 z-10 mb-3">
                <SearchComponent onSearch={handleSearch} isSearching={isSearching} />
              </div>

              <p className="text-xs tracking-wide z-10" style={{ color: "rgba(148, 163, 184, 0.6)", fontWeight: 400 }}>
                Powered by Gemini
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
