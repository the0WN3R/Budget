/**
 * API Client Utility
 * 
 * Provides helper functions for making API requests to our backend endpoints
 */

// For Next.js API routes, use relative URLs (same origin)
const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000'

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add body if provided
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`)
    }

    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

/**
 * Auth API functions
 */
export const authAPI = {
  /**
   * Sign up a new user
   */
  async signup(email, password, fullName = null, displayName = null) {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        email,
        password,
        full_name: fullName,
        display_name: displayName,
      },
    })
  },

  /**
   * Log in a user
   */
  async login(email, password) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })
  },

  /**
   * Log out a user
   */
  async logout(accessToken = null) {
    const headers = {}
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    return apiRequest('/api/auth/logout', {
      method: 'POST',
      headers,
    })
  },
}

/**
 * Store session in localStorage
 */
export function saveSession(session) {
  if (typeof window !== 'undefined' && session) {
    localStorage.setItem('access_token', session.access_token)
    localStorage.setItem('refresh_token', session.refresh_token)
    localStorage.setItem('expires_at', session.expires_at)
  }
}

/**
 * Get session from localStorage
 */
export function getSession() {
  if (typeof window === 'undefined') return null

  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const expiresAt = localStorage.getItem('expires_at')

  if (!accessToken || !refreshToken) return null

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: parseInt(expiresAt, 10),
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('user')
    localStorage.removeItem('profile')
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired() {
  const session = getSession()
  if (!session || !session.expires_at) return true

  // Check if token expires within the next 5 minutes
  const expiresAt = session.expires_at * 1000 // Convert to milliseconds
  const now = Date.now()
  const bufferTime = 5 * 60 * 1000 // 5 minutes

  return now >= expiresAt - bufferTime
}

