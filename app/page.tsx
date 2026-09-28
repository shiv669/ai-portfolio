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

function FlyRankBadge() {
  return (
    <a
      href="https://internship.flyrank.ai/verify?id=FR-D1-T668H-R789R&first_name=Shivam"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Verify Shiv's FlyRank AI Internship credential FR-D1-T668H-R789R"
      style={{
        boxSizing: "border-box",
        margin: "10px 0 0 0",
        padding: "6px 14px 6px 11px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "#051F21",
        textDecoration: "none",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
        fontStyle: "normal",
        lineHeight: "1.25",
        textTransform: "none",
        float: "none",
        WebkitFontSmoothing: "antialiased",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        borderRadius: "9999px",
        verticalAlign: "middle",
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="11"
        height="15"
        viewBox="26 18 44 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        style={{
          display: "block",
          flex: "none",
          opacity: "1",
          transform: "none",
          maxWidth: "none",
        }}
      >
        <path
          d="M28.2354 74.2202V67.9039C29.6419 68.4369 31.3724 68.7055 33.4311 68.7055C35.3235 68.7055 36.8153 68.2396 37.8979 67.3079C38.9805 66.3762 39.9566 64.8695 40.8218 62.792L42.6887 58.3139L29.8976 29.2879C35.0038 29.2879 39.6028 32.3307 41.5294 36.9893L47.0746 50.3985L56.0126 28.6038C57.9221 23.9452 62.5168 20.894 67.6187 20.894L50.0795 63.5936C48.4556 67.5933 46.5205 70.5102 44.2743 72.3484C42.0281 74.1867 39.1169 75.1058 35.5451 75.1058C32.6212 75.1058 30.1875 74.812 28.2354 74.2244Z"
          fill="#54E399"
        />
      </svg>

      <span
        style={{
          margin: "0",
          padding: "0",
          border: "0",
          background: "none",
          color: "#FFFFFF",
          fontWeight: "600",
          fontStyle: "normal",
          letterSpacing: "normal",
          textTransform: "none",
          textDecoration: "none",
          whiteSpace: "normal",
          float: "none",
          fontSize: "13px",
        }}
      >
        FlyRank verified
      </span>

      <span
        style={{
          margin: "0",
          padding: "0",
          border: "0",
          background: "rgba(255,255,255,0.1)",
          color: "inherit",
          fontWeight: "400",
          fontStyle: "normal",
          letterSpacing: "normal",
          textTransform: "none",
          textDecoration: "none",
          whiteSpace: "normal",
          float: "none",
          width: "1px",
          height: "14px",
          flex: "none",
        }}
      />

      <span
        style={{
          margin: "0",
          padding: "0",
          border: "0",
          background: "none",
          color: "rgba(255,255,255,0.55)",
          fontWeight: "400",
          fontStyle: "normal",
          letterSpacing: "normal",
          textTransform: "none",
          textDecoration: "none",
          whiteSpace: "normal",
          float: "none",
          fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
          fontSize: "11px",
        }}
      >
        FR-D1-T668H-R789R
      </span>
    </a>
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
    window.addEventListener("resize", checkDesktop)
    return () => window.removeEventListener("resize", checkDesktop)
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

  const handleSearch = useCallback(
    async (query: string, context?: string) => {
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
              description:
                data.error || "Something went wrong. Please try again.",
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
            description:
              "Unable to connect. Please check your connection and try again.",
          },
          suggestions: ["Career summary", "Top projects", "Skills overview"],
          canContinue: false,
          searchPlaceholder: "Check connection and retry...",
        })
      } finally {
        setIsSearching(false)
      }
    },
    [],
  )

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
    setBackgroundLoaded(false)
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
            /* RESULT VIEW */
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="h-full relative"
            >
              <EnergyBeamBackground
                blurred={!isSearching && !!searchResult && backgroundLoaded}
                blurIntensity={3}
                onLoaded={() => setBackgroundLoaded(true)}
              />

              {(isSearching || (searchResult && backgroundLoaded)) && (
                <SimplifiedResultPanel
                  description={searchResult?.content.description || ""}
                  searchPlaceholder={
                    searchResult?.searchPlaceholder || "Ask me anything..."
                  }
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
            /* HOME VIEW */
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="h-full"
            >
              {/* Mobile/Tablet Layout */}
              <div className="lg:hidden flex flex-col h-full">
                {/* Hero section */}
                <div className="relative w-full h-[35vh] sm:h-[40vh] md:h-[45vh] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 w-8 pointer-events-none z-20"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(125, 211, 252, 0.03) 0%, transparent 100%)",
                    }}
                  />

                  <div
                    className="absolute inset-y-0 right-0 w-8 pointer-events-none z-20"
                    style={{
                      background:
                        "linear-gradient(to left, rgba(125, 211, 252, 0.03) 0%, transparent 100%)",
                    }}
                  />

                  {!isDesktop && <LiquidEffectAnimation />}
                </div>

                {/* Description */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
                  <p
                    className="text-center text-lg md:text-xl leading-relaxed max-w-[700px] px-2 font-semibold tracking-tight"
                    style={{ color: "rgba(186, 230, 253, 0.9)" }}
                  >
                    This is my portfolio. You can explore my projects, skills,
                    experience, and learning journey using{" "}
                    <PointerHighlight
                      rectangleClassName="border-sky-400/40"
                      pointerClassName="text-sky-400"
                      containerClassName="inline-block"
                    >
                      <span className="text-sky-300 font-bold">
                        AI-powered profile search
                      </span>
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
                    <SearchComponent
                      onSearch={handleSearch}
                      isSearching={isSearching}
                    />
                  </div>

                  <p
                    className="text-xs tracking-wide z-10"
                    style={{
                      color: "rgba(148, 163, 184, 0.6)",
                      fontWeight: 400,
                    }}
                  >
                    Powered by Gemini
                  </p>

                  <div className="z-10">
                    <FlyRankBadge />
                  </div>
                </div>
              </div>

              {/* Laptop Layout */}
              <div className="hidden lg:flex h-full">
                {/* Left side */}
                <div className="relative w-[40%] h-full overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0">
                    {isDesktop && (
                      <LiquidEffectAnimation canvasId="liquid-canvas-desktop" />
                    )}
                  </div>

                  <div
                    className="absolute top-0 bottom-0 right-0 w-32 pointer-events-none z-20"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, #0a0a0a 100%)",
                    }}
                  />
                </div>

                {/* Right side */}
                <div className="w-[60%] h-full flex flex-col items-center justify-center px-8 xl:px-16">
                  {/* Description */}
                  <p
                    className="text-center text-2xl xl:text-3xl leading-relaxed max-w-[600px] font-semibold tracking-tight mb-10"
                    style={{ color: "rgba(186, 230, 253, 0.9)" }}
                  >
                    This is my portfolio. You can explore my projects, skills,
                    experience, and learning journey using{" "}
                    <PointerHighlight
                      rectangleClassName="border-sky-400/40"
                      pointerClassName="text-sky-400"
                      containerClassName="inline-block"
                    >
                      <span className="text-sky-300 font-bold">
                        AI-powered profile search
                      </span>
                    </PointerHighlight>
                    .
                  </p>

                  {/* Search section */}
                  <div className="flex flex-col items-center w-full max-w-[600px]">
                    <div className="w-full mb-4">
                      <SearchComponent
                        onSearch={handleSearch}
                        isSearching={isSearching}
                        desktopMode
                      />
                    </div>

                    <p
                      className="text-sm tracking-wide"
                      style={{
                        color: "rgba(148, 163, 184, 0.6)",
                        fontWeight: 400,
                      }}
                    >
                      Powered by Gemini
                    </p>

                    <FlyRankBadge />
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
