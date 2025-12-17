/**
 * Login API Endpoint
 * 
 * POST /api/auth/login
 * 
 * Handles user authentication:
 * 1. Authenticates user credentials with Supabase Auth
 * 2. Returns session token and user profile information
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword123"
 * }
 */

// Import supabase inside handler to handle missing env vars gracefully
let supabase = null

async function getSupabaseClient() {
  if (!supabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables')
      }
      
      supabase = createClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      throw error
    }
  }
  return supabase
}

export default async function handler(req, res) {
  // Log method for debugging (helpful on Vercel)
  console.log(`[LOGIN API] Received ${req.method} request`)
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[LOGIN API] Method ${req.method} not allowed`)
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: `This endpoint only accepts POST requests, but received ${req.method}`,
      receivedMethod: req.method
    })
  }

  // Initialize Supabase client (will error if env vars missing)
  try {
    await getSupabaseClient()
  } catch (error) {
    console.error('[LOGIN API] Supabase initialization error:', error)
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Server configuration error. Please check environment variables are set correctly.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }

  try {
    const client = await getSupabaseClient()
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      })
    }

    // Sign in the user with Supabase Auth
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      // Handle specific authentication errors
      if (authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        })
      }

      if (authError.message.includes('Email not confirmed')) {
        return res.status(403).json({
          error: 'Email not confirmed',
          message: 'Please confirm your email address before logging in'
        })
      }

      return res.status(401).json({
        error: 'Authentication failed',
        message: authError.message
      })
    }

    if (!authData.user || !authData.session) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Failed to create session'
      })
    }

    // Fetch user profile from user_profiles table
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // If profile doesn't exist, create it (shouldn't happen, but handle gracefully)
    if (!profile && profileError) {
      console.warn('User profile not found for user:', authData.user.id)
      
      // Try to create profile as fallback
      const { data: newProfile, error: createError } = await client
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          display_name: authData.user.email.split('@')[0]
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user profile:', createError)
        // Continue anyway - profile creation is not critical for login
      }
    }

    // Return success response with session and user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed: authData.user.email_confirmed_at !== null,
        created_at: authData.user.created_at
      },
      profile: profile || null,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    // Ensure we always return JSON, even on unexpected errors
    // This helps with the "Unexpected end of JSON input" error
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred during login',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}

