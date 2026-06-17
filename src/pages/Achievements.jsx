import React, { useState, useRef, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
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

// Generate an auto-layout spiral starting from the center
const generateLayout = (items) => {
  const centerX = 1500;
  const centerY = 1500;
  
  return items.map((item, index) => {
    // Spiral logic
    const angle = index * 1.5;
    const radius = 200 + (index * 80);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const rotation = (Math.random() * 30) - 15;
    
    return {
      ...item,
      x,
      y,
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
  const constraintsRef = useRef(null)
  const containerRef = useRef(null)
  
  // Center the desk initially
  const controls = useAnimation()

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

    // Center the desk initially
    const clusterCenterX = 1500;
    const clusterCenterY = 1500;
    const targetX = (window.innerWidth / 2) - clusterCenterX;
    const targetY = (window.innerHeight / 2) - clusterCenterY;

    // Initial animation to show it's draggable and center it perfectly
    controls.start({
      x: targetX,
      y: targetY,
      transition: { type: 'spring', stiffness: 50, damping: 20 }
    })

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      // Update CSS variables for the flashlight position
      containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
      containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [controls])

  return (
    <PageWrapper title="The Desk" fullScreen={true}>
      
      {/* Viewport for dragging */}
      <div 
        ref={(el) => {
          constraintsRef.current = el;
          containerRef.current = el;
        }} 
        className="w-full h-screen overflow-hidden bg-[#0a0705] relative select-none cursor-grab active:cursor-grabbing"
      >
        {/* Dynamic Flashlight Overlay */}
        <div 
          className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-500"
          style={{ 
            opacity: selectedItem ? 0 : 1,
            background: 'radial-gradient(circle 400px at var(--mouse-x, 50vw) var(--mouse-y, 50vh), transparent 0%, rgba(5,3,2,0.85) 100%)' 
          }} 
        />

        {/* Instructions overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-50 bg-black/50 text-white px-6 py-2 rounded-full font-handwriting text-xl backdrop-blur-sm border border-white/10">
          Click and drag to explore the desk
        </div>

        {/* The massive desk surface */}
        <motion.div 
          drag 
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          dragMomentum={true}
          animate={controls}
          initial={{ x: -1000, y: -1000 }}
          className="relative w-[3000px] h-[3000px] bg-[#2c1e16]"
          style={{
            // Wood grain texture
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 2px, transparent 2px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 2px, transparent 2px),
              linear-gradient(rgba(20, 10, 5, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(20, 10, 5, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
            boxShadow: 'inset 0 0 400px rgba(0,0,0,0.9)'
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
              
              // Add offset so the string originates roughly from the center of the objects
              const x1 = itemA.x + 80;
              const y1 = itemA.y + 80;
              const x2 = itemB.x + 80;
              const y2 = itemB.y + 80;

              return (
                <g key={idx}>
                  {/* The red yarn */}
                  <line 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke="#991b1b" 
                    strokeWidth="4"
                    filter="url(#string-shadow)"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
                  {/* Yarn threads texture */}
                  <line 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke="#ef4444" 
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="opacity-60"
                  />
                  {/* The Push Pins */}
                  <circle cx={x1} cy={y1} r="6" fill="#dc2626" stroke="#450a0a" strokeWidth="2" filter="url(#string-shadow)" />
                  <circle cx={x1-2} cy={y1-2} r="2" fill="#fca5a5" /> {/* Pin highlight */}
                  
                  <circle cx={x2} cy={y2} r="6" fill="#dc2626" stroke="#450a0a" strokeWidth="2" filter="url(#string-shadow)" />
                </g>
              )
            })}
          </svg>

          {/* Desk Items */}
          {items.map((item) => (
            <DeskItem 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedItem(item)} 
              isDimmed={selectedItem && selectedItem.id !== item.id}
            />
          ))}

          {/* Aesthetic Desk Props (Non-interactive) */}
          <div className="absolute w-64 h-64 border-4 border-white/5 rounded-full pointer-events-none" style={{ left: 1300, top: 1400 }} /> {/* Coffee ring */}
          <div className="absolute w-40 h-40 bg-black/20 blur-xl rounded-full pointer-events-none" style={{ left: 1800, top: 1600 }} /> {/* Shadow of a lamp */}

        </motion.div>
      </div>

      {/* Examine Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md cursor-zoom-out"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              layoutId={`item-${selectedItem.id}`}
              className="relative cursor-default"
              onClick={e => e.stopPropagation()}
            >
              <ExpandedItem item={selectedItem} onClose={() => setSelectedItem(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      layoutId={`item-${item.id}`}
      className={`absolute cursor-pointer transition-opacity duration-300 ${isDimmed ? 'opacity-40' : 'opacity-100 hover:z-10'}`}
      style={{
        left: item.x,
        top: item.y,
        rotate: item.rotation,
      }}
      whileHover={{ scale: 1.05, rotate: item.rotation > 0 ? item.rotation + 2 : item.rotation - 2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Journal Render */}
      {isJournal && (
        <div className={`w-32 h-48 ${item.color || 'bg-[#2a2a2a]'} rounded-r-xl rounded-l-sm shadow-[10px_10px_20px_rgba(0,0,0,0.6)] relative overflow-hidden border-l-8 border-black/30 flex items-center justify-center`}>
          <div className="absolute right-4 w-1 h-full bg-black/10" /> {/* Elastic band */}
          <div className="text-white/40 flex flex-col items-center gap-2">
            <item.icon size={24} />
            <span className="font-mono text-[10px] tracking-widest uppercase">{item.category}</span>
          </div>
        </div>
      )}

      {/* Blueprint Render */}
      {isBlueprint && (
        <div className="w-56 h-40 bg-[#1c3f60] p-4 shadow-[8px_8px_15px_rgba(0,0,0,0.5)] border border-blue-400/30 flex flex-col justify-between"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }}
        >
          <div className="border-2 border-white/40 p-2 h-full flex flex-col">
             <div className="flex justify-between items-start mb-2 border-b border-white/40 pb-2">
               <span className="text-white font-mono text-[8px] tracking-widest">FIG 1.0</span>
               <item.icon size={16} className="text-white/80" />
             </div>
             <div className="text-white/90 font-mono text-sm uppercase tracking-wider">{item.title}</div>
          </div>
        </div>
      )}

      {/* Letter Render */}
      {isLetter && (
        <div className="w-48 h-64 bg-[#fdfaf6] shadow-[5px_5px_15px_rgba(0,0,0,0.4)] p-6 flex flex-col justify-between border border-[#e8e4db]"
             style={{ backgroundImage: 'linear-gradient(to bottom, #fdfaf6, #f4efe6)' }}>
          <div>
            <div className="w-12 h-12 rounded-full border border-red-800/20 flex items-center justify-center mb-4">
              <item.icon size={20} className="text-red-800/40" />
            </div>
            <div className="font-serif text-lg text-gray-800 border-b border-gray-300 pb-2 mb-2">{item.title}</div>
            <div className="w-full h-2 bg-gray-200 mb-2 rounded" />
            <div className="w-3/4 h-2 bg-gray-200 rounded" />
          </div>
          <div className="font-handwriting text-sm text-gray-500">{item.date}</div>
        </div>
      )}

      {/* Polaroid Render */}
      {isPolaroid && (
        <div className="w-40 bg-white p-3 pb-8 shadow-[5px_5px_15px_rgba(0,0,0,0.5)] rounded-sm">
          <div className="w-full aspect-square bg-gray-200 mb-2 overflow-hidden shadow-inner border border-black/5">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover filter contrast-125 saturate-50 sepia-[0.2]" />
          </div>
          <div className="font-handwriting text-gray-800 text-center text-sm">{item.title}</div>
        </div>
      )}

      {/* Sticky Note Render */}
      {isSticky && (
        <div className={`w-32 h-32 ${item.color} shadow-[2px_5px_10px_rgba(0,0,0,0.3)] p-4 flex flex-col justify-between`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
          <div className="font-handwriting text-gray-800 text-lg leading-tight">{item.title}</div>
          <item.icon size={16} className="text-black/30 self-end" />
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
        <div className="w-[600px] h-[400px] bg-[#f4ebd8] flex shadow-2xl rounded-sm overflow-hidden"
             style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.1) 100%), linear-gradient(0deg, #f4ebd8, #fffdf8)' }}>
          {/* Left Page */}
          <div className="w-1/2 h-full border-r border-black/10 p-10 flex flex-col justify-center relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)]">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <item.icon size={32} className="text-black/60" />
            </div>
            <h2 className="font-serif text-3xl text-gray-900 mb-2">{item.title}</h2>
            <div className="font-mono text-sm text-gray-500 uppercase tracking-widest">{item.date}</div>
          </div>
          {/* Right Page */}
          <div className="w-1/2 h-full p-10 flex flex-col justify-center relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)]">
             <p className="font-handwriting text-2xl text-gray-800 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      )}

      {isBlueprint && (
        <div className="w-[700px] h-[500px] bg-[#1c3f60] p-8 shadow-2xl border-4 border-blue-400/20 flex flex-col"
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
        <div className="w-[500px] min-h-[600px] bg-[#fdfaf6] shadow-2xl p-12 flex flex-col border border-[#e8e4db]"
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
        <div className="w-[400px] bg-white p-6 pb-20 shadow-2xl rounded-sm">
          <div className="w-full aspect-square bg-gray-200 mb-6 overflow-hidden shadow-inner border border-black/5">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover filter contrast-125 saturate-50 sepia-[0.2]" />
          </div>
          <div className="font-handwriting text-gray-800 text-center text-4xl mb-2">{item.title}</div>
          <div className="font-mono text-gray-500 text-center text-sm">{item.date}</div>
          <div className="font-handwriting text-gray-600 text-center text-xl mt-4">{item.desc}</div>
        </div>
      )}

      {isSticky && (
        <div className={`w-[400px] h-[400px] ${item.color} shadow-2xl p-10 flex flex-col justify-center`}
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
          <div className="font-handwriting text-gray-800 text-5xl leading-tight mb-8 text-center">{item.title}</div>
          <div className="font-handwriting text-gray-700 text-2xl leading-relaxed text-center">{item.desc}</div>
          <div className="font-mono text-black/40 text-sm absolute bottom-8 right-8">{item.date}</div>
        </div>
      )}

      <button 
        onClick={onClose}
        className="absolute -top-6 -right-6 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-50"
      >
        <X size={24} />
      </button>

    </div>
  )
}
