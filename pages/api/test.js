/**
 * Test API Endpoint
 * Simple endpoint to verify API routes are working on Vercel
 */

export default async function handler(req, res) {
  console.log('[TEST API] Request received:', req.method, req.url)
  
  return res.status(200).json({
    success: true,
    message: 'API route is working!',
    method: req.method,
    timestamp: new Date().toISOString()
  })
}

