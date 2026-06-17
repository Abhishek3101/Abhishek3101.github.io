import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useViewportZoom } from '@/hooks/useViewportZoom'
import Home from '@/pages/Home'
import Travel from '@/pages/Travel'
import Achievements from '@/pages/Achievements'
import Future from '@/pages/Future'
import Sports from '@/pages/Sports'
import Curations from '@/pages/Curations'
import Journal from '@/pages/Journal'
import Conversation from '@/pages/Conversation'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  const location = useLocation()
  const { zoom, isMobile } = useViewportZoom()

  // On desktop: zoom wrapper scales content to fit viewport using CSS transform
  // On mobile: no scaling, allow vertical overflow for stacked layouts
  const zoomStyle = !isMobile && zoom < 1
    ? {
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        width: `${100 / zoom}vw`,
        height: `${100 / zoom}vh`,
      }
    : {
        width: '100%',
        height: '100%'
      }

  return (
    <div className={`w-full bg-black relative font-sans text-foreground ${
      isMobile ? 'min-h-screen overflow-x-hidden' : 'h-screen overflow-hidden'
    }`}>
      <div style={zoomStyle} className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/future" element={<Future />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/curations" element={<Curations />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}
