import { useState, useEffect } from 'react'

const DESIGN_WIDTH = 1920 // Viewport width at 75% browser zoom on a ~1440px screen

export function useViewportZoom() {
  const [state, setState] = useState(() => ({
    zoom: typeof window !== 'undefined' ? Math.min(1, window.innerWidth / DESIGN_WIDTH) : 1,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  }))

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      const isMobile = vw < 768
      const zoom = isMobile ? 1 : Math.min(1, vw / DESIGN_WIDTH)
      setState({ zoom, isMobile })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}
