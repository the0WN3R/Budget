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

import { supabase } from '../../../lib/supabase.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests' 
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // If profile doesn't exist, create it (shouldn't happen, but handle gracefully)
    if (!profile && profileError) {
      console.warn('User profile not found for user:', authData.user.id)
      
      // Try to create profile as fallback
      const { data: newProfile, error: createError } = await supabase
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
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login'
    })
  }
}

