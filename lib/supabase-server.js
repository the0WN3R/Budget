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
      // This avoids ES module build issues on Vercel
      try {
        const supabaseModule = require('@supabase/supabase-js')
        createClientFunc = supabaseModule.createClient
      } catch (error) {
        console.error('[Supabase Server] Failed to require Supabase:', error)
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

module.exports = { getSupabaseClient }

