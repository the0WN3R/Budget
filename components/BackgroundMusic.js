/**
 * Background Music Component
 * Plays background music on loop
 * 
 * To add your music file:
 * 1. Place your MP3 file in /public/music/
 * 2. Update the MUSIC_FILE_PATH constant below with your filename
 */

import { useEffect, useRef, useState } from 'react'

// Path to your music file (relative to /public directory)
// Example: '/music/background-music.mp3'
const MUSIC_FILE_PATH = '/music/Intrepid_Servant_By_Allan_Arnold.mp3'

export default function BackgroundMusic() {
  const audioRef = useRef(null)
  const [volume, setVolume] = useState(30) // Default 30%
  const [isEnabled, setIsEnabled] = useState(true) // Default to enabled

  // Load volume and enabled state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('backgroundMusicVolume')
      if (savedVolume !== null) {
        setVolume(parseInt(savedVolume, 10))
      }

      // Check if music is enabled (default to true if not set)
      const savedEnabled = localStorage.getItem('backgroundMusicEnabled')
      setIsEnabled(savedEnabled === null ? true : savedEnabled === 'true')
    }
  }, [])

  // Listen for volume and toggle changes from settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleVolumeChange = (e) => {
        if (e.detail !== null && e.detail !== undefined) {
          setVolume(e.detail)
        }
      }

      const handleToggleChange = (e) => {
        if (e.detail !== null && e.detail !== undefined) {
          setIsEnabled(e.detail)
        }
      }
      
      window.addEventListener('musicVolumeChange', handleVolumeChange)
      window.addEventListener('musicToggleChange', handleToggleChange)
      return () => {
        window.removeEventListener('musicVolumeChange', handleVolumeChange)
        window.removeEventListener('musicToggleChange', handleToggleChange)
      }
    }
  }, [])

  // Auto-play music when component mounts, but only if enabled
  useEffect(() => {
    if (audioRef.current && isEnabled) {
      // Try to play immediately
      const playAudio = () => {
        if (audioRef.current && isEnabled) {
          audioRef.current.play().catch(err => {
            // If autoplay is blocked, try again after a short delay
            setTimeout(() => {
              if (audioRef.current && isEnabled) {
                audioRef.current.play().catch(() => {
                  // Try one more time after another delay
                  setTimeout(() => {
                    if (audioRef.current && isEnabled) {
                      audioRef.current.play().catch(() => {
                        // Silently handle autoplay restrictions
                      })
                    }
                  }, 1000)
                })
              }
            }, 500)
          })
        }
      }
      
      // Try immediately
      playAudio()
      
      // Also try after a short delay in case audio needs to load
      const timer = setTimeout(playAudio, 500)
      const timer2 = setTimeout(playAudio, 1500)
      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
      }
    } else if (audioRef.current && !isEnabled) {
      // Pause if disabled
      audioRef.current.pause()
    }
  }, [isEnabled])

  // Handle enabled state changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    if (isEnabled) {
      // Try to play when enabled
      audio.play().catch(() => {
        // Silently handle if autoplay is blocked
      })
    } else {
      // Pause when disabled
      audio.pause()
    }
  }, [isEnabled])

  // Update volume when it changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    // Convert volume from 0-100 to 0-1
    audio.volume = volume / 100
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      // Loop the music if enabled
      if (isEnabled) {
        audio.currentTime = 0
        audio.play().catch(() => {
          // Silently handle replay errors
        })
      }
    }

    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isEnabled])

  return (
    <audio
      ref={audioRef}
      loop
      preload="auto"
      autoPlay
      style={{ display: 'none' }}
    >
      <source src={MUSIC_FILE_PATH} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  )
}

