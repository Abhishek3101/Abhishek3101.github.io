import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const touchpoints = [
  { id: 'travel', path: '/travel', top: '30%', left: '75%', label: 'Travel' },
  { id: 'achievements', path: '/achievements', top: '28%', left: '20%', label: 'Achievements' },
  { id: 'future', path: '/future', top: '28%', left: '35%', label: 'The Horizon (Future)' },
  { id: 'sports', path: '/sports', top: '55%', left: '32%', label: 'Sports' },
  { id: 'curations', path: '/curations', top: '40%', left: '48%', label: 'Curations' },
  { id: 'journal', path: '/journal', top: '78%', left: '52%', label: 'Journal' },
  { id: 'conversation', path: '/conversation', top: '76.5%', left: '58.5%', label: 'Conversation' },
  { id: 'dashboard', path: '/dashboard', top: '45%', left: '12%', label: 'Dashboard', hidden: true },
  // The man dot triggers an intro cloud instead of navigation
  { id: 'intro', top: '65%', left: '73%', label: 'Intro' },
]

export default function Home() {
  const navigate = useNavigate()
  const [showIntro, setShowIntro] = useState(true)
  const [introText, setIntroText] = useState("Welcome to my digital room. I built this space to step away from traditional, boring social profiles.\n\nEverything in this room represents a piece of my life—my travels, my journal, my health, and the ideas I'm exploring for the future. Take a look around.")

  useEffect(() => {
    const fetchIntro = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'intro'))
        if (snap.exists() && snap.data().text) {
          setIntroText(snap.data().text)
        }
      } catch (err) {
        console.error("Failed to load intro:", err)
      }
    }
    fetchIntro()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full relative bg-[#f0eadd] overflow-y-auto"
    >
      {/* Desktop View */}
      <div className="hidden lg:block absolute inset-0">
        {/* Background Image Container */}
        <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{ backgroundImage: "url('/room-bg.jpg')", backgroundColor: '#f0eadd' }}
      ></div>

      {/* Overlay for slight contrast if needed (optional) */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>

      {/* Touchpoints */}
      {touchpoints.map((point) => (
        <button
          key={point.id}
          onClick={() => {
            if (point.id === 'intro') {
              setShowIntro(!showIntro)
            } else {
              navigate(point.path)
            }
          }}
          title={point.hidden ? '' : point.label}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20
            ${point.hidden 
              ? 'w-24 h-48 opacity-0 cursor-pointer' // Enlarge hidden touchpoint styling for the door
              : 'w-6 h-6 rounded-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse hover:bg-white cursor-pointer hover:scale-125 transition-transform'
            }`}
          style={{ top: point.top, left: point.left }}
        >
          {!point.hidden && (
            <span className="sr-only">{point.label}</span>
          )}
        </button>
      ))}

      {/* Intro Speech Bubble */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, y: 10, x: '-50%' }}
            className="absolute z-30 bg-white/90 backdrop-blur-md text-zinc-800 p-6 rounded-2xl shadow-xl border border-white/20 w-80 text-sm"
            style={{ top: '35%', left: '73%' }}
          >
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white/90"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-bold text-xl text-zinc-900">Hi, I'm Abhi.</h3>
              <button onClick={() => setShowIntro(false)} className="text-zinc-400 hover:text-zinc-700">
                ✕
              </button>
            </div>
            <div className="font-sans leading-relaxed text-zinc-600 mb-3 whitespace-pre-wrap">
              {introText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden w-full min-h-[100vh] flex flex-col pb-16">
         {/* Top Image */}
         <div className="w-full aspect-[4/5] relative flex-shrink-0">
            <img src="/mobile-room-bg.png" className="w-full h-full object-cover" alt="My Digital Room" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f0eadd] via-[#f0eadd]/50 to-transparent"></div>
         </div>
         
         <div className="px-6 -mt-20 relative z-10 flex-1">
            <h1 className="font-serif text-4xl font-bold text-zinc-900 mb-2">Welcome.</h1>
            <p className="font-sans text-sm text-zinc-700 mb-8 leading-relaxed">
              This Digital Room is best viewed on a laptop. However, you can explore the different parts of my living room below.
            </p>

            <div className="flex flex-col gap-2">
               {touchpoints.filter(p => !p.hidden && p.id !== 'intro').map((point, idx) => (
                 <button
                   key={point.id}
                   onClick={() => navigate(point.path)}
                   className="w-full text-left py-3 border-b border-zinc-300/50 flex items-center justify-between group active:opacity-60 transition-opacity"
                 >
                   <div className="flex items-center gap-4">
                     <span className="font-mono text-xs text-zinc-400">0{idx + 1}</span>
                     <span className="font-serif text-xl text-zinc-800">{point.label}</span>
                   </div>
                   <span className="text-zinc-300 group-hover:text-zinc-800 transition-colors">→</span>
                 </button>
               ))}
               
               <button
                 onClick={() => navigate('/dashboard')}
                 className="w-full text-left py-4 mt-4 flex items-center justify-between group active:opacity-60 transition-opacity"
               >
                 <span className="font-sans text-sm font-semibold tracking-widest uppercase text-zinc-500">Dashboard Login</span>
                 <span className="text-zinc-300">→</span>
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  )
}
