/**
 * Debug API Endpoint
 * Returns all request information for debugging
 */

export default function handler(req, res) {
  // Get all environment variable keys that contain "SUPABASE"
  const supabaseEnvKeys = Object.keys(process.env).filter(key => 
    key.toUpperCase().includes('SUPABASE')
  )
  
  // Create a safe object showing which env vars exist (without values)
  const envInfo = {}
  supabaseEnvKeys.forEach(key => {
    const value = process.env[key]
    envInfo[key] = {
      exists: true,
      hasValue: !!value,
      length: value ? value.length : 0,
      startsWith: value ? value.substring(0, 10) + '...' : null
    }
  })
  
  // Also check common variable names
  const commonVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  }
  
  return res.status(200).json({
    success: true,
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'YES' : 'NO',
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
      commonVariables: commonVars,
      supabaseEnvKeys: supabaseEnvKeys,
      supabaseEnvInfo: envInfo,
      totalEnvKeys: Object.keys(process.env).length
    }
  })
}

