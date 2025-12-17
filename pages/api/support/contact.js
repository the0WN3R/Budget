/**
 * Contact Support API Endpoint
 * 
 * POST /api/support/contact - Send a support request
 * 
 * This endpoint logs support requests. In production, you would integrate
 * with an email service or support ticket system.
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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests'
      })
    }

    // Get authenticated user (optional for support - users might not be logged in)
    const authResult = await getAuthenticatedUser(req)
    const user = authResult?.user || null

    const { subject, message, email } = req.body

    // Validation
    if (!subject || subject.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Subject is required'
      })
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message is required'
      })
    }

    const userEmail = email || user?.email || 'anonymous@unknown.com'

    // Store support request in database
    const supabase = getAuthenticatedSupabaseClient(token || '')
    
    // If no token, use regular client for anonymous requests
    const dbClient = token ? getAuthenticatedSupabaseClient(token) : getSupabaseClient()
    
    const { data: supportRequest, error: dbError } = await dbClient
      .from('support_requests')
      .insert({
        user_id: user?.id || null,
        email: userEmail,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open'
      })
      .select()
      .single()

    if (dbError) {
      console.error('[SUPPORT REQUEST] Database error:', dbError)
      // Log it anyway
      console.log('[SUPPORT REQUEST]', {
        user_id: user?.id || 'anonymous',
        email: userEmail,
        subject: subject.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
        dbError: dbError.message
      })
    } else {
      console.log('[SUPPORT REQUEST] Stored in database:', {
        id: supportRequest.id,
        user_id: user?.id || 'anonymous',
        email: userEmail,
        subject: subject.trim(),
        timestamp: new Date().toISOString()
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Your support request has been received. We will get back to you soon!'
    })

  } catch (error) {
    console.error('[SUPPORT] Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while sending your support request'
    })
  }
}

