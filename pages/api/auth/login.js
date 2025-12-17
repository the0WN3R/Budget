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

// Use static import - Next.js with transpilePackages should handle this
// This is the recommended approach for Next.js API routes
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabaseClient = null

async function getSupabaseClient() {
  if (!supabaseClient) {
  
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
    
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
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
  // IMPORTANT: Log immediately - this helps us see if the handler is even being called
  console.log(`[LOGIN API] ====== HANDLER CALLED ======`)
  console.log(`[LOGIN API] Method: ${req.method}`)
  console.log(`[LOGIN API] Method type: ${typeof req.method}`)
  console.log(`[LOGIN API] Method stringified: ${JSON.stringify(req.method)}`)
  console.log(`[LOGIN API] URL: ${req.url}`)
  console.log(`[LOGIN API] Headers: ${JSON.stringify(Object.keys(req.headers))}`)
  console.log(`[LOGIN API] Body exists: ${!!req.body}`)
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`[LOGIN API] Handling OPTIONS preflight`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  
  // Check method - be very explicit
  const rawMethod = req.method
  const normalizedMethod = rawMethod ? String(rawMethod).toUpperCase().trim() : 'UNDEFINED'
  const isPost = normalizedMethod === 'POST' || rawMethod === 'POST' || rawMethod === 'post'
  
  console.log(`[LOGIN API] Method analysis:`)
  console.log(`[LOGIN API] - rawMethod: ${JSON.stringify(rawMethod)}`)
  console.log(`[LOGIN API] - normalizedMethod: ${normalizedMethod}`)
  console.log(`[LOGIN API] - isPost: ${isPost}`)
  
  if (!isPost) {
    console.log(`[LOGIN API] ❌ REJECTING - Method is not POST`)
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: `This endpoint only accepts POST requests, but received ${rawMethod || 'undefined'}`,
      debug: {
        rawMethod: rawMethod,
        normalizedMethod: normalizedMethod,
        methodType: typeof rawMethod,
        isPost: isPost
      },
      allowedMethods: ['POST', 'OPTIONS']
    })
  }
  
  console.log(`[LOGIN API] ✅ POST request confirmed, proceeding...`)

  // Initialize Supabase client (will error if env vars missing)
  let client
  try {
    client = await getSupabaseClient()
  } catch (error) {
    console.error('[LOGIN API] Supabase initialization error:', error)
    console.error('[LOGIN API] Error stack:', error.stack)
    
    // Check environment variables directly for debugging
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')).slice(0, 10) // First 10 matching keys
    }
    console.error('[LOGIN API] Environment variable check:', envCheck)
    
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Server configuration error. Please check environment variables are set correctly.',
      details: error.message,
      debug: {
        hasUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
        hasKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
        envKeysFound: envCheck.allEnvKeys,
        nodeEnv: process.env.NODE_ENV
      },
      help: 'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel dashboard under Settings > Environment Variables, then redeploy.'
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

