import React, { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, Lightbulb, Map, Quote, X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function Future() {
  const [items, setItems] = useState([])
  const [columns, setColumns] = useState(3)
  const [expandedItem, setExpandedItem] = useState(null)

  useEffect(() => {
    const fetchHorizon = async () => {
      const snap = await getDocs(collection(db, 'horizon'));
      const data = snap.docs.map(doc => {
        const d = doc.data();
        let height = 'h-64';
        if (d.category === 'thought') height = 'h-72';
        if (d.category === 'vision') height = 'h-96';
        
        return {
          id: doc.id,
          ...d,
          type: d.category ? d.category.toLowerCase() : 'thought',
          tags: d.tags ? d.tags.split(',').map(t => t.trim()) : [],
          height
        }
      });
      data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setItems(data);
    };
    fetchHorizon();
  }, [])

  // Responsive column calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setColumns(1)
      else if (window.innerWidth < 1024) setColumns(2)
      else setColumns(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Split items into columns
  const colWrappers = Array.from({ length: columns }, () => [])
  items.forEach((item, idx) => {
    colWrappers[idx % columns].push(item)
  })

  return (
    <PageWrapper title="Vision Board" fullScreen={true}>
      
      {/* Architectural Grid Background */}
      <div className="flex-1 h-full bg-[#faf9f6] pt-32 pb-24 px-4 sm:px-12 relative"
           style={{
             backgroundImage: `
               linear-gradient(#e5e7eb 1px, transparent 1px),
               linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px',
           }}>
        
        {/* Subtle vignette for depth */}
        <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.05)] z-0" />

        <div className="w-full relative z-10">
          
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-4 tracking-tight">The Board</h1>
            <p className="font-mono text-gray-500 max-w-2xl mx-auto text-sm uppercase tracking-widest">
              Unfiltered thoughts, startup wireframes, and visions yet to be realized.
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="flex gap-6 items-start">
            {colWrappers.map((col, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-6">
                {col.map((item) => (
                  <VisionItem key={item.id} item={item} onClick={() => setExpandedItem(item)} />
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Expanded Flip Modal */}
      <AnimatePresence>
        {expandedItem && (
          <ExpandedItemModal item={expandedItem} onClose={() => setExpandedItem(null)} />
        )}
      </AnimatePresence>

    </PageWrapper>
  )
}

function VisionItem({ item, onClick }) {
  const isStartup = item.type === 'startup'
  const isThought = item.type === 'thought'
  const isVision = item.type === 'vision'

  return (
    <motion.div 
      layoutId={`card-${item.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative w-full cursor-pointer group perspective-1000 ${item.height}`}
    >
      {/* Tape styling based on type */}
      {isVision && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm shadow-sm z-20 rotate-[-2deg] border border-white/20" />
      )}
      {isThought && (
        <div className="absolute -top-2 left-4 w-6 h-6 bg-red-400 rounded-full shadow-md z-20 flex items-center justify-center border-2 border-white">
          <div className="w-2 h-2 bg-black/20 rounded-full" />
        </div>
      )}

      {/* Startup Index Card */}
      {isStartup && (
        <div className="w-full h-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-sm p-6 border border-gray-100 flex flex-col relative overflow-hidden">
          {/* Red header line */}
          <div className="absolute top-10 left-0 w-full h-[2px] bg-red-400/30" />
          {/* Blue ruled lines */}
          <div className="absolute top-10 left-0 w-full h-full pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)', backgroundSize: '100% 28px' }} />
          
          <div className="flex items-center gap-2 mb-6 z-10">
            <Lightbulb size={16} className="text-yellow-500" />
            <span className="font-mono text-xs uppercase text-gray-500 tracking-wider">Startup Idea</span>
          </div>
          
          <h3 className="font-serif text-2xl text-gray-900 mb-4 z-10 leading-tight">{item.title}</h3>
          
          <div className="mt-auto flex flex-wrap gap-2 z-10">
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Thought Torn Paper */}
      {isThought && (
        <div className="w-full h-full bg-[#fdfbf7] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8 flex flex-col relative"
             style={{ clipPath: 'polygon(0 0, 100% 2%, 98% 100%, 2% 98%)' }}>
          <Quote size={24} className="text-gray-300 mb-4" />
          <h3 className="font-handwriting text-3xl text-gray-800 mb-4 leading-tight">{item.title}</h3>
          <p className="font-handwriting text-xl text-gray-600 line-clamp-4 leading-relaxed">{item.desc}</p>
          <div className="mt-auto font-mono text-xs text-gray-400">Jotted down in transit.</div>
        </div>
      )}

      {/* Vision Polaroid */}
      {isVision && (
        <div className="w-full h-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-4 pb-16 flex flex-col relative rotate-1">
          <div className="w-full flex-1 bg-gray-200 relative overflow-hidden mb-4">
            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-50" />
          </div>
          <div className="absolute bottom-4 left-0 w-full text-center">
            <span className="font-handwriting text-2xl text-gray-800">{item.title}</span>
          </div>
        </div>
      )}

    </motion.div>
  )
}

function ExpandedItemModal({ item, onClose }) {
  const isStartup = item.type === 'startup'
  const isThought = item.type === 'thought'
  const isVision = item.type === 'vision'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 perspective-1000">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Flipping Container */}
      <motion.div 
        layoutId={`card-${item.id}`}
        className="relative w-full max-w-3xl h-[85vh] cursor-default z-10"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        exit={{ rotateY: 180, opacity: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        onClick={e => e.stopPropagation()}
      >
        
        {/* The Back Side (The detail view - this is what you read) */}
        <div 
          className="absolute inset-0 w-full h-full shadow-2xl rounded-lg bg-white border border-gray-200 overflow-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              {isStartup && <Lightbulb size={20} className="text-yellow-500" />}
              {isThought && <Quote size={20} className="text-gray-400" />}
              {isVision && <Map size={20} className="text-blue-500" />}
              <span className="font-mono text-sm uppercase tracking-widest text-gray-500">{item.type}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {isVision && item.image && (
              <div className="w-full h-64 md:h-96 bg-gray-100 rounded-md overflow-hidden mb-8 flex-shrink-0">
                 <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <h2 className={`text-4xl mb-6 ${isThought ? 'font-handwriting' : 'font-serif text-gray-900'}`}>
              {item.title}
            </h2>
            
            <p className={`text-xl leading-relaxed text-gray-700 ${isThought ? 'font-handwriting' : 'font-serif'}`}>
              {item.desc}
            </p>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-mono rounded-md">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* The Front Side (Hidden during detail view) */}
        <div 
          className="absolute inset-0 w-full h-full bg-[#fcfbf9] rounded-lg shadow-xl border border-gray-200 flex flex-col items-center justify-center gap-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
           {/* Minimal Aesthetic Loader */}
           <div className="relative w-12 h-12 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
             <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse" />
           </div>
           <div className="font-mono text-xs tracking-[0.3em] text-gray-400 uppercase animate-pulse">Unfolding</div>
        </div>

      </motion.div>
    </div>
  )
}
