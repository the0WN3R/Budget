/**
 * Test Method Endpoint
 * Accepts any method and returns what was received
 */

export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    receivedMethod: req.method,
    methodType: typeof req.method,
    methodUpper: req.method?.toUpperCase(),
    url: req.url,
    hasBody: !!req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    },
    message: 'This endpoint accepts any method - use this to test what method Vercel is receiving'
  })
}

