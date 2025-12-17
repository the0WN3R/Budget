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

    // Send email notification
    try {
      const { Resend } = require('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            New Support Request
          </h2>
          <div style="margin-top: 20px;">
            <p><strong>From:</strong> ${userEmail}</p>
            ${user?.id ? `<p><strong>User ID:</strong> ${user.id}</p>` : ''}
            <p><strong>Subject:</strong> ${subject.trim()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; color: #111827;">Message:</h3>
            <p style="white-space: pre-wrap; color: #374151;">${message.trim()}</p>
          </div>
        </div>
      `

      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Budget App <noreply@yourdomain.com>',
        to: 'lukeockwood@gmail.com',
        subject: `Support Request: ${subject.trim()}`,
        html: emailHtml,
        replyTo: userEmail,
      })

      console.log('[SUPPORT REQUEST] Email sent:', {
        user_id: user?.id || 'anonymous',
        email: userEmail,
        subject: subject.trim(),
        messageId: emailResult.id,
        timestamp: new Date().toISOString()
      })
    } catch (emailError) {
      console.error('[SUPPORT REQUEST] Email error:', emailError)
      // Log the request even if email fails
      console.log('[SUPPORT REQUEST]', {
        user_id: user?.id || 'anonymous',
        email: userEmail,
        subject: subject.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
        emailError: emailError.message
      })
      
      // Still return success to user, but log the error
      // In production, you might want to store in database as backup
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

