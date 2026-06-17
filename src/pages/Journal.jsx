import React, { useState, useEffect, useRef } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react'

import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

const MOOD_COLORS = {
  Happy: { moodColor: '#fef3c7', paperColor: '#fffbeb', textColor: '#451a03', weather: 'Clear Sunset' },
  Reflective: { moodColor: '#334155', paperColor: '#f8fafc', textColor: '#0f172a', weather: 'Heavy Rain' },
  Stressed: { moodColor: '#fee2e2', paperColor: '#fef2f2', textColor: '#7f1d1d', weather: 'Overcast' },
  Energetic: { moodColor: '#ecfdf5', paperColor: '#ffffff', textColor: '#064e3b', weather: 'Bright Morning' },
  Calm: { moodColor: '#eff6ff', paperColor: '#f8fafc', textColor: '#1e3a8a', weather: 'Quiet Night' },
};

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [activeEntryId, setActiveEntryId] = useState(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    const fetchJournal = async () => {
      const snap = await getDocs(collection(db, 'journal'));
      const data = snap.docs.map(doc => {
        const d = doc.data();
        const colors = MOOD_COLORS[d.mood] || MOOD_COLORS['Reflective'];
        
        return {
          id: doc.id,
          ...d,
          title: d.topic,
          dateStr: d.date,
          content: d.text,
          ...colors
        }
      });
      data.sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr));
      setEntries(data);
      if (data.length > 0) setActiveEntryId(data[0].id);
    };
    fetchJournal();
  }, [])

  const activeEntry = entries.find(e => e.id === activeEntryId)

  // Synthesize wind and birds using Web Audio API
  const toggleNature = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      audioCtxRef.current.isPlayingNature = true

      // --- WIND SYNTHESIZER ---
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1 // White noise
      }

      const windSource = ctx.createBufferSource()
      windSource.buffer = noiseBuffer
      windSource.loop = true

      const windFilter = ctx.createBiquadFilter()
      windFilter.type = 'lowpass'
      windFilter.frequency.value = 300 // Base muffled wind

      // LFO (Low Frequency Oscillator) to simulate wind gusts
      const windLfo = ctx.createOscillator()
      windLfo.type = 'sine'
      windLfo.frequency.value = 0.1 // Very slow cycle (10 seconds)
      
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 400 // Modulate the filter frequency by +/- 400Hz

      windLfo.connect(lfoGain)
      lfoGain.connect(windFilter.frequency)

      const windGain = ctx.createGain()
      windGain.gain.value = 0.08 // Keep wind quiet

      windSource.connect(windFilter)
      windFilter.connect(windGain)
      windGain.connect(ctx.destination)

      windSource.start(0)
      windLfo.start(0)

      // --- BIRD CHIRP SYNTHESIZER ---
      const scheduleChirp = () => {
        if (!audioCtxRef.current || !audioCtxRef.current.isPlayingNature) return

        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = 'sine'
        // High pitch start, dropping quickly (typical bird chirp)
        const startPitch = 2500 + Math.random() * 1500
        const endPitch = startPitch - (500 + Math.random() * 500)
        
        osc.frequency.setValueAtTime(startPitch, now)
        osc.frequency.exponentialRampToValueAtTime(endPitch, now + 0.15)
        
        // Volume envelope (sharp attack, quick fade)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.03, now + 0.02) // Quiet chirp
        gain.gain.linearRampToValueAtTime(0, now + 0.15)

        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(now)
        osc.stop(now + 0.15)

        // Randomize next chirp (sometimes quick double-chirps, sometimes long pauses)
        const isDoubleChirp = Math.random() > 0.7
        const nextDelay = isDoubleChirp ? 200 : 2000 + Math.random() * 5000
        
        setTimeout(scheduleChirp, nextDelay)
      }
      
      // Start the bird loop
      scheduleChirp()
    }

    if (isAudioPlaying) {
      audioCtxRef.current.suspend()
      audioCtxRef.current.isPlayingNature = false
      setIsAudioPlaying(false)
    } else {
      audioCtxRef.current.resume()
      audioCtxRef.current.isPlayingNature = true
      setIsAudioPlaying(true)
      
      // We need to re-trigger the bird loop if it was suspended
      // But actually, `suspend()` pauses the AudioContext time, so we just let it resume.
      // However, `setTimeout` runs in main thread. So we need a mechanism:
      // To keep it simple, we just rely on `suspend` pausing the audio. 
      // The timeouts will keep firing but producing no sound until resumed.
    }
  }

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  if (!activeEntry) {
    return (
      <PageWrapper title="Journal" fullScreen={true}>
        <div className="flex-1 h-full md:min-h-0 pt-20 flex items-center justify-center text-zinc-500">Loading Journal...</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Journal" fullScreen={true}>
      <motion.div 
        className="flex-1 h-full md:min-h-0 pt-20 pb-0 px-4 sm:px-8 lg:px-12 flex flex-col md:overflow-hidden overflow-y-auto transition-colors duration-1000 ease-in-out"
        animate={{ backgroundColor: activeEntry.moodColor }}
      >
        <div className="w-full max-w-[1400px] mx-auto flex flex-col h-full relative">
          
          {/* Header & Ambient Audio Toggle */}
          <div className="mb-8 flex justify-between items-center flex-shrink-0 z-10">
            <div>
              <h1 className="font-serif italic text-3xl md:text-4xl tracking-tight transition-colors duration-1000" style={{ color: activeEntry.textColor }}>
                The Ledger
              </h1>
            </div>
            <button 
              onClick={toggleNature}
              className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md border border-black/10 shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: `${activeEntry.paperColor}80`, color: activeEntry.textColor }}
            >
              {isAudioPlaying ? (
                <>
                  <div className="flex gap-[2px] h-4 items-center">
                    <motion.div animate={{ height: ["4px", "14px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-current rounded-full" />
                    <motion.div animate={{ height: ["8px", "16px", "8px"] }} transition={{ repeat: Infinity, duration: 1.0, delay: 0.1 }} className="w-1 bg-current rounded-full" />
                    <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.2 }} className="w-1 bg-current rounded-full" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">Ambient: On</span>
                </>
              ) : (
                <>
                  <VolumeX size={16} />
                  <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">Ambient: Off</span>
                </>
              )}
            </button>
          </div>

          {/* The Flipbook Layout */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-8 lg:gap-16 pb-8">
            
            {/* Left Page: Index */}
            <div className="w-full md:w-1/3 flex flex-col h-full relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60" style={{ color: activeEntry.textColor }}>
                Table of Contents
              </h3>
              <div className="flex flex-col gap-6 w-full max-w-xs md:max-w-sm flex-shrink-0 hide-scrollbar overflow-y-auto pb-20">
                {entries.map((entry) => {
                  const isActive = entry.id === activeEntryId
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setActiveEntryId(entry.id)}
                      className="text-left py-4 px-6 rounded-2xl transition-all relative group overflow-hidden"
                    >
                      {/* Active Background Pill */}
                      {isActive && (
                        <motion.div 
                          layoutId="activePill"
                          className="absolute inset-0 rounded-2xl border border-black/5 shadow-sm"
                          style={{ backgroundColor: entry.paperColor }}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <div className="relative z-10 flex flex-col gap-1">
                        <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isActive ? 'opacity-80' : 'opacity-40 hover:opacity-80'}`} style={{ color: isActive ? entry.textColor : '#000000' }}>
                          {entry.date}
                        </span>
                        <span className={`text-xl font-serif transition-colors duration-500 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} style={{ color: isActive ? entry.textColor : '#000000' }}>
                          {entry.title}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Page: The Entry Reader */}
            <div className="w-full md:w-2/3 h-auto md:h-full relative perspective-1000">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeEntry.id}
                  initial={{ opacity: 0, rotateY: -15, x: 20 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  exit={{ opacity: 0, rotateY: 15, x: -20 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="md:absolute md:inset-0 relative min-h-[50vh] rounded-l-3xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border-l border-white/50 overflow-hidden"
                  style={{ backgroundColor: activeEntry.paperColor, color: activeEntry.textColor }}
                >
                  <div className="w-full h-full overflow-y-auto hide-scrollbar p-8 md:p-16 lg:p-24 pb-32">
                    
                    {/* Header of the page */}
                    <div className="mb-10 border-b border-black/5 pb-8">
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-handwriting mb-2 leading-tight">
                        {activeEntry.title}
                      </h2>
                      <div className="flex gap-4 items-center opacity-60">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{activeEntry.date}</span>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{activeEntry.weather}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-2xl text-justify">
                      {activeEntry.content && typeof activeEntry.content === 'string' ? (
                        activeEntry.content.split('\n').map((line, idx) => (
                          <p key={idx} className="text-2xl md:text-3xl leading-relaxed mb-6 font-handwriting tracking-wide">
                            {line}
                          </p>
                        ))
                      ) : (
                        activeEntry.content
                      )}
                    </div>

                  </div>
                  
                  {/* Page binding shadow effect */}
                  <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </motion.div>
    </PageWrapper>
  )
}

// ----------------------------------------------------------------------
// Marginalia Component (Hand-drawn SVG annotations)
// ----------------------------------------------------------------------
function Marginalia({ children, type }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* The Text */}
      <span className="relative z-10">{children}</span>

      {/* The Hand-drawn SVGs */}
      {type === 'underline' && (
        <svg className="absolute -bottom-2 left-0 w-full h-4 text-red-500/70 overflow-visible z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 20">
          <motion.path 
            d="M 0,10 Q 25,20 50,10 T 100,10" 
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
      )}

      {type === 'circle' && (
        <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] text-blue-500/60 overflow-visible z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 40">
          <motion.path 
            d="M 10,20 C 10,5 90,5 90,20 C 90,35 15,38 12,25" 
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          />
        </svg>
      )}

      {type === 'arrow' && (
        <svg className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/70 overflow-visible z-0 pointer-events-none" viewBox="0 0 40 40">
          <motion.path 
            d="M 5,20 C 15,5 30,10 35,20 M 25,10 L 35,20 L 25,30" 
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          />
        </svg>
      )}

      {type === 'asterisk' && (
        <svg className="absolute inset-0 w-full h-full text-zinc-400 overflow-visible z-0 pointer-events-none scale-150" viewBox="0 0 40 40">
           <motion.path 
            d="M 20,5 L 20,35 M 5,15 L 35,25 M 5,25 L 35,15" 
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      )}
    </span>
  )
}
