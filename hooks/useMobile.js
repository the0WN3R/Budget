/**
 * Mobile Detection Hook
 * Detects if the user is on a phone (not tablet or desktop)
 * Uses viewport width and touch capabilities to distinguish phones from tablets
 */

import { useState, useEffect } from 'react'

export default function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if device is a phone
    const checkMobile = () => {
      // Get viewport width
      const width = window.innerWidth
      
      // Check if it's a phone (typically <= 768px and touch device)
      // iPads are typically 768px-1024px, so we exclude those
      // Also check user agent for additional mobile indicators
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bTablet\b)|Tablet/i.test(userAgent) || 
                      (width >= 768 && width <= 1024 && isTouchDevice)
      
      // Consider it a phone if:
      // 1. Width is less than 768px (typical phone breakpoint)
      // 2. OR width is less than 1024px AND it's a touch device AND not detected as a tablet
      const isPhone = width < 768 || (width < 1024 && isTouchDevice && !isTablet)
      
      setIsMobile(isPhone)
    }

    // Check on mount
    checkMobile()

    // Check on resize
    window.addEventListener('resize', checkMobile)
    
    // Check on orientation change (important for mobile)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return isMobile
}

