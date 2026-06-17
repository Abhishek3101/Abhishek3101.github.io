import React, { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { motion, AnimatePresence } from 'framer-motion'
import { Disc3, Play, FileText, BookOpen, X } from 'lucide-react'

import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function Curations() {
  const [items, setItems] = useState([])
  const [expandedItem, setExpandedItem] = useState(null)

  useEffect(() => {
    const fetchCurations = async () => {
      const snap = await getDocs(collection(db, 'curations'));
      const data = snap.docs.map(doc => {
        const d = doc.data();
        let shelf = 1;
        let type = 'book';

        if (d.category === 'Book') { shelf = 1; type = 'book'; }
        if (d.category === 'Music') { shelf = 2; type = 'vinyl'; }
        if (d.category === 'Movie') { shelf = 2; type = 'video'; }
        if (d.category === 'Article') { shelf = 3; type = 'article'; }

        return {
          id: doc.id,
          ...d,
          shelf,
          type,
          desc: d.review || ''
        }
      });
      // Sort to show newest first
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setItems(data);
    };
    fetchCurations();
  }, [])

  return (
    <PageWrapper title="Curations" fullScreen={true}>
      
      {/* The Room Background */}
      <div className="flex-1 h-full md:min-h-0 bg-[#14100e] pt-16 pb-8 px-4 sm:px-12 relative md:overflow-hidden overflow-y-auto flex flex-col">
        
        {/* Dynamic Spotlights illuminating the shelves */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,220,150,0.1)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute top-[800px] right-1/4 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(255,220,150,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col h-full">
          
          <div className="mb-8 text-center flex-shrink-0">
            <h1 className="font-serif text-4xl md:text-5xl text-[#f4ecd8] mb-2 tracking-tight drop-shadow-lg">Cabinet of Curiosities</h1>
            <p className="font-mono text-[#8c7a6b] max-w-2xl mx-auto text-xs uppercase tracking-widest">
              The media, books, and art that shaped the architecture of my mind.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-evenly">
            <MuseumShelf title="The Library">
              {items.filter(c => c.shelf === 1).map(item => (
                <CurationObject key={item.id} item={item} onClick={() => setExpandedItem(item)} />
              ))}
            </MuseumShelf>

            <MuseumShelf title="The Audiovisual">
              {items.filter(c => c.shelf === 2).map(item => (
                <CurationObject key={item.id} item={item} onClick={() => setExpandedItem(item)} />
              ))}
            </MuseumShelf>

            <MuseumShelf title="The Archives">
              {items.filter(c => c.shelf === 3).map(item => (
                <CurationObject key={item.id} item={item} onClick={() => setExpandedItem(item)} />
              ))}
            </MuseumShelf>
          </div>

        </div>
      </div>

      {/* Examine Modal */}
      <AnimatePresence>
        {expandedItem && (
          <ExpandedItemModal item={expandedItem} onClose={() => setExpandedItem(null)} />
        )}
      </AnimatePresence>

    </PageWrapper>
  )
}

function MuseumShelf({ title, children }) {
  return (
    <div className="w-full relative pt-6 flex-shrink-0">
      {/* Shelf Brass Plaque Label */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#2a1f1a] border border-[#5d4037] px-4 py-1.5 rounded-sm shadow-[0_5px_10px_rgba(0,0,0,0.5)] z-20">
        <span className="font-mono text-[9px] text-[#bda98c] uppercase tracking-[0.3em]">{title}</span>
        {/* Brass screws */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#8c7a6b] shadow-inner" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#8c7a6b] shadow-inner" />
      </div>

      {/* The Physical Objects */}
      <div className="relative z-10 flex items-end justify-start md:justify-center gap-4 md:gap-12 px-4 pb-2 h-40 sm:h-56 overflow-x-auto md:overflow-x-visible hide-scrollbar">
        {children}
      </div>

      {/* The Wood Shelf Surface & Edge */}
      <div className="relative z-0 w-full mx-auto" style={{ maxWidth: '95%' }}>
        {/* Top of the shelf (the surface items sit on) */}
        <div className="h-4 w-full bg-gradient-to-b from-[#3a261c] to-[#2c1d15] rounded-t-sm" />
        {/* Front face of the shelf */}
        <div className="h-3 w-full bg-gradient-to-b from-[#1a110c] to-[#0d0806] rounded-b-md shadow-[0_15px_30px_rgba(0,0,0,0.9)]" />
      </div>
    </div>
  )
}

function CurationObject({ item, onClick }) {
  const isBook = item.type === 'book'
  const isVinyl = item.type === 'vinyl'
  const isArticle = item.type === 'article'
  const isVideo = item.type === 'video'

  return (
    <motion.div 
      layoutId={`curation-${item.id}`}
      whileHover={{ y: -10, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer relative group perspective-1000"
    >
      {/* Hover Spotlight underneath the item */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-[#ffedd5] opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500 rounded-full" />

      {isBook && (
        <div className="w-24 h-36 sm:w-32 sm:h-48 bg-gray-900 rounded-r-sm shadow-[-5px_0_15px_rgba(0,0,0,0.5)] flex relative overflow-hidden">
           {/* Book Spine Texture */}
           <div className="w-3 h-full bg-gradient-to-r from-black/60 to-transparent border-r border-white/10 z-10" />
           <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-50" />
           {/* Book Gloss Highlight */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {isVinyl && (
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 group">
          {/* The Black Vinyl Disc peeking out */}
          <div className="absolute top-1 -right-4 w-[95%] h-[95%] bg-[#111] rounded-full shadow-xl border border-gray-800 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-4 group-hover:rotate-45">
            <div className="w-1/3 h-1/3 rounded-full bg-red-900 border-4 border-[#222]" />
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
          </div>
          {/* The Cardboard Sleeve */}
          <div className="relative w-full h-full bg-gray-900 shadow-[-5px_0_15px_rgba(0,0,0,0.5)] z-10 overflow-hidden border border-white/10">
            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-50" />
            <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-r from-black/40 to-transparent" /> {/* Fold shadow */}
          </div>
        </div>
      )}

      {isArticle && (
        <div className="w-28 h-36 sm:w-32 sm:h-48 bg-[#f4ebd8] p-1 shadow-[-5px_0_15px_rgba(0,0,0,0.5)] border-2 border-[#1a110c] relative flex flex-col">
          {/* Faux passepartout frame */}
          <div className="w-full h-full border border-[#d2c4b3] p-1.5 flex flex-col bg-[#fdfbf7]">
             <div className="w-full h-1/2 bg-gray-200 mb-2 overflow-hidden border border-gray-300">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover filter grayscale contrast-125 sepia-[0.3]" />
             </div>
             <div className="font-serif text-[8px] sm:text-[10px] text-gray-900 leading-tight border-t border-b border-gray-300 py-1 text-center line-clamp-2">
               {item.title}
             </div>
             <div className="font-mono text-[7px] text-gray-500 text-center mt-1 uppercase tracking-widest">{item.author}</div>
          </div>
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none" />
        </div>
      )}

      {isVideo && (
        <div className="w-40 h-28 sm:w-48 sm:h-32 bg-[#111] p-1.5 shadow-[-5px_0_20px_rgba(0,0,0,0.8)] border border-[#333] rounded-sm relative flex items-center justify-center">
          {/* Screen */}
          <div className="w-full h-full bg-black relative overflow-hidden rounded-[2px]">
             <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover filter contrast-125 opacity-70" />
             {/* Scanlines / CRT effect */}
             <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.25) 50%)', backgroundSize: '100% 4px' }} />
             {/* Play Icon Embossed */}
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                 <Play size={12} className="text-white/60 ml-0.5" />
               </div>
             </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ExpandedItemModal({ item, onClose }) {
  const isBook = item.type === 'book'
  const isVinyl = item.type === 'vinyl'
  const isArticle = item.type === 'article'
  const isVideo = item.type === 'video'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Darkened Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0a0807]/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        layoutId={`curation-${item.id}`}
        className="relative w-full max-w-4xl flex flex-col md:flex-row bg-[#1a1614] rounded-lg shadow-[0_30px_60px_rgba(0,0,0,1)] border border-[#3a2e28] overflow-hidden z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: The massive artwork */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#3a2e28]">
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md scale-110" />
          
          {/* Re-render the physical item large */}
          <div className="relative z-10 transform scale-125 drop-shadow-2xl">
             {isBook && (
                <div className="w-48 h-72 bg-gray-900 rounded-r-md flex relative overflow-hidden border border-white/10">
                   <div className="w-4 h-full bg-gradient-to-r from-black/60 to-transparent border-r border-white/10 z-10" />
                   <img src={item.image} className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-50" />
                </div>
             )}
             {isVinyl && (
                <div className="w-64 h-64 bg-gray-900 overflow-hidden border border-white/10">
                  <img src={item.image} className="w-full h-full object-cover filter contrast-125 saturate-50" />
                </div>
             )}
             {isArticle && (
                <div className="w-48 h-64 bg-[#fdfbf7] p-2 border border-[#d2c4b3] flex flex-col">
                   <div className="w-full h-1/2 bg-gray-200 mb-2 border border-gray-300">
                      <img src={item.image} className="w-full h-full object-cover filter grayscale contrast-125 sepia-[0.3]" />
                   </div>
                   <div className="font-serif text-xs text-gray-900 text-center">{item.title}</div>
                </div>
             )}
             {isVideo && (
                <div className="w-64 h-48 bg-black border border-[#333] relative rounded-sm">
                   <img src={item.image} className="absolute inset-0 w-full h-full object-cover filter contrast-125" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                     <Play size={32} className="text-white" />
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Right Side: The Museum Plaque (Details) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          
          <div className="flex items-center gap-3 mb-6">
            {isBook && <BookOpen size={18} className="text-[#bda98c]" />}
            {isVinyl && <Disc3 size={18} className="text-[#bda98c]" />}
            {isArticle && <FileText size={18} className="text-[#bda98c]" />}
            {isVideo && <Play size={18} className="text-[#bda98c]" />}
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8c7a6b]">{item.type}</span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl text-[#f4ecd8] mb-2 leading-tight">
            {item.title}
          </h2>
          
          <h3 className="font-mono text-sm text-[#bda98c] mb-8 uppercase tracking-widest">
            {item.author}
          </h3>
          
          <div className="w-12 h-1 bg-[#5d4037] mb-8" />
          
          <p className="font-serif text-lg leading-relaxed text-[#cbbba9]">
            {item.desc}
          </p>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-[#8c7a6b] hover:text-[#f4ecd8] transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
