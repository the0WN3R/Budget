/**
 * Profile API Endpoint
 * 
 * GET /api/profile - Get current user profile
 */

// Use CommonJS require to load the server-side helper
const { getSupabaseClient, getAuthenticatedSupabaseClient } = require('../../../lib/supabase-server.js')

/**
 * Helper function to get authenticated user from session
 */
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return { user, token }
}

export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'This endpoint only accepts GET requests'
      })
    }

    // Get authenticated user and token
    const authResult = await getAuthenticatedUser(req)
    
    if (!authResult || !authResult.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access your profile'
      })
    }

    const { user, token } = authResult
    const supabase = getAuthenticatedSupabaseClient(token)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[PROFILE API] Error fetching profile:', profileError)
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch profile'
      })
    }

    return res.status(200).json({
      success: true,
      profile: profile,
      user: {
        id: user.id,
        email: user.email,
      }
    })

  } catch (error) {
    console.error('[PROFILE API] Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

