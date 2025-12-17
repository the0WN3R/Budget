/**
 * Profile Update API Endpoint
 * 
 * PUT /api/profile/update - Update user profile
 * 
 * Allows authenticated users to update their profile information:
 * - full_name
 * - display_name
 * - currency_code
 * - timezone
 * 
 * Note: Email and password updates require separate endpoints using Supabase Auth
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
    console.error('[PROFILE API] Auth error:', error)
    return null
  }

  return { user, token }
}

export default async function handler(req, res) {
  try {
    // Only allow PUT requests
    if (req.method !== 'PUT') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'This endpoint only accepts PUT requests'
      })
    }

    // Get authenticated user and token
    const authResult = await getAuthenticatedUser(req)
    
    if (!authResult || !authResult.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to update your profile'
      })
    }

    const { user, token } = authResult
    const supabase = getAuthenticatedSupabaseClient(token)

    // Extract updatable fields from request body
    const { full_name, display_name, currency_code, timezone } = req.body

    // Build update object with only provided fields
    const updates = {}
    
    if (full_name !== undefined) {
      updates.full_name = full_name?.trim() || null
    }
    
    if (display_name !== undefined) {
      if (display_name && display_name.trim() === '') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Display name cannot be empty'
        })
      }
      updates.display_name = display_name?.trim() || null
    }
    
    if (currency_code !== undefined) {
      if (currency_code && !/^[A-Z]{3}$/.test(currency_code)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Currency code must be a valid 3-letter ISO 4217 code (e.g., USD, EUR, GBP)'
        })
      }
      updates.currency_code = currency_code || 'USD'
    }
    
    if (timezone !== undefined) {
      updates.timezone = timezone?.trim() || 'UTC'
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No valid fields to update. You can update: full_name, display_name, currency_code, timezone'
      })
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('[PROFILE API] Error updating profile:', updateError)
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update profile. Please try again.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('[PROFILE API] Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

