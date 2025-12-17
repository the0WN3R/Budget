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
  
  // Log request details (helpful for debugging)
  if (typeof window !== 'undefined') {
    console.log('[API Client] Making request:', {
      url,
      method: options.method || 'GET',
      endpoint,
      hasBody: !!options.body
    })
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    method: options.method || 'GET', // Explicitly set method
    ...options,
  }

  // Remove method from options to avoid duplication
  delete config.method
  config.method = options.method || 'GET'

  // Add body if provided
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)
    
    if (typeof window !== 'undefined') {
      console.log('[API Client] Response received:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        ok: response.ok
      })
    }
    const contentType = response.headers.get('content-type') || ''
    
    // Clone response for error handling if needed (response can only be read once)
    const responseClone = response.clone()
    
    // Check if response is OK
    if (!response.ok) {
      // Try to parse error response
      let errorMessage = response.statusText
      
      // Try to get error message from response
      if (contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || response.statusText
        } catch (e) {
          // JSON parse failed, try text
          try {
            const text = await responseClone.text()
            errorMessage = text ? text.substring(0, 200) : response.statusText
          } catch (e2) {
            // Can't read response, use status text
            errorMessage = response.statusText
          }
        }
      } else {
        // Not JSON, try to read as text
        try {
          const text = await response.text()
          errorMessage = text ? text.substring(0, 200) : response.statusText
        } catch (e) {
          errorMessage = response.statusText
        }
      }
      
      // Create a helpful error message
      if (response.status === 405) {
        throw new Error(`Method not allowed (405). The endpoint may not support ${config.method || 'GET'} requests.`)
      }
      
      throw new Error(`API Error (${response.status}): ${errorMessage}`)
    }

    // Handle successful response
    // Check if response has content
    const contentLength = response.headers.get('content-length')
    if (contentLength === '0') {
      throw new Error('Empty response from server')
    }

    // Parse response based on content type
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json()
        return data
      } catch (parseError) {
        // JSON parse failed, try to get text for error message
        try {
          const text = await responseClone.text()
          throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`)
        } catch (e) {
          throw new Error('Failed to parse JSON response')
        }
      }
    } else {
      // Not JSON, try to read as text for error message
      const text = await response.text()
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`)
    }
  } catch (error) {
    console.error('API Request Error:', error)
    // Re-throw with more context if it's not already an Error object
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error.message || 'Unknown API error occurred')
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
 * Budget API functions
 */
export const budgetAPI = {
  /**
   * Create a new budget
   */
  async create(name, description = null, currencyCode = 'USD') {
    const token = getSession()?.access_token
    if (!token) {
      throw new Error('Not authenticated')
    }

    return apiRequest('/api/budgets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name,
        description,
        currency_code: currencyCode,
      },
    })
  },

  /**
   * Get all budgets for the authenticated user
   */
  async getAll() {
    const token = getSession()?.access_token
    if (!token) {
      throw new Error('Not authenticated')
    }

    return apiRequest('/api/budgets', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  /**
   * Get a specific budget by ID
   */
  async getById(budgetId) {
    const token = getSession()?.access_token
    if (!token) {
      throw new Error('Not authenticated')
    }

    return apiRequest(`/api/budgets/${budgetId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  /**
   * Update a budget
   */
  async update(budgetId, updates) {
    const token = getSession()?.access_token
    if (!token) {
      throw new Error('Not authenticated')
    }

    return apiRequest(`/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: updates,
    })
  },

  /**
   * Delete a budget
   */
  async delete(budgetId) {
    const token = getSession()?.access_token
    if (!token) {
      throw new Error('Not authenticated')
    }

    return apiRequest(`/api/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

