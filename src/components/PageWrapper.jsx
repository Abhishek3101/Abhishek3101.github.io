import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageWrapper({ children, title, fullScreen = false, hideBackButton = false }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-[#faf9f5] overflow-y-auto text-foreground z-20"
    >
      <div className={`relative ${fullScreen ? 'w-full h-full min-h-screen' : 'max-w-6xl mx-auto p-8'}`}>
        {!hideBackButton && (
          <button 
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 p-2 bg-white rounded-full shadow hover:scale-105 transition-transform flex items-center gap-2 text-sm text-gray-600 hover:text-black z-50"
          >
            <ArrowLeft size={18} />
            <span>Living Room</span>
          </button>
        )}

        <div className={fullScreen ? 'w-full h-full' : 'pt-16'}>
          {title && !fullScreen && <h1 className="text-4xl font-light mb-8">{title}</h1>}
          {children}
        </div>
      </div>
    </motion.div>
  )
}
