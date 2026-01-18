"use client"

import { useEffect, useRef } from "react"

interface LiquidEffectAnimationProps {
  imageUrl?: string
  canvasId?: string
}

export function LiquidEffectAnimation({ imageUrl = '/images/shivam-gawali.jpg', canvasId = 'liquid-canvas' }: LiquidEffectAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const appKey = `__liquidApp_${canvasId}`
    const scriptId = `__liquidScript_${canvasId}`
    let isMounted = true

    // Thorough cleanup of previous instance
    const cleanupPrevious = () => {
      try {
        if (window[appKey as keyof Window]) {
          const app = window[appKey as keyof Window] as any
          if (app.dispose) {
            app.dispose()
          }
          // Also try to clean up renderer if available
          if (app.renderer) {
            app.renderer.dispose()
            app.renderer.forceContextLoss()
          }
          delete window[appKey as keyof Window]
        }
      } catch (e) {
        console.warn('[LiquidEffect] Cleanup warning:', e)
      }

      // Remove old script if exists
      const oldScript = document.getElementById(scriptId)
      if (oldScript && oldScript.parentNode) {
        oldScript.parentNode.removeChild(oldScript)
      }
    }

    // Clean up any previous instance first
    cleanupPrevious()

    // Small delay to ensure cleanup is complete before re-initializing
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
            const app = LiquidBackground(canvas);
            app.loadImage('${imageUrl}');
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
            console.error('[LiquidEffect] Initialization error:', e);
          }
        }
      `
      document.body.appendChild(script)
      scriptRef.current = script
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(initTimeout)
      cleanupPrevious()
    }
  }, [imageUrl, canvasId])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Canvas container */}
      <div className="absolute inset-0 w-full h-full">
        <canvas ref={canvasRef} id={canvasId} className="w-full h-full object-cover" />
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
}

declare global {
  interface Window {
    __liquidApp?: any
    [key: string]: any
  }
}
