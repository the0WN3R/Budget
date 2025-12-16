/**
 * Signup API Endpoint
 * 
 * POST /api/auth/signup
 * 
 * Handles user registration:
 * 1. Creates a new user account in Supabase Auth
 * 2. The database trigger automatically creates a user_profiles row
 * 3. Optionally updates the profile with additional info (full_name, display_name)
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword123",
 *   "full_name": "John Doe" (optional),
 *   "display_name": "John" (optional)
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
    const { email, password, full_name, display_name } = req.body

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

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters long'
      })
    }

    // Prepare user metadata for profile creation
    const metadata = {}
    if (full_name) metadata.full_name = full_name
    if (display_name) metadata.display_name = display_name

    // Sign up the user with Supabase Auth
    // This will:
    // 1. Create the user in auth.users
    // 2. Trigger the handle_new_user() function
    // 3. Automatically create a row in user_profiles table
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // This metadata will be used by the trigger to populate user_profiles
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (authError) {
      // Handle specific Supabase auth errors
      if (authError.message.includes('already registered')) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists. Please try logging in instead.'
        })
      }

      return res.status(400).json({
        error: 'Signup failed',
        message: authError.message
      })
    }

    // If email confirmation is enabled, user will need to confirm email
    // If not, user is immediately authenticated
    if (!authData.user) {
      return res.status(400).json({
        error: 'Signup failed',
        message: 'Failed to create user account'
      })
    }

    // Check if profile was created automatically (it should be via trigger)
    // Give it a moment, then verify
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for trigger
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // If profile doesn't exist yet, try to create it manually as fallback
    if (!profile && profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: full_name || '',
          display_name: display_name || full_name || email.split('@')[0]
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user profile:', createError)
        // Don't fail the signup, but log the error
      }
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed: authData.user.email_confirmed_at !== null
      },
      session: authData.session,
      // Include profile if it was created
      profile: profile || null
    })

  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during signup'
    })
  }
}

