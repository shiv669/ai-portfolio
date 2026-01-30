"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { motion } from "motion/react"
import SearchComponent from "./animated-glowing-search-bar"

// Shining text animation component
function ShiningText({ text }: { text: string }) {
    return (
        <motion.p
            className="bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-xl md:text-2xl lg:text-3xl font-medium text-transparent"
            initial={{ backgroundPosition: "200% 0" }}
            animate={{ backgroundPosition: "-200% 0" }}
            transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
            }}
        >
            {text}
        </motion.p>
    )
}

// Citation type
export interface Citation {
    key: string
    title: string
    subtitle: string
    imageUrl: string
    link?: string
}

interface SimplifiedResultProps {
    /** The AI-generated description text (may contain [key] citation markers) */
    description: string
    /** Placeholder text for the follow-up search */
    searchPlaceholder: string
    /** Whether the result is currently loading */
    isLoading?: boolean
    /** Callback when user performs a follow-up search */
    onSearch: (query: string) => void
    /** Callback when user wants to go home */
    onHome: () => void
    /** Whether a search is currently in progress */
    isSearching?: boolean
    /** Citations from AI response */
    citations?: Citation[]
}

// Hover link component for citations
const HoverLink = ({
    children,
    link,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
}: {
    children: React.ReactNode
    link?: string
    onHoverStart: (e: React.MouseEvent) => void
    onHoverMove: (e: React.MouseEvent) => void
    onHoverEnd: () => void
}) => {
    const baseProps = {
        className: `text-white font-semibold cursor-pointer relative inline-block transition-colors duration-300 hover:text-sky-300 ${link ? 'underline-offset-4' : ''}`,
        style: {
            textDecoration: 'none',
            borderBottom: '2px solid transparent',
            backgroundImage: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb)',
            backgroundSize: '0% 2px',
            backgroundPosition: '0 100%',
            backgroundRepeat: 'no-repeat',
            transition: 'background-size 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.3s ease'
        } as React.CSSProperties,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            (e.target as HTMLElement).style.backgroundSize = '100% 2px'
            onHoverStart(e)
        },
        onMouseMove: onHoverMove,
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
            (e.target as HTMLElement).style.backgroundSize = '0% 2px'
            onHoverEnd()
        }
    }

    if (link) {
        return (
            <a
                {...baseProps}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </a>
        )
    }

    return (
        <span {...baseProps}>
            {children}
        </span>
    )
}

// Preview card component
const PreviewCard = ({
    data,
    position,
    isVisible,
}: {
    data: Citation | null
    position: { x: number; y: number }
    isVisible: boolean
}) => {
    if (!data) return null

    return (
        <div
            className={`fixed pointer-events-none z-[1000] transition-all duration-250 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2.5 scale-95'
                }`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                willChange: 'transform, opacity'
            }}
        >
            <div
                className="rounded-2xl p-2 overflow-hidden"
                style={{
                    background: '#1a1a1a',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 60px rgba(56, 189, 248, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <img
                    src={data.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=280&h=160&fit=crop"}
                    alt={data.title}
                    className="w-[280px] h-auto rounded-xl block"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
                <div className="px-2 pt-3 pb-2 text-white font-semibold text-sm">
                    {data.title}
                </div>
                <div className="px-2 pb-2 text-gray-400 text-xs">
                    {data.subtitle}
                </div>
            </div>
        </div>
    )
}

// Parse text with [key] markers and replace with HoverLink components
function parseTextWithCitations(
    text: string,
    citations: Citation[],
    onHoverStart: (citation: Citation, e: React.MouseEvent) => void,
    onHoverMove: (e: React.MouseEvent) => void,
    onHoverEnd: () => void
): React.ReactNode[] {
    const citationMap = new Map(citations.map(c => [c.key, c]))
    const regex = /\[([^\]]+)\]/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index))
        }

        const key = match[1]
        const citation = citationMap.get(key)

        if (citation) {
            // Replace [key] with HoverLink showing the title
            parts.push(
                <HoverLink
                    key={`${key}-${match.index}`}
                    link={citation.link}
                    onHoverStart={(e) => onHoverStart(citation, e)}
                    onHoverMove={onHoverMove}
                    onHoverEnd={onHoverEnd}
                >
                    {citation.title}
                </HoverLink>
            )
        } else {
            // If no citation found, just show the key as text
            parts.push(key)
        }

        lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
    }

    return parts
}

/**
 * SimplifiedResultPanel - A minimal, centered result display
 * Shows 2 paragraphs of description with citation hover previews
 * Type "home" to return to the main screen
 */
export function SimplifiedResultPanel({
    description,
    searchPlaceholder,
    isLoading = false,
    onSearch,
    onHome,
    isSearching = false,
    citations = []
}: SimplifiedResultProps) {
    const [activePreview, setActivePreview] = useState<Citation | null>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)

    // Preload citation images
    useEffect(() => {
        citations.forEach(citation => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = citation.imageUrl
        })
    }, [citations])

    const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
        const cardWidth = 300
        const cardHeight = 250
        const offsetY = 20

        let x = e.clientX - cardWidth / 2
        let y = e.clientY - cardHeight - offsetY

        // Keep card on screen
        if (x + cardWidth > window.innerWidth - 20) {
            x = window.innerWidth - cardWidth - 20
        }
        if (x < 20) {
            x = 20
        }
        // If above viewport, show below cursor
        if (y < 20) {
            y = e.clientY + offsetY
        }

        setPosition({ x, y })
    }, [])

    const handleHoverStart = useCallback((citation: Citation, e: React.MouseEvent) => {
        setActivePreview(citation)
        setIsVisible(true)
        updatePosition(e)
    }, [updatePosition])

    const handleHoverMove = useCallback((e: React.MouseEvent) => {
        if (isVisible) {
            updatePosition(e)
        }
    }, [isVisible, updatePosition])

    const handleHoverEnd = useCallback(() => {
        setIsVisible(false)
    }, [])

    // Split description into paragraphs
    const sentences = description
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.trim().length > 0)
        .slice(0, 4)

    const paragraph1 = sentences.slice(0, 2).join(' ')
    const paragraph2 = sentences.slice(2, 4).join(' ')

    // Handle search - check for "home" command
    const handleSearch = (query: string) => {
        const trimmed = query.trim().toLowerCase()
        if (trimmed === 'home' || trimmed === 'back' || trimmed === 'exit') {
            onHome()
        } else {
            onSearch(query)
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 md:px-12"
            >
                {/* Result Content - Centered */}
                <div className="max-w-2xl w-full text-center space-y-8">
                    {/* Main Description or Loading State */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        {isSearching ? (
                            /* Loading State */
                            <div className="flex items-center justify-center py-12">
                                <ShiningText text="Searching..." />
                            </div>
                        ) : (
                            <>
                                {/* Paragraph 1 */}
                                <p
                                    className="text-lg md:text-xl lg:text-2xl leading-relaxed font-medium tracking-tight transition-all duration-300 hover:text-sky-200"
                                    style={{ color: "rgba(186, 230, 253, 0.9)" }}
                                >
                                    {citations.length > 0
                                        ? parseTextWithCitations(paragraph1, citations, handleHoverStart, handleHoverMove, handleHoverEnd)
                                        : paragraph1
                                    }
                                </p>

                                {/* Paragraph 2 (if exists) */}
                                {paragraph2 && (
                                    <p
                                        className="text-base md:text-lg lg:text-xl leading-relaxed font-normal tracking-tight transition-all duration-300 hover:text-sky-200"
                                        style={{ color: "rgba(148, 163, 184, 0.8)" }}
                                    >
                                        {citations.length > 0
                                            ? parseTextWithCitations(paragraph2, citations, handleHoverStart, handleHoverMove, handleHoverEnd)
                                            : paragraph2
                                        }
                                    </p>
                                )}
                            </>
                        )}
                    </motion.div>

                    {/* Follow-up Search Bar - hidden during search */}
                    {!isSearching && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                            className="pt-8"
                        >
                            <div className="w-full max-w-md mx-auto lg:max-w-lg">
                                <SearchComponent
                                    onSearch={handleSearch}
                                    isSearching={isSearching}
                                    customPlaceholder={searchPlaceholder}
                                />
                            </div>

                            <p
                                className="mt-4 text-xs tracking-wide font-medium"
                                style={{
                                    color: "#1e293b",
                                    textShadow: "0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4)"
                                }}
                            >
                                Type &quot;home&quot; to return • Powered by Gemini
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Preview Card Portal */}
            <PreviewCard
                data={activePreview}
                position={position}
                isVisible={isVisible}
            />
        </>
    )
}

export default SimplifiedResultPanel
