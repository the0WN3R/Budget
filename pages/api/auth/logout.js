/**
 * Logout API Endpoint
 * 
 * POST /api/auth/logout
 * 
 * Handles user logout:
 * 1. Signs out the user from Supabase Auth
 * 2. Invalidates the current session
 * 
 * Note: For client-side logout, you can also use supabase.auth.signOut() directly
 * This endpoint is useful for server-side logout operations
 */

// Use dynamic import to avoid module loading issues on Vercel
let createClient = null
let supabaseClient = null

async function getSupabaseClient() {
  if (!createClient) {
    try {
      const supabaseModule = await import('@supabase/supabase-js')
      createClient = supabaseModule.createClient
    } catch (error) {
      console.error('[LOGOUT API] Failed to import Supabase:', error)
      throw new Error('Failed to load Supabase client library')
    }
  }
  
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const missing = []
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
      if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
      throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`)
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseClient
}

export default async function handler(req, res) {
  // Allow both POST and GET requests for logout
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST or GET requests' 
    })
  }

  try {
    // Get Supabase client
    const supabase = await getSupabaseClient()
    
    // Get the authorization header to extract the access token
    const authHeader = req.headers.authorization
    let accessToken = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7)
    } else if (req.body?.access_token) {
      accessToken = req.body.access_token
    } else if (req.query?.access_token) {
      accessToken = req.query.access_token
    }

    // If we have an access token, set it in the Supabase client for this request
    if (accessToken) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '' // Not needed for logout
      })

      if (setSessionError) {
        console.error('Error setting session for logout:', setSessionError)
      }
    }

    // Sign out the user
    // This will invalidate the current session
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      // Even if there's an error, we'll return success
      // The token might already be invalid
      console.warn('Sign out error (non-critical):', signOutError)
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    // Even if there's an error, return success
    // Logout should generally succeed even if session is already invalid
    return res.status(200).json({
      success: true,
      message: 'Logout completed'
    })
  }
}

