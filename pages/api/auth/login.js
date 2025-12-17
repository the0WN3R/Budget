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

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
let supabaseClient = null

function getSupabaseClient() {
  if (!supabaseClient) {
    // Try multiple environment variable names (Vercel might use different names)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                       process.env.SUPABASE_URL
    
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                            process.env.SUPABASE_ANON_KEY
    
    // Log what we found (but don't log the actual keys for security)
    console.log('[LOGIN API] Environment check:')
    console.log('[LOGIN API] NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('[LOGIN API] SUPABASE_URL exists:', !!process.env.SUPABASE_URL)
    console.log('[LOGIN API] URL value (first 20 chars):', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING')
    console.log('[LOGIN API] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('[LOGIN API] SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY)
    console.log('[LOGIN API] ANON_KEY exists:', !!supabaseAnonKey)
    
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
    console.log('[LOGIN API] Supabase client initialized successfully')
  }
  return supabaseClient
}

export default async function handler(req, res) {
  // Log everything for debugging
  console.log(`[LOGIN API] === REQUEST RECEIVED ===`)
  console.log(`[LOGIN API] Method: ${req.method}`)
  console.log(`[LOGIN API] URL: ${req.url}`)
  console.log(`[LOGIN API] Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`[LOGIN API] Body exists:`, !!req.body)
  console.log(`[LOGIN API] Raw method check: req.method === 'POST':`, req.method === 'POST')
  console.log(`[LOGIN API] Method type:`, typeof req.method)
  console.log(`[LOGIN API] Method value:`, JSON.stringify(req.method))
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`[LOGIN API] Handling OPTIONS preflight`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  
  // Only allow POST requests (check for both uppercase and lowercase, just in case)
  const method = req.method?.toUpperCase()
  if (method !== 'POST') {
    console.log(`[LOGIN API] Method '${req.method}' (normalized: '${method}') not allowed - returning 405`)
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: `This endpoint only accepts POST requests, but received ${req.method}`,
      receivedMethod: req.method,
      methodType: typeof req.method,
      allowedMethods: ['POST', 'OPTIONS']
    })
  }
  
  console.log(`[LOGIN API] POST request validated, proceeding...`)

  // Initialize Supabase client (will error if env vars missing)
  let client
  try {
    client = getSupabaseClient()
  } catch (error) {
    console.error('[LOGIN API] Supabase initialization error:', error.message)
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Server configuration error. Please check environment variables are set correctly.',
      details: error.message,
      help: 'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel dashboard, then redeploy.'
    })
  }

  try {
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

