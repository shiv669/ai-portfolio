"use client"

import { useEffect, useRef, memo, useState } from "react"

interface LiquidEffectAnimationProps {
  imageUrl?: string
  canvasId?: string
}

/**
 * LiquidEffectAnimation - Three.js liquid effect
 * OPTIMIZED: Lower pixel ratio for desktop to reduce GPU load
 */
export const LiquidEffectAnimation = memo(function LiquidEffectAnimation({
  imageUrl = '/images/shivam-gawali.jpg',
  canvasId = 'liquid-canvas',
}: LiquidEffectAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const appKey = `__liquidApp_${canvasId}`
    const scriptId = `__liquidScript_${canvasId}`
    let isMounted = true

    // Cleanup any previous instance
    const cleanupPrevious = () => {
      try {
        const existingApp = window[appKey as keyof Window] as any
        if (existingApp) {
          if (existingApp.clock) existingApp.clock.stop()
          if (existingApp.dispose) existingApp.dispose()
          if (existingApp.renderer) {
            existingApp.renderer.dispose()
            existingApp.renderer.forceContextLoss()
          }
          delete window[appKey as keyof Window]
        }
        const oldScript = document.getElementById(scriptId)
        if (oldScript) oldScript.remove()
      } catch (e) {
        console.warn('[LiquidEffect] Cleanup warning:', e)
      }
    }

    cleanupPrevious()

    // Use lower pixel ratio for desktop (larger screens = more pixels)
    const isDesktop = window.innerWidth >= 1024
    // Desktop: 1.0, Mobile: cap at 1.5
    const pixelRatio = isDesktop ? 1.0 : Math.min(window.devicePixelRatio, 1.5)

    const initTimeout = setTimeout(() => {
      if (!isMounted || !canvasRef.current) return

      const script = document.createElement("script")
      script.type = "module"
      script.id = scriptId
      script.textContent = `
        import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
        
        const canvas = document.getElementById('${canvasId}');
        if (canvas && !window['${appKey}']) {
          try {
            const app = LiquidBackground(canvas, {
              pixelRatio: ${pixelRatio}
            });
            app.loadImage('${imageUrl}');
            app.liquidPlane.material.metalness = 0.2;
            app.liquidPlane.material.roughness = 0.8;
            app.liquidPlane.uniforms.displacementScale.value = 5;
            
            // Reduce lighting for performance
            if (app.scene && app.scene.children) {
              app.scene.children.forEach(child => {
                if (child.isLight) {
                  child.intensity = child.intensity * 0.3;
                }
              });
            }
            app.setRain(false);
            
            window['${appKey}'] = app;
            window.dispatchEvent(new CustomEvent('liquidEffectReady', { detail: '${canvasId}' }));
          } catch (e) {
            console.error('[LiquidEffect] Initialization error:', e);
          }
        }
      `
      document.body.appendChild(script)
    }, 50)

    const handleReady = (e: CustomEvent) => {
      if (e.detail === canvasId && isMounted) {
        setIsLoaded(true)
      }
    }
    window.addEventListener('liquidEffectReady', handleReady as EventListener)

    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      window.removeEventListener('liquidEffectReady', handleReady as EventListener)
      cleanupPrevious()
    }
  }, [imageUrl, canvasId])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
          contain: 'strict'
        }}
      >
        <canvas
          ref={canvasRef}
          id={canvasId}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.8) 20%, rgba(10,10,10,0.3) 50%, transparent 100%)",
        }}
      />
    </div>
  )
})

declare global {
  interface Window {
    __liquidApp?: any
    [key: string]: any
  }
}
