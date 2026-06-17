import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
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

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-sans text-foreground">
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
  )
}
