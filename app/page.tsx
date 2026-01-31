"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import SearchComponent from "@/components/ui/animated-glowing-search-bar"
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation"
import { PointerHighlight } from "@/components/ui/pointer-highlight"
import EnergyBeamBackground from "@/components/ui/energy-beam-background"
import SimplifiedResultPanel from "@/components/ui/simplified-result-panel"
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
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [quotaReached, setQuotaReached] = useState(false)

  // Detect if on desktop (lg breakpoint = 1024px)
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

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
    setQuotaReached(false)
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
        setQuotaReached(!!data.quotaReached)
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
          searchPlaceholder: "Try asking something else...",
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
        searchPlaceholder: "Check connection and retry...",
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
    setBackgroundLoaded(false) // Reset so it loads fresh next time
  }, [])

  return (
    <div className="h-screen bg-[#0a0a0a] overflow-hidden">
      <main className="h-full flex flex-col relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-50"
            >
              <HomeSkeleton />
            </motion.div>
          ) : showResult ? (
            /* RESULT VIEW - Only EnergyBeamBackground renders */
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="h-full relative"
            >
              {/* Energy Beam Background - ONLY rendered in result view */}
              <EnergyBeamBackground
                blurred={!isSearching && !!searchResult && backgroundLoaded}
                blurIntensity={3}
                onLoaded={() => setBackgroundLoaded(true)}
              />

              {/* Result Content Overlay */}
              {(isSearching || (searchResult && backgroundLoaded)) && (
                <SimplifiedResultPanel
                  description={searchResult?.content.description || ""}
                  searchPlaceholder={searchResult?.searchPlaceholder || "Ask me anything..."}
                  isLoading={isSearching}
                  onSearch={(query) => handleSearch(query, currentQuery)}
                  onHome={handleBack}
                  isSearching={isSearching}
                  citations={searchResult?.citations}
                  quotaReached={quotaReached}
                />
              )}
            </motion.div>
          ) : (
            /* HOME VIEW - Only LiquidEffectAnimation renders */
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="h-full"
            >
              {/* Mobile/Tablet Layout (default) - stacked */}
              <div className="lg:hidden flex flex-col h-full">
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
                  {/* Only mount on mobile */}
                  {!isDesktop && <LiquidEffectAnimation />}
                </div>

                {/* Description */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
                  <p
                    className="text-center text-lg md:text-xl leading-relaxed max-w-[700px] px-2 font-semibold tracking-tight"
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

                {/* Search section with decorative line (mobile only) */}
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
              </div>

              {/* Laptop Layout (lg: and up) - side by side */}
              <div className="hidden lg:flex h-full">
                {/* Left side - Image with liquid animation (40%) */}
                <div className="relative w-[40%] h-full overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0">
                    {/* Only mount on desktop */}
                    {isDesktop && <LiquidEffectAnimation canvasId="liquid-canvas-desktop" />}
                  </div>
                  {/* Right fade (instead of bottom fade) */}
                  <div
                    className="absolute top-0 bottom-0 right-0 w-32 pointer-events-none z-20"
                    style={{
                      background: "linear-gradient(to right, transparent 0%, #0a0a0a 100%)",
                    }}
                  />
                </div>

                {/* Right side - Content (60%) */}
                <div className="w-[60%] h-full flex flex-col items-center justify-center px-8 xl:px-16">
                  {/* Description */}
                  <p
                    className="text-center text-2xl xl:text-3xl leading-relaxed max-w-[600px] font-semibold tracking-tight mb-10"
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

                  {/* Search section (no decorative line on laptop) */}
                  <div className="flex flex-col items-center w-full max-w-[600px]">
                    <div className="w-full mb-4">
                      <SearchComponent onSearch={handleSearch} isSearching={isSearching} desktopMode />
                    </div>

                    <p className="text-sm tracking-wide" style={{ color: "rgba(148, 163, 184, 0.6)", fontWeight: 400 }}>
                      Powered by Gemini
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
