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
const generateLayout = (items) => {
  // Count total items per category to determine grid sizes
  const counts = {};
  items.forEach(i => {
    const cat = i.category || 'Career';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const currentIdx = {};

  return items.map((item) => {
    const cat = item.category || 'Career';
    currentIdx[cat] = (currentIdx[cat] || 0) + 1;
    
    const total = counts[cat];
    const idx = currentIdx[cat] - 1; // 0-based

    // Determine grid size for this specific cluster (e.g., 3x3 for 9 items)
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);

    const col = idx % cols;
    const row = Math.floor(idx / cols);

    // Define strict bounding boxes for each quadrant
    // This creates a 10% dead-zone cross in the middle of the board (45-55)
    // and a 15% safety margin on the outer edges (0-15 and 85-100)
    const bounds = {
      'Career': { minX: 15, maxX: 45, minY: 15, maxY: 45 },
      'Award': { minX: 55, maxX: 85, minY: 15, maxY: 45 },
      'Milestone': { minX: 15, maxX: 45, minY: 55, maxY: 85 },
      'Personal': { minX: 55, maxX: 85, minY: 55, maxY: 85 }
    };

    const b = bounds[cat] || bounds['Career'];
    
    // Calculate exact X, Y grid spacing
    const stepX = cols > 1 ? (b.maxX - b.minX) / (cols - 1) : 0;
    const stepY = rows > 1 ? (b.maxY - b.minY) / (rows - 1) : 0;

    // Base coordinate in the grid
    const baseX = cols > 1 ? b.minX + col * stepX : (b.minX + b.maxX) / 2;
    const baseY = rows > 1 ? b.minY + row * stepY : (b.minY + b.maxY) / 2;

    // Add random jitter so it looks like a natural scatter, not a rigid spreadsheet
    const jitterX = (Math.random() - 0.5) * 6; // +/- 3%
    const jitterY = (Math.random() - 0.5) * 6; // +/- 3%

    // Clamp inside the quadrant's strict boundary
    const finalX = Math.max(b.minX, Math.min(b.maxX, baseX + jitterX));
    const finalY = Math.max(b.minY, Math.min(b.maxY, baseY + jitterY));
    const rotation = (Math.random() * 30) - 15;

    return {
      ...item,
      x: finalX,
      y: finalY,
      rotation,
      type: getTypeForCategory(cat),
      icon: getIconForCategory(cat)
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
                
                // Connections anchored to the exact center of each item
                const x1 = `${itemA.x}%`;
                const y1 = `${itemA.y}%`;
                const x2 = `${itemB.x}%`;
                const y2 = `${itemB.y}%`;

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
        x: "-50%",
        y: "-50%",
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
  
  const desc = item.desc || item.description || ''

  return (
    <div className="relative group perspective-1000">
      
      {isJournal && (
        <div className="w-full max-w-[750px] h-auto md:h-[450px] bg-[#f4ebd8] flex flex-col md:flex-row shadow-2xl rounded-sm overflow-hidden"
             style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.1) 100%), linear-gradient(0deg, #f4ebd8, #fffdf8)' }}>
          <div className="w-full md:w-5/12 h-48 md:h-full border-b md:border-b-0 md:border-r border-black/10 p-6 md:p-8 flex flex-col justify-center relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)]">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <item.icon size={32} className="text-black/60" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2">{item.title}</h2>
            <div className="font-mono text-sm text-gray-500 uppercase tracking-widest">{item.date}</div>
          </div>
          <div className="w-full md:w-7/12 h-[300px] md:h-full p-6 md:p-10 flex flex-col relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] overflow-y-auto">
             <p className="font-serif text-base md:text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">{desc}</p>
          </div>
        </div>
      )}

      {isBlueprint && (
        <div className="w-full max-w-[800px] h-auto md:h-[450px] bg-[#1c3f60] p-4 md:p-6 shadow-2xl border-4 border-blue-400/20 flex flex-col"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
          <div className="border-4 border-white/30 p-6 h-full flex flex-col md:flex-row relative gap-6">
             <div className="absolute top-0 left-0 w-full flex justify-between p-3 border-b-4 border-white/30">
               <div className="font-mono text-white/80 tracking-widest text-xs md:text-sm">PROJECT: {item.title.toUpperCase()}</div>
               <div className="font-mono text-white/80 tracking-widest text-xs md:text-sm">DATE: {item.date}</div>
             </div>
             
             <div className="w-full md:w-1/3 flex items-center justify-center mt-12 md:mt-0 border-b-4 md:border-b-0 md:border-r-4 border-white/30 pb-6 md:pb-0 md:pr-6">
               <item.icon size={100} className="text-white/20" strokeWidth={1} />
             </div>
             
             <div className="w-full md:w-2/3 mt-4 md:mt-12 overflow-y-auto pr-2">
                <h3 className="font-mono text-white text-xl mb-4">{item.title}</h3>
                <p className="font-mono text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{desc}</p>
             </div>
          </div>
        </div>
      )}

      {isLetter && (
        <div className="w-full max-w-[750px] h-auto md:h-[400px] bg-[#fdfaf6] shadow-2xl flex flex-col md:flex-row border border-[#e8e4db] overflow-hidden"
             style={{ backgroundImage: 'linear-gradient(to bottom, #fdfaf6, #f4efe6)' }}>
          <div className="w-full md:w-1/3 p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-full border-2 border-red-800/40 flex items-center justify-center mb-6">
                <item.icon size={28} className="text-red-800/60" />
              </div>
              <div className="font-serif text-2xl font-bold text-gray-900">{item.title}</div>
              <div className="font-mono text-sm text-gray-500 mt-2">{item.date}</div>
            </div>
            <div className="hidden md:block mt-8 pt-6 border-t border-gray-200">
               <div className="font-handwriting text-3xl text-gray-600">Approved</div>
            </div>
          </div>
          <div className="w-full md:w-2/3 p-6 md:p-10 overflow-y-auto">
            <p className="font-serif text-base md:text-lg text-gray-800 leading-loose whitespace-pre-wrap">{desc}</p>
          </div>
        </div>
      )}

      {isPolaroid && (
        <div className="w-full max-w-[650px] h-auto md:h-[400px] bg-white p-4 md:p-6 shadow-2xl rounded-sm flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="w-full md:w-1/2 aspect-square md:h-full bg-gray-200 overflow-hidden shadow-inner border border-black/5">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover filter contrast-125 saturate-50 sepia-[0.2]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                 <item.icon size={48} className="text-gray-300" />
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center overflow-y-auto pb-4 md:pb-0">
            <div className="font-handwriting text-gray-800 text-4xl mb-2">{item.title}</div>
            <div className="font-mono text-gray-500 text-sm mb-6">{item.date}</div>
            <div className="font-handwriting text-gray-600 text-2xl leading-relaxed whitespace-pre-wrap">{desc}</div>
          </div>
        </div>
      )}

      {isSticky && (
        <div className={`w-full max-w-[600px] h-auto min-h-[300px] ${item.color} shadow-2xl p-6 md:p-10 flex flex-col`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
          <div className="font-handwriting text-gray-800 text-4xl md:text-5xl leading-tight mb-6">{item.title}</div>
          <div className="font-handwriting text-gray-700 text-xl md:text-2xl leading-relaxed flex-1 overflow-y-auto pr-2 whitespace-pre-wrap">{desc}</div>
          <div className="font-mono text-black/40 text-sm mt-6">{item.date}</div>
        </div>
      )}

      <button 
        onClick={onClose}
        className="absolute top-2 right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-10 md:h-10 bg-black/80 md:bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-[100]"
      >
        <X size={20} />
      </button>

    </div>
  )
}

