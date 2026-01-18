"use client"

import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { motion } from "motion/react"
import { PointerHighlight } from "./pointer-highlight"
import { contentImages } from "@/lib/portfolio-data"

export interface ContentBlock {
  type: "text" | "image" | "bullets"
  text?: string
  highlightedWords?: string[]
  bullets?: string[]
  imageUrl?: string
  imageAlt?: string
}

export interface ResultContent {
  title: string
  description: string
  highlightedWords?: string[]
  bulletPoints?: string[]
  contentBlocks?: ContentBlock[]
  deeperContext?: string
}

export interface PanelResponse {
  title: string
  type: string
  content: ResultContent
  suggestions: string[]
  canContinue: boolean
}

interface ResultPanelProps {
  data: PanelResponse
  currentQuery: string
  onContinue: (query: string) => void
  onBack: () => void
}

// Hover preview data for links
interface PreviewData {
  image: string
  title: string
  subtitle: string
}

const hoverPreviewData: Record<string, PreviewData> = {
  github: {
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=280&h=160&fit=crop",
    title: "GitHub Profile",
    subtitle: "View projects and contributions",
  },
  linkedin: {
    image: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=280&h=160&fit=crop",
    title: "LinkedIn",
    subtitle: "Professional network profile",
  },
  still: {
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=280&h=160&fit=crop",
    title: "Still",
    subtitle: "Forum where answers expire",
  },
  trace: {
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=280&h=160&fit=crop",
    title: "Trace",
    subtitle: "Cognitive continuity system",
  },
  nodejs: {
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=280&h=160&fit=crop",
    title: "Node.js",
    subtitle: "Backend JavaScript runtime",
  },
  react: {
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=280&h=160&fit=crop",
    title: "React",
    subtitle: "Frontend UI library",
  },
}

function getPreviewForWord(word: string): PreviewData | null {
  const lowered = word.toLowerCase()
  for (const [key, data] of Object.entries(hoverPreviewData)) {
    if (lowered.includes(key)) {
      return data
    }
  }
  return null
}

// Hero Image with Liquid/Water Effect
function LiquidHeroImage({
  type,
  dominantColor,
  onBack
}: {
  type: string
  dominantColor: string
  onBack: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const image = contentImages[type] || contentImages.summary
  const canvasId = `liquid-hero-${type}`

  useEffect(() => {
    if (!canvasRef.current) return

    const appKey = `__liquidApp_${canvasId}`

    // Clean up previous instance
    if (window[appKey] && window[appKey].dispose) {
      window[appKey].dispose()
    }

    const script = document.createElement("script")
    script.type = "module"
    script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      
      const canvas = document.getElementById('${canvasId}');
      if (canvas) {
        try {
          const app = LiquidBackground(canvas);
          app.loadImage('${image.url}');
          app.liquidPlane.material.metalness = 0.2;
          app.liquidPlane.material.roughness = 0.8;
          app.liquidPlane.uniforms.displacementScale.value = 5;
          if (app.scene && app.scene.children) {
            app.scene.children.forEach(child => {
              if (child.isLight) {
                child.intensity = child.intensity * 0.3;
              }
            });
          }
          app.setRain(false);
          window['${appKey}'] = app;
        } catch (e) {
          console.error('[v0] LiquidHero error:', e);
        }
      }
    `
    document.body.appendChild(script)

    return () => {
      if (window[appKey] && window[appKey].dispose) {
        window[appKey].dispose()
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [image.url, canvasId])

  return (
    <div className="relative w-full h-[35vh] sm:h-[40vh] md:h-[45vh] overflow-hidden">
      {/* Canvas for liquid effect */}
      <canvas
        ref={canvasRef}
        id={canvasId}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bottom gradient fade - like initial screen */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${dominantColor} 0%, ${dominantColor}cc 20%, ${dominantColor}66 50%, transparent 100%)`,
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 rounded-lg transition-all duration-200 hover:bg-white/10 z-10"
        style={{ color: "rgba(255,255,255,0.8)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  )
}

// Hover Link Component with preview card
function HoverLink({
  word,
  preview,
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}: {
  word: string
  preview: PreviewData
  onHoverStart: (preview: PreviewData, e: React.MouseEvent) => void
  onHoverMove: (e: React.MouseEvent) => void
  onHoverEnd: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <span
      className="text-sky-300 font-bold cursor-pointer relative inline-block transition-colors duration-300 hover:text-sky-200"
      onMouseEnter={(e) => {
        setIsHovered(true)
        onHoverStart(preview, e)
      }}
      onMouseMove={onHoverMove}
      onMouseLeave={() => {
        setIsHovered(false)
        onHoverEnd()
      }}
    >
      {word}
      <span
        className="absolute bottom-[-2px] left-0 h-[2px] transition-all duration-400"
        style={{
          width: isHovered ? "100%" : "0",
          background: "linear-gradient(90deg, #38bdf8, #7dd3fc, #a5f3fc)",
        }}
      />
    </span>
  )
}

// Preview Card Component
function PreviewCard({
  data,
  position,
  isVisible,
}: {
  data: PreviewData | null
  position: { x: number; y: number }
  isVisible: boolean
}) {
  if (!data) return null

  return (
    <div
      className={`fixed pointer-events-none z-[1000] transition-all duration-250 ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
        }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="rounded-2xl p-2 overflow-hidden backdrop-blur-xl"
        style={{
          background: "rgba(26, 26, 26, 0.95)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 60px rgba(255, 107, 107, 0.1)",
        }}
      >
        <img
          src={data.image || "/placeholder.svg"}
          alt={data.title}
          className="w-[280px] h-auto rounded-lg"
          crossOrigin="anonymous"
        />
        <div
          className="px-2 pt-3 pb-1 text-sm text-white font-semibold"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {data.title}
        </div>
        <div className="px-2 pb-2 text-xs text-gray-400">
          {data.subtitle}
        </div>
      </div>
    </div>
  )
}

// Text with highlighted words (using PointerHighlight or HoverLink)
function HighlightedText({
  text,
  highlightedWords = [],
  onHoverStart,
  onHoverMove,
  onHoverEnd,
}: {
  text: string
  highlightedWords?: string[]
  onHoverStart: (preview: PreviewData, e: React.MouseEvent) => void
  onHoverMove: (e: React.MouseEvent) => void
  onHoverEnd: () => void
}) {
  if (!text) return null

  if (highlightedWords.length === 0) {
    return <span>{text}</span>
  }

  const segments: { text: string; isHighlighted: boolean; preview: PreviewData | null }[] = []
  let lastIndex = 0

  const wordPositions = highlightedWords
    .map((word) => ({
      word,
      index: text.toLowerCase().indexOf(word.toLowerCase()),
    }))
    .filter((wp) => wp.index !== -1)
    .sort((a, b) => a.index - b.index)

  wordPositions.forEach(({ word, index }) => {
    if (index > lastIndex) {
      segments.push({ text: text.substring(lastIndex, index), isHighlighted: false, preview: null })
    }
    const preview = getPreviewForWord(word)
    segments.push({
      text: text.substring(index, index + word.length),
      isHighlighted: true,
      preview,
    })
    lastIndex = index + word.length
  })

  if (lastIndex < text.length) {
    segments.push({ text: text.substring(lastIndex), isHighlighted: false, preview: null })
  }

  return (
    <>
      {segments.map((segment, idx) =>
        segment.isHighlighted ? (
          segment.preview ? (
            <HoverLink
              key={idx}
              word={segment.text}
              preview={segment.preview}
              onHoverStart={onHoverStart}
              onHoverMove={onHoverMove}
              onHoverEnd={onHoverEnd}
            />
          ) : (
            <PointerHighlight
              key={idx}
              rectangleClassName="border-sky-400/40"
              pointerClassName="text-sky-400"
              containerClassName="inline-block"
            >
              <span className="text-sky-300 font-bold">{segment.text}</span>
            </PointerHighlight>
          )
        ) : (
          <span key={idx}>{segment.text}</span>
        ),
      )}
    </>
  )
}

export function ResultPanel({ data, currentQuery, onContinue, onBack }: ResultPanelProps) {
  const [activePreview, setActivePreview] = useState<PreviewData | null>(null)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  const image = contentImages[data.type] || contentImages.summary
  const dominantColor = image.dominantColor || "#0a0a0a"

  // Preload preview images
  useEffect(() => {
    Object.values(hoverPreviewData).forEach((hoverData) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = hoverData.image
    })
  }, [])

  const updatePosition = useCallback((e: React.MouseEvent) => {
    const cardWidth = 300
    const cardHeight = 220
    const offsetY = 20

    let x = e.clientX - cardWidth / 2
    let y = e.clientY - cardHeight - offsetY

    if (x + cardWidth > window.innerWidth - 20) {
      x = window.innerWidth - cardWidth - 20
    }
    if (x < 20) x = 20
    if (y < 20) y = e.clientY + offsetY

    setPreviewPosition({ x, y })
  }, [])

  const handleHoverStart = useCallback((preview: PreviewData, e: React.MouseEvent) => {
    setActivePreview(preview)
    setIsPreviewVisible(true)
    updatePosition(e)
  }, [updatePosition])

  const handleHoverMove = useCallback((e: React.MouseEvent) => {
    if (isPreviewVisible) {
      updatePosition(e)
    }
  }, [isPreviewVisible, updatePosition])

  const handleHoverEnd = useCallback(() => {
    setIsPreviewVisible(false)
  }, [])

  const handleContinue = () => {
    // Use the title from the response for better context
    const topic = data.title || currentQuery
    onContinue(`Tell me more details about ${topic}`)
  }

  return (
    <div
      className="h-full flex flex-col relative"
      style={{
        background: `linear-gradient(180deg, ${dominantColor} 0%, ${dominantColor}dd 30%, #0a0a0a 70%, #0a0a0a 100%)`,
      }}
    >
      {/* Ambient glow that matches dominant color */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${dominantColor}40 0%, transparent 70%)`,
          animation: "pulse-glow 8s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* Hero image with liquid/water effect */}
      <LiquidHeroImage type={data.type} dominantColor={dominantColor} onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-[900px] mx-auto px-6 md:px-10 py-8">
          {/* Title - same style as main page */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-6"
            style={{ color: "rgba(255, 255, 255, 0.95)" }}
          >
            {data.title}
          </motion.h1>

          {/* Description - same style as main page "This is my portfolio..." text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl leading-relaxed font-semibold tracking-tight mb-8"
            style={{ color: "rgba(186, 230, 253, 0.9)" }}
          >
            <HighlightedText
              text={data.content.description}
              highlightedWords={data.content.highlightedWords}
              onHoverStart={handleHoverStart}
              onHoverMove={handleHoverMove}
              onHoverEnd={handleHoverEnd}
            />
          </motion.div>

          {/* Bullet points - same style as main page text */}
          {data.content.bulletPoints && data.content.bulletPoints.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-3 mb-8"
            >
              {data.content.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-sky-400/60" />
                  <span
                    className="text-base md:text-lg lg:text-xl leading-relaxed font-medium tracking-tight"
                    style={{ color: "rgba(186, 230, 253, 0.8)" }}
                  >
                    {point}
                  </span>
                </li>
              ))}
            </motion.ul>
          )}

          {/* Content blocks with images */}
          {data.content.contentBlocks?.map((block, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 + idx * 0.15 }}
            >
              {block.type === "text" && block.text && (
                <p
                  className="text-lg md:text-xl lg:text-2xl leading-relaxed font-semibold tracking-tight mb-6"
                  style={{ color: "rgba(186, 230, 253, 0.9)" }}
                >
                  <HighlightedText
                    text={block.text}
                    highlightedWords={block.highlightedWords}
                    onHoverStart={handleHoverStart}
                    onHoverMove={handleHoverMove}
                    onHoverEnd={handleHoverEnd}
                  />
                </p>
              )}
              {block.type === "image" && block.imageUrl && (
                <div style={{ position: "relative", width: "100%", overflow: "hidden", margin: "2rem 0", borderRadius: "12px" }}>
                  <motion.img
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    src={block.imageUrl}
                    alt={block.imageAlt || data.title}
                    style={{ width: "100%", height: "auto", objectFit: "cover", maxHeight: "280px" }}
                    crossOrigin="anonymous"
                  />
                  {/* Bottom fade for inline images */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "64px",
                      pointerEvents: "none",
                      background: "linear-gradient(to top, #0a0a0a 0%, transparent 100%)",
                    }}
                  />
                </div>
              )}
              {block.type === "bullets" && block.bullets && (
                <ul className="space-y-3 mb-6">
                  {block.bullets.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-sky-400/60" />
                      <span
                        className="text-base md:text-lg lg:text-xl leading-relaxed font-medium tracking-tight"
                        style={{ color: "rgba(186, 230, 253, 0.8)" }}
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}

          {/* Continue the thought button */}
          {data.canContinue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 mb-8"
            >
              <button
                onClick={handleContinue}
                className="flex items-center gap-3 group cursor-pointer bg-transparent border-none p-0"
              >
                <div className="w-0.5 h-6 bg-sky-500/80 group-hover:h-8 transition-all duration-300" />
                <span
                  className="text-base md:text-lg tracking-wide transition-colors duration-300 group-hover:text-sky-400/80"
                  style={{ color: "rgba(148, 163, 184, 0.6)", fontWeight: 400 }}
                >
                  Continue the thought...
                </span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Preview Card */}
      <PreviewCard
        data={activePreview}
        position={previewPosition}
        isVisible={isPreviewVisible}
      />
    </div>
  )
}

// Skeleton loader for result panel
export function ResultPanelSkeleton() {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-[#0a0a0a]">
      {/* Hero skeleton */}
      <div className="w-full h-[35vh] sm:h-[40vh] md:h-[45vh] bg-sky-900/10 animate-pulse" />

      {/* Content skeleton */}
      <div className="flex-1 px-6 md:px-10 py-8 max-w-[900px] mx-auto w-full">
        <div className="h-12 md:h-14 w-3/4 rounded-lg bg-white/5 mb-8 animate-pulse" />
        <div className="space-y-4 mb-8">
          <div className="h-6 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-6 w-5/6 rounded bg-white/5 animate-pulse" />
          <div className="h-6 w-4/5 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
          <div className="h-5 w-2/3 rounded bg-white/5 animate-pulse" />
          <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 mt-12">
          <div className="w-0.5 h-6 bg-sky-500/20" />
          <div className="h-5 w-40 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    [key: string]: any
  }
}
