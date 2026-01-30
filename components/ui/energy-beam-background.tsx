"use client"

import { useState, useEffect, useRef, memo } from "react"

interface EnergyBeamBackgroundProps {
    projectId?: string
    className?: string
    blurred?: boolean
    blurIntensity?: number
    onLoaded?: () => void
}

declare global {
    interface Window {
        UnicornStudio?: {
            init: () => Promise<any[]>
            destroy: () => void
            addScene: (options: {
                elementId: string
                fps?: number
                scale?: number
                dpi?: number
                projectId: string
                lazyLoad?: boolean
                production?: boolean
            }) => Promise<any>
        }
        // Global control for pausing animation
        __unicornScene?: any
        __pauseUnicornAnimation?: () => void
        __resumeUnicornAnimation?: () => void
    }
}

/**
 * EnergyBeamBackground - Unicorn Studio WebGL
 * OPTIMIZED: Exposes pause/resume controls for performance during user input
 */
const EnergyBeamBackground: React.FC<EnergyBeamBackgroundProps> = memo(({
    projectId = "hRFfUymDGOHwtFe7evR2",
    className = "",
    blurred = false,
    blurIntensity = 4,
    onLoaded
}) => {
    const [isReady, setIsReady] = useState(false)
    const [useWebGL, setUseWebGL] = useState(true)
    const initializedRef = useRef(false)
    const sceneRef = useRef<any>(null)
    const onLoadedRef = useRef(onLoaded)
    const containerId = useRef(`unicorn-container-${Math.random().toString(36).substr(2, 9)}`)

    useEffect(() => {
        onLoadedRef.current = onLoaded
    }, [onLoaded])

    // Check WebGL support
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            if (!gl) setUseWebGL(false)
            canvas.remove()
        } catch {
            setUseWebGL(false)
        }
    }, [])

    // Set up global pause/resume controls
    useEffect(() => {
        window.__pauseUnicornAnimation = () => {
            if (sceneRef.current) {
                sceneRef.current.paused = true
            }
        }
        window.__resumeUnicornAnimation = () => {
            if (sceneRef.current) {
                sceneRef.current.paused = false
            }
        }

        return () => {
            delete window.__pauseUnicornAnimation
            delete window.__resumeUnicornAnimation
        }
    }, [])

    useEffect(() => {
        if (!useWebGL) {
            setIsReady(true)
            onLoadedRef.current?.()
            return
        }

        if (initializedRef.current) return
        initializedRef.current = true

        const isDesktop = window.innerWidth >= 1024

        const initializeScene = () => {
            if (!window.UnicornStudio?.addScene) {
                console.warn('[EnergyBeam] addScene not available')
                setIsReady(true)
                onLoadedRef.current?.()
                return
            }

            console.log('[EnergyBeam] Initializing with addScene...', { isDesktop })

            window.UnicornStudio.addScene({
                elementId: containerId.current,
                projectId: projectId,
                // Balanced settings for desktop - better quality while still performant
                fps: isDesktop ? 28 : 60,           // 30fps on desktop (smooth enough)
                scale: isDesktop ? 0.75 : 1,        // 75% resolution (better quality)
                dpi: isDesktop ? 1.25 : 1.5,        // Slightly higher DPI
                lazyLoad: false,
                production: true
            })
                .then((scene) => {
                    console.log('[EnergyBeam] Scene ready!')
                    sceneRef.current = scene
                    window.__unicornScene = scene
                    setIsReady(true)
                    setTimeout(() => onLoadedRef.current?.(), 300)
                })
                .catch((err) => {
                    console.error('[EnergyBeam] addScene failed:', err)
                    setUseWebGL(false)
                    setIsReady(true)
                    onLoadedRef.current?.()
                })
        }

        const existingScript = document.querySelector('script[src*="unicornStudio"]')

        if (existingScript) {
            if (window.UnicornStudio?.addScene) {
                setTimeout(initializeScene, 50)
            } else {
                existingScript.addEventListener('load', initializeScene)
            }
            return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js'
        script.async = true
        script.id = 'unicorn-studio-script'
        script.onload = () => {
            console.log('[EnergyBeam] Script loaded')
            initializeScene()
        }
        script.onerror = () => {
            console.warn('[EnergyBeam] Script failed to load')
            setUseWebGL(false)
            setIsReady(true)
            onLoadedRef.current?.()
        }
        document.head.appendChild(script)

        return () => {
            if (sceneRef.current?.destroy) {
                try { sceneRef.current.destroy() } catch { }
            }
            delete window.__unicornScene
            initializedRef.current = false
        }
    }, [projectId, useWebGL])

    return (
        <div
            className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
            style={{
                backgroundColor: '#000',
                opacity: isReady ? 1 : 0,
                transition: 'opacity 0.6s ease-out'
            }}
        >
            {useWebGL ? (
                <div
                    id={containerId.current}
                    className="w-full h-full"
                    style={{
                        filter: blurred ? `blur(${blurIntensity}px)` : 'none',
                        transition: 'filter 0.5s ease-out'
                    }}
                />
            ) : (
                <div className="absolute inset-0">
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, rgba(2, 132, 199, 0.2) 30%, transparent 70%)',
                            filter: blurred ? `blur(${blurIntensity}px)` : 'none',
                        }}
                    />
                </div>
            )}

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%)'
                }}
            />
        </div>
    )
})

EnergyBeamBackground.displayName = 'EnergyBeamBackground'

export default EnergyBeamBackground
