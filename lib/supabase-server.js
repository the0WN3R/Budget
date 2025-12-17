/**
 * Server-side Supabase Client Helper
 * 
 * This file provides a server-side compatible way to get Supabase client
 * using CommonJS require() to avoid ES module build issues on Vercel
 */

let createClientFunc = null
let supabaseClient = null

function getSupabaseClient() {
  if (!supabaseClient) {
    if (!createClientFunc) {
      // Use require() for server-side compatibility
      // The main entry should work with require() on Vercel after webpack bundling
      try {
        const supabaseModule = require('@supabase/supabase-js')
        createClientFunc = supabaseModule.createClient
        console.log('[Supabase Server] Successfully loaded Supabase client')
      } catch (error) {
        console.error('[Supabase Server] Failed to require Supabase:', error)
        console.error('[Supabase Server] Error details:', {
          message: error.message,
          code: error.code
        })
        throw new Error('Failed to load Supabase client library')
      }
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const missing = []
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
      if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
      throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`)
    }
    
    supabaseClient = createClientFunc(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  return supabaseClient
}

/**
 * Get an authenticated Supabase client for a specific user
 * This sets the auth context so RLS policies work correctly
 */
function getAuthenticatedSupabaseClient(accessToken) {
  const client = getSupabaseClient()
  
  // Set the access token in the client's auth context
  // This ensures auth.uid() works in RLS policies
  if (accessToken) {
    // Create a new client instance with the user's token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    return createClientFunc(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        persistSessionInCookie: false
      }
    })
  }
  
  return client
}

module.exports = { getSupabaseClient, getAuthenticatedSupabaseClient }

