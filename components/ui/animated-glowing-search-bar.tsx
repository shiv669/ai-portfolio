"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { getSuggestions, saveToHistory, isInappropriate, getSearchHistory } from "@/lib/search-utils"

interface SearchComponentProps {
  onSearch?: (query: string) => void
  onResultClose?: () => void
  isSearching?: boolean
  compact?: boolean // Added compact prop for result view
}

const SearchComponent = ({ onSearch, isSearching, compact = false }: SearchComponentProps) => {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update suggestions when input changes
  useEffect(() => {
    const newSuggestions = getSuggestions(inputValue)
    setSuggestions(newSuggestions)
    setSelectedIndex(-1)
  }, [inputValue])

  // Get recent searches for display
  useEffect(() => {
    const history = getSearchHistory()
    setRecentSearches(history.slice(0, 3).map((h) => h.query))
  }, [showSuggestions])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return

      if (isInappropriate(query)) {
        setInputValue("")
        setShowSuggestions(false)
        return
      }

      saveToHistory(query)
      setInputValue(query)
      setShowSuggestions(false)

      if (onSearch) {
        onSearch(query)
      }
    },
    [onSearch],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex])
        } else {
          handleSearch(inputValue)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }

  const isFromHistory = (suggestion: string) => {
    return recentSearches.some((r) => r.toLowerCase() === suggestion.toLowerCase())
  }

  const inputWidth = compact ? "w-[200px] md:w-[240px]" : "w-[260px]"
  const inputHeight = compact ? "h-[38px]" : "h-[46px]"
  const iconSize = compact ? "18" : "22"
  const iconTop = compact ? "top-[10px]" : "top-[12px]"
  const glowTop = compact ? "top-[6px]" : "top-[8px]"

  return (
    <div className="relative flex items-center justify-center" ref={containerRef}>
      <div
        className="relative flex items-center justify-center group rounded-xl"
        style={{
          boxShadow:
            "0 0 0 1px rgba(125, 211, 252, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {!compact && (
          <>
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div
                className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, #7dd3fc 10%, transparent 20%, transparent 50%, #bae6fd 60%, transparent 70%)",
                }}
              />
              <div
                className="absolute inset-[-100%] animate-[spin_6s_linear_infinite_reverse]"
                style={{
                  background: "conic-gradient(from 180deg, transparent, #e0f2fe 10%, transparent 20%, transparent 70%)",
                }}
              />
            </div>

            <div className="absolute inset-[1px] rounded-xl overflow-hidden blur-sm">
              <div
                className="absolute inset-[-100%] animate-[spin_5s_linear_infinite]"
                style={{
                  background:
                    "conic-gradient(from 90deg, transparent, #bae6fd 8%, transparent 16%, transparent 50%, #e0f2fe 58%, transparent 66%)",
                }}
              />
            </div>
          </>
        )}

        <div className="absolute inset-[2px] rounded-lg bg-[#010201]" />

        <div className="relative">
          <input
            ref={inputRef}
            placeholder={compact ? "Search..." : "Query this profile..."}
            type="text"
            name="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
            className={`relative bg-[#010201] border-none ${inputWidth} ${inputHeight} rounded-lg text-white pl-[42px] pr-4 ${compact ? "text-sm" : "text-base"} focus:outline-none placeholder-gray-400 disabled:opacity-50`}
          />
          {!compact && (
            <div
              className={`pointer-events-none w-[25px] h-[18px] absolute bg-[#7dd3fc] ${glowTop} left-[5px] blur-2xl opacity-60 transition-all duration-500 group-hover:opacity-0`}
            />
          )}
          <div className={`absolute left-3 ${iconTop}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={iconSize}
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              height={iconSize}
              fill="none"
            >
              <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
              <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22"></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="search">
                  <stop stopColor="#e0f2fe" offset="0%"></stop>
                  <stop stopColor="#7dd3fc" offset="50%"></stop>
                </linearGradient>
                <linearGradient id="searchl">
                  <stop stopColor="#7dd3fc" offset="0%"></stop>
                  <stop stopColor="#bae6fd" offset="50%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className={`absolute ${compact ? "top-full mt-2" : "bottom-full mb-3"} left-1/2 -translate-x-1/2 w-[280px] overflow-hidden z-50`}
          style={{
            background: "rgba(8, 8, 12, 0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(125, 211, 252, 0.08)",
            borderRadius: "12px",
            boxShadow: compact
              ? "0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)"
              : "0 -4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
          }}
        >
          <div className="py-1.5">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSearch(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-3.5 py-2 flex items-center gap-2.5 text-left transition-all duration-200 ${
                  selectedIndex === index ? "bg-sky-500/8" : ""
                }`}
              >
                <span className="flex-shrink-0 opacity-40">
                  {isFromHistory(suggestion) ? (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-sky-300"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ) : inputValue ? (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-sky-300"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  ) : (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-sky-300"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  )}
                </span>
                <span
                  className="text-[13px] font-light tracking-wide truncate"
                  style={{ color: "rgba(186, 230, 253, 0.85)" }}
                >
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchComponent
