/**
 * Background Music Component
 * Plays pleasant background music with multiple style options:
 * - Soft & Muted: Peaceful classic grand piano
 * - Funky/Pop: Upbeat and energetic
 * - Classical: Orchestra and symphony
 * 
 * To use custom music files, add them to /public/music/:
 * - soft-muted.mp3 (peaceful grand piano)
 * - funky-pop.mp3
 * - classical.mp3 (orchestra/symphony)
 */

import { useEffect, useRef, useState } from 'react'

// Music style configurations
const MUSIC_STYLES = {
  'soft-muted': {
    name: 'Soft & Muted',
    description: 'Peaceful classic grand piano',
    sources: [
      '/music/soft-muted.mp3', // Local file takes priority - add peaceful grand piano music here
      // If you have a direct URL to grand piano music, add it here:
      // 'https://your-music-cdn.com/grand-piano.mp3'
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Temporary placeholder - replace with actual grand piano music
    ]
  },
  'funky-pop': {
    name: 'Funky/Pop',
    description: 'Upbeat and energetic',
    sources: [
      '/music/funky-pop.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    ]
  },
  'classical': {
    name: 'Classical',
    description: 'Orchestra and symphony',
    sources: [
      '/music/classical.mp3', // Local file takes priority - add orchestra/symphony music here
      // If you have a direct URL to orchestra/symphony music, add it here:
      // 'https://your-music-cdn.com/orchestra.mp3'
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' // Temporary placeholder - replace with actual orchestra/symphony music
    ]
  }
}

export default function BackgroundMusic() {
  const audioRef = useRef(null)
  const [musicStyle, setMusicStyle] = useState('soft-muted')
  const [volume, setVolume] = useState(30) // Default 30%

  // Load music style and volume preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStyle = localStorage.getItem('backgroundMusicStyle')
      if (savedStyle && MUSIC_STYLES[savedStyle]) {
        setMusicStyle(savedStyle)
      }
      
      const savedVolume = localStorage.getItem('backgroundMusicVolume')
      if (savedVolume !== null) {
        setVolume(parseInt(savedVolume, 10))
      }
    }
  }, [])

  // Listen for music style changes from settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStyleChange = (e) => {
        if (e.detail && MUSIC_STYLES[e.detail]) {
          setMusicStyle(e.detail)
          if (audioRef.current) {
            // Reload audio with new source
            audioRef.current.load()
            audioRef.current.play().catch(err => {
              console.log('Error playing new music style:', err)
            })
          }
        }
      }
      
      const handleVolumeChange = (e) => {
        if (e.detail !== null && e.detail !== undefined) {
          setVolume(e.detail)
        }
      }
      
      window.addEventListener('musicStyleChange', handleStyleChange)
      window.addEventListener('musicVolumeChange', handleVolumeChange)
      return () => {
        window.removeEventListener('musicStyleChange', handleStyleChange)
        window.removeEventListener('musicVolumeChange', handleVolumeChange)
      }
    }
  }, [])

  // Auto-play music when style changes or component mounts - ALWAYS play
  useEffect(() => {
    if (audioRef.current) {
      // Try to play immediately - always play, regardless of volume
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            // If autoplay is blocked, try again after a short delay
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play().catch(() => {
                  // Try one more time after another delay
                  setTimeout(() => {
                    if (audioRef.current) {
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
    }
  }, [musicStyle])

  // Update volume when it changes - music always plays, just at different volumes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    // Convert volume from 0-100 to 0-1
    // Even at 0, the audio still plays (just silent)
    audio.volume = volume / 100
    
    // Always ensure audio is playing (volume can be 0 but audio still runs)
    if (audio.paused) {
      audio.play().catch(() => {
        // Silently handle if autoplay is blocked
      })
    }
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      // Loop the music
      audio.currentTime = 0
      audio.play().catch(err => console.log('Error replaying music:', err))
    }

    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const currentStyle = MUSIC_STYLES[musicStyle] || MUSIC_STYLES['soft-muted']

  return (
    <audio
      key={musicStyle} // Force re-render when style changes
      ref={audioRef}
      loop
      preload="auto"
      autoPlay
      style={{ display: 'none' }}
    >
      {currentStyle.sources.map((src, index) => (
        <source key={index} src={src} type="audio/mpeg" />
      ))}
      Your browser does not support the audio element.
    </audio>
  )
}

