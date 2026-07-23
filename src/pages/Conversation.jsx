import React, { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Mail, Coffee, RefreshCw } from 'lucide-react'

import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

const FALLBACK_PROMPTS = [
  "Would you like to know about my travel?",
  "Do you like the concept of the website?",
  "What's a startup idea you abandoned and why?"
]

export default function Conversation() {
  const [prompts, setPrompts] = useState(FALLBACK_PROMPTS)
  const [socials, setSocials] = useState({})
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch prompts
      const pSnap = await getDocs(collection(db, 'conversations'));
      const activePrompts = pSnap.docs
        .map(doc => doc.data())
        .filter(d => d.isActive === 'Yes')
        .map(d => d.prompt);

      if (activePrompts.length > 0) {
        setPrompts(activePrompts);
      }

      // Fetch socials
      const sSnap = await getDocs(collection(db, 'socials'));
      const socialMap = {};
      sSnap.docs.forEach(doc => {
        const d = doc.data();
        if (d.isActive === 'Yes') {
          socialMap[d.platform] = d.value;
        }
      });
      setSocials(socialMap);
    };
    fetchData();
  }, [])

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % prompts.length)
  }

  const handleWhatsApp = (prompt) => {
    if (!socials['WhatsApp']) return;
    const text = encodeURIComponent(`Hey! I was exploring your website. ${prompt}`)
    window.open(`https://wa.me/${socials['WhatsApp']}?text=${text}`, '_blank')
  }

  const handleEmail = (prompt) => {
    if (!socials['Email']) return;
    const subject = encodeURIComponent("Let's grab coffee!")
    const body = encodeURIComponent(`Hey!\n\nI was looking through your website and wanted to ask:\n\n"${prompt}"\n\nCheers,`)
    window.location.href = `mailto:${socials['Email']}?subject=${subject}&body=${body}`
  }

  return (
    <PageWrapper title="Conversation" fullScreen={true}>
      <div className="flex-1 h-full md:min-h-0 bg-[#faf9f6] flex flex-col justify-center items-center px-4 overflow-hidden relative">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-100/40 blur-[100px]" />
        </div>

        <div className="z-10 w-full max-w-lg flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4 text-orange-800">
              <Coffee size={32} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 mb-4">Let's Grab Coffee.</h1>
            <p className="text-zinc-500 font-sans max-w-sm mx-auto">
              Skip the generic "Hi". Swipe through the deck below and pick a conversation starter to send me directly.
            </p>
          </motion.div>

          {/* The Conversation Deck */}
          <div className="relative w-full max-w-sm h-[28rem] sm:h-[32rem] mb-16 perspective-1000">
            <AnimatePresence>
              {prompts.map((prompt, index) => {
                const offsetIndex = (index - activeIndex + prompts.length) % prompts.length

                if (offsetIndex > 2) return null

                const isFront = offsetIndex === 0

                return (
                  <motion.div
                    key={prompt}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ 
                      opacity: 1 - offsetIndex * 0.3, 
                      y: offsetIndex * 20, 
                      scale: 1 - offsetIndex * 0.05,
                      zIndex: prompts.length - offsetIndex,
                      rotateX: offsetIndex * 5
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ touchAction: "pan-y" }}
                    drag={isFront ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x
                      if (swipe < -1000 || swipe > 1000 || offset.x > 100 || offset.x < -100) {
                        handleNext()
                      }
                    }}
                    className={`absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-zinc-100/50 flex flex-col p-6 sm:p-8 ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
                  >
                    
                    {/* Card Content */}
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <div className="text-zinc-400 mb-6 uppercase tracking-widest text-[10px] font-bold">
                        Card {index + 1} of {prompts.length}
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl text-zinc-900 leading-tight">
                        "{prompt}"
                      </h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col gap-3">
                      {socials['WhatsApp'] && (
                        <button 
                          onClick={() => handleWhatsApp(prompt)}
                          className="w-full py-3 bg-[#25D366] text-white rounded-xl font-medium shadow-sm shadow-[#25D366]/20 flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
                        >
                          <MessageCircle size={18} />
                          Send via WhatsApp
                        </button>
                      )}
                      {socials['Email'] && (
                        <button 
                          onClick={() => handleEmail(prompt)}
                          className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                        >
                          <Mail size={18} />
                          Send via Email
                        </button>
                      )}
                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Hint text below deck */}
            <div className="absolute -bottom-10 left-0 w-full text-center pointer-events-none">
              <span className="text-xs text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <RefreshCw size={12} /> Swipe to change card
              </span>
            </div>
          </div>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6"
          >
            {socials['LinkedIn'] && (
              <a href={socials['LinkedIn']} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-[#0A66C2] hover:border-[#0A66C2] hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            )}
            {socials['Twitter'] && (
              <a href={socials['Twitter']} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-black hover:border-black hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            )}
            {socials['Instagram'] && (
              <a href={socials['Instagram']} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-[#E1306C] hover:border-[#E1306C] hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            )}
          </motion.div>

        </div>
      </div>
    </PageWrapper>
  )
}
