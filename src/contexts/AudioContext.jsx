import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

const AudioContext = createContext()

export function useAudio() {
  return useContext(AudioContext)
}

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Create an audio element
    const audio = new Audio('/ambient.mp3')
    audio.loop = true
    audio.volume = 0.4 // Set a pleasant ambient volume
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.error("Audio playback failed:", err)
        setIsPlaying(false)
      })
    }
  }

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  )
}
