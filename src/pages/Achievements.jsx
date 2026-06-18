import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PageWrapper from '@/components/PageWrapper'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, GraduationCap, Rocket, Users, Briefcase, Building, Mountain, Anchor, Code, Layout, Heart, Home, X, ChevronRight } from 'lucide-react'

import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// Type mappings for categories
const getTypeForCategory = (cat) => {
  if (cat === 'Milestone') return 'blueprint'
  if (cat === 'Award') return 'letter'
  if (cat === 'Personal') return 'polaroid'
  return 'journal'
}

const getIconForCategory = (cat) => {
  if (cat === 'Milestone') return Rocket
  if (cat === 'Award') return Briefcase
  if (cat === 'Personal') return Heart
  return Terminal
}

// Generate viewport-relative layout positions (percentages)
// Items are scattered across the viewport in a pleasing spiral pattern
const generateLayout = (items) => {
  const centerX = 50; // center of viewport in %
  const centerY = 50;
  
  return items.map((item, index) => {
    const count = items.length || 1;
    // Spiral with tighter radius that fits in viewport
    // Max radius ~35% so items stay within 15%-85% of viewport
    const angle = index * (2.4 + (1.0 / count));
    const maxRadius = Math.min(35, 15 + count * 2);
    const radius = 8 + (index / Math.max(count - 1, 1)) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    // Clamp to keep items within viewport bounds (with padding for item size)
    const clampedX = Math.max(5, Math.min(88, x));
    const clampedY = Math.max(8, Math.min(85, y));
    const rotation = (Math.random() * 20) - 10;
    
    return {
      ...item,
      x: clampedX,
      y: clampedY,
      rotation,
      type: getTypeForCategory(item.category),
      icon: getIconForCategory(item.category)
    }
  });
}

export default function Achievements() {
  const [items, setItems] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      const snap = await getDocs(collection(db, 'achievements'));
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort chronologically
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const laidOut = generateLayout(data);
      setItems(laidOut);

      // Connect sequentially by date
      const conns = [];
      for (let i = 0; i < laidOut.length - 1; i++) {
        conns.push([laidOut[i].id, laidOut[i+1].id]);
      }
      setConnections(conns);
    };
    fetchAchievements();
  }, [])

  return (
    <PageWrapper title="Notice Board" fullScreen={true}>
      
      <div ref={containerRef} className="w-full flex-1 flex flex-col relative">


        {/* Desktop: Viewport-sized corkboard */}
        <div className="hidden md:flex absolute inset-0 overflow-hidden bg-[#e0ccba] select-none">
          
          {/* The corkboard surface */}
          <div 
            className="absolute inset-0 bg-[#c6a37b]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
              boxShadow: 'inset 0 0 100px rgba(90, 60, 30, 0.4)'
            }}
          >
            {/* Red String Timeline SVG Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <filter id="string-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
                </filter>
              </defs>
              {connections.map(([idA, idB], idx) => {
                const itemA = items.find(i => i.id === idA)
                const itemB = items.find(i => i.id === idB)
                if (!itemA || !itemB) return null;
                
                // Positions are in %, offset slightly toward center of each item
                const x1 = `${itemA.x + 2}%`;
                const y1 = `${itemA.y + 3}%`;
                const x2 = `${itemB.x + 2}%`;
                const y2 = `${itemB.y + 3}%`;

                return (
                  <g key={idx}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#991b1b" strokeWidth="3" filter="url(#string-shadow)" strokeLinecap="round" className="opacity-80" />
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" className="opacity-60" />
                    <circle cx={x1} cy={y1} r="5" fill="#dc2626" stroke="#450a0a" strokeWidth="2" filter="url(#string-shadow)" />
                    <circle cx={x2} cy={y2} r="5" fill="#dc2626" stroke="#450a0a" strokeWidth="2" filter="url(#string-shadow)" />
                  </g>
                )
              })}
            </svg>

            {/* Desk Items — positioned with % */}
            {items.map((item) => (
              <DeskItem 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItem(item)} 
                isDimmed={selectedItem && selectedItem.id !== item.id}
              />
            ))}

            {/* Aesthetic Corkboard Props */}
            <div className="absolute w-[95%] h-[95%] border-[16px] border-[#6b4e36] rounded-xl shadow-2xl pointer-events-none" style={{ left: '2.5%', top: '2.5%' }} />
          </div>

          {/* Hint overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-80 bg-white/80 text-[#6b4e36] px-6 py-2 rounded-md font-sans text-sm shadow-sm backdrop-blur-sm border border-black/10">
            Click on any pinned item to examine it
          </div>
        </div>
      </div>

      {/* Examine Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md cursor-zoom-out"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative cursor-default max-w-[90vw] max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <ExpandedItem item={selectedItem} onClose={() => setSelectedItem(null)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

        {/* Mobile: Vertical List Layout maintaining aesthetics */}
        <div className="md:hidden pt-24 px-4 pb-12 bg-[#c6a37b] min-h-screen relative overflow-hidden" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='0.15'/%3E%3C/svg%3E")`,
               boxShadow: 'inset 0 0 50px rgba(90, 60, 30, 0.4)'
             }}
        >
           <h1 className="font-handwriting text-4xl text-[#3d2314] text-center mb-8 border-b-2 border-red-800/20 pb-4 inline-block w-full">Notice Board</h1>
           
           <div className="flex flex-col gap-16 items-center relative z-10 mt-8">
             {items.map((item, idx) => (
               <div key={item.id} className="relative w-full h-48 sm:h-56 flex justify-center">
                 {/* Re-use DeskItem but center it in this block */}
                 <DeskItem 
                   item={{...item, x: 10, y: 10, rotation: item.rotation || (Math.random() * 6 - 3) }} 
                   onClick={() => setSelectedItem(item)} 
                 />
                 
                 {/* Red string connecting down to next item */}
                 {idx < items.length - 1 && (
                   <div className="absolute top-[80%] left-[30%] w-0.5 h-32 bg-red-600/80 shadow-[2px_0_5px_rgba(0,0,0,0.5)] z-0 transform rotate-[15deg] origin-top opacity-60" />
                 )}
               </div>
             ))}
           </div>
        </div>

    </PageWrapper>
  )
}

function DeskItem({ item, onClick, isDimmed }) {
  const isJournal = item.type === 'journal'
  const isBlueprint = item.type === 'blueprint'
  const isLetter = item.type === 'letter'
  const isPolaroid = item.type === 'polaroid'
  const isSticky = item.type === 'sticky'

  return (
    <motion.div
      className={`absolute cursor-pointer transition-opacity duration-300 ${isDimmed ? 'opacity-40' : 'opacity-100 hover:z-10'}`}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        rotate: item.rotation,
      }}
      whileHover={{ scale: 1.08, rotate: item.rotation > 0 ? item.rotation + 2 : item.rotation - 2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Realistic 3D Thumbtack */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-5 h-5 flex justify-center pointer-events-none">
        {/* Angled Drop Shadow for the pin/head */}
        <div className="absolute top-2 left-2 w-1.5 h-4 bg-black/40 blur-[1px] transform -rotate-12 origin-top-left rounded-full" />
        
        {/* The plastic head (3D red sphere) */}
        <div className="absolute top-0 w-[18px] h-[18px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#ff6b6b_0%,#dc2626_60%,#7f1d1d_100%)] shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center border border-[#7f1d1d]">
          {/* Highlight / Reflection */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-[1px]" />
          {/* Center mold dot */}
          <div className="absolute w-[3px] h-[3px] bg-red-950/40 rounded-full" />
        </div>
      </div>

      {/* Journal Render */}
      {isJournal && (
        <div className={`w-24 h-36 lg:w-28 lg:h-40 ${item.color || 'bg-[#fffdf8]'} rounded-sm shadow-md relative overflow-hidden border border-gray-300 flex flex-col items-center justify-center`}>
          <div className="absolute top-0 w-full h-4 bg-red-600/10" />
          <div className="text-gray-600 flex flex-col items-center gap-2 px-2 text-center mt-2">
            <item.icon size={20} className="text-gray-400" />
            <span className="font-serif text-xs font-bold leading-tight">{item.title}</span>
            <span className="font-mono text-[7px] tracking-widest uppercase text-gray-400">{item.category}</span>
          </div>
        </div>
      )}

      {/* Blueprint Render */}
      {isBlueprint && (
        <div className="w-40 h-28 lg:w-48 lg:h-32 bg-[#1c3f60] p-3 shadow-[8px_8px_15px_rgba(0,0,0,0.5)] border border-blue-400/30 flex flex-col justify-between"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }}
        >
          <div className="border-2 border-white/40 p-2 h-full flex flex-col">
             <div className="flex justify-between items-start mb-1 border-b border-white/40 pb-1">
               <span className="text-white font-mono text-[7px] tracking-widest">FIG 1.0</span>
               <item.icon size={14} className="text-white/80" />
             </div>
             <div className="text-white/90 font-mono text-xs uppercase tracking-wider">{item.title}</div>
          </div>
        </div>
      )}

      {/* Letter Render */}
      {isLetter && (
        <div className="w-36 h-48 lg:w-40 lg:h-52 bg-[#fdfaf6] shadow-[5px_5px_15px_rgba(0,0,0,0.4)] p-4 flex flex-col justify-between border border-[#e8e4db]"
             style={{ backgroundImage: 'linear-gradient(to bottom, #fdfaf6, #f4efe6)' }}>
          <div>
            <div className="w-10 h-10 rounded-full border border-red-800/20 flex items-center justify-center mb-3">
              <item.icon size={16} className="text-red-800/40" />
            </div>
            <div className="font-serif text-sm text-gray-800 border-b border-gray-300 pb-1 mb-1">{item.title}</div>
            <div className="w-full h-1.5 bg-gray-200 mb-1 rounded" />
            <div className="w-3/4 h-1.5 bg-gray-200 rounded" />
          </div>
          <div className="font-handwriting text-xs text-gray-500">{item.date}</div>
        </div>
      )}

      {/* Polaroid Render */}
      {isPolaroid && (
        <div className="w-28 lg:w-32 bg-white p-2 pb-6 shadow-[5px_5px_15px_rgba(0,0,0,0.5)] rounded-sm">
          <div className="w-full aspect-square bg-gray-200 mb-1 overflow-hidden shadow-inner border border-black/5">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover filter contrast-125 saturate-50 sepia-[0.2]" />
          </div>
          <div className="font-handwriting text-gray-800 text-center text-xs">{item.title}</div>
        </div>
      )}

      {/* Sticky Note Render */}
      {isSticky && (
        <div className={`w-24 h-24 lg:w-28 lg:h-28 ${item.color} shadow-[2px_5px_10px_rgba(0,0,0,0.3)] p-3 flex flex-col justify-between`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
          <div className="font-handwriting text-gray-800 text-sm leading-tight">{item.title}</div>
          <item.icon size={14} className="text-black/30 self-end" />
        </div>
      )}
    </motion.div>
  )
}

function ExpandedItem({ item, onClose }) {
  const isJournal = item.type === 'journal'
  const isBlueprint = item.type === 'blueprint'
  const isLetter = item.type === 'letter'
  const isPolaroid = item.type === 'polaroid'
  const isSticky = item.type === 'sticky'

  return (
    <div className="relative group perspective-1000">
      
      {isJournal && (
        <div className="w-full max-w-[600px] h-auto md:h-[400px] bg-[#f4ebd8] flex flex-col md:flex-row shadow-2xl rounded-sm overflow-hidden"
             style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.1) 100%), linear-gradient(0deg, #f4ebd8, #fffdf8)' }}>
          <div className="w-full md:w-1/2 h-48 md:h-full border-b md:border-b-0 md:border-r border-black/10 p-6 md:p-10 flex flex-col justify-center relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)]">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <item.icon size={32} className="text-black/60" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2">{item.title}</h2>
            <div className="font-mono text-sm text-gray-500 uppercase tracking-widest">{item.date}</div>
          </div>
          <div className="w-full md:w-1/2 h-auto md:h-full p-6 md:p-10 flex flex-col justify-center relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)]">
             <p className="font-handwriting text-xl md:text-2xl text-gray-800 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      )}

      {isBlueprint && (
        <div className="w-full max-w-[700px] h-auto md:h-[500px] bg-[#1c3f60] p-4 md:p-8 shadow-2xl border-4 border-blue-400/20 flex flex-col"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
          <div className="border-4 border-white/30 p-8 h-full flex flex-col relative">
             <div className="absolute top-0 left-0 w-full flex justify-between p-4 border-b-4 border-white/30">
               <div className="font-mono text-white/80 tracking-widest">PROJECT: {item.title.toUpperCase()}</div>
               <div className="font-mono text-white/80 tracking-widest">DATE: {item.date}</div>
             </div>
             <div className="flex-1 flex items-center justify-center mt-16">
               <item.icon size={120} className="text-white/20" strokeWidth={1} />
             </div>
             <div className="absolute bottom-0 right-0 p-6 border-t-4 border-l-4 border-white/30 max-w-sm bg-[#1c3f60]">
                <p className="font-mono text-white/90 text-sm leading-relaxed">{item.desc}</p>
             </div>
          </div>
        </div>
      )}

      {isLetter && (
        <div className="w-full max-w-[500px] min-h-[400px] bg-[#fdfaf6] shadow-2xl p-6 md:p-12 flex flex-col border border-[#e8e4db]"
             style={{ backgroundImage: 'linear-gradient(to bottom, #fdfaf6, #f4efe6)' }}>
          <div className="flex justify-between items-start mb-12 border-b border-gray-300 pb-8">
            <div className="w-16 h-16 rounded-full border-2 border-red-800/40 flex items-center justify-center">
              <item.icon size={28} className="text-red-800/60" />
            </div>
            <div className="text-right">
              <div className="font-serif text-xl font-bold text-gray-900">{item.title}</div>
              <div className="font-mono text-sm text-gray-500 mt-2">{item.date}</div>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-serif text-xl text-gray-800 leading-loose">{item.desc}</p>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
             <div className="font-handwriting text-3xl text-gray-600">Approved</div>
          </div>
        </div>
      )}

      {isPolaroid && (
        <div className="w-full max-w-[400px] bg-white p-4 md:p-6 pb-12 md:pb-20 shadow-2xl rounded-sm">
          <div className="w-full aspect-square bg-gray-200 mb-6 overflow-hidden shadow-inner border border-black/5">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover filter contrast-125 saturate-50 sepia-[0.2]" />
          </div>
          <div className="font-handwriting text-gray-800 text-center text-4xl mb-2">{item.title}</div>
          <div className="font-mono text-gray-500 text-center text-sm">{item.date}</div>
          <div className="font-handwriting text-gray-600 text-center text-xl mt-4">{item.desc}</div>
        </div>
      )}

      {isSticky && (
        <div className={`w-full max-w-[400px] h-auto min-h-[250px] md:h-[400px] ${item.color} shadow-2xl p-6 md:p-10 flex flex-col justify-center`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
          <div className="font-handwriting text-gray-800 text-5xl leading-tight mb-8 text-center">{item.title}</div>
          <div className="font-handwriting text-gray-700 text-2xl leading-relaxed text-center">{item.desc}</div>
          <div className="font-mono text-black/40 text-sm absolute bottom-8 right-8">{item.date}</div>
        </div>
      )}

      <button 
        onClick={onClose}
        className="absolute top-2 right-2 md:-top-6 md:-right-6 w-10 h-10 md:w-12 md:h-12 bg-black/80 md:bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-[100]"
      >
        <X size={20} className="md:w-6 md:h-6" />
      </button>

    </div>
  )
}
