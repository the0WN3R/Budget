/**
 * Single Budget API Endpoint
 * 
 * GET /api/budgets/[id] - Get a specific budget
 * PUT /api/budgets/[id] - Update a budget
 * DELETE /api/budgets/[id] - Delete a budget
 * 
 * Handles operations on a specific budget
 */

// Use dynamic import to avoid module loading issues on Vercel
let createClient = null
let supabaseClient = null

async function getSupabaseClient() {
  if (!createClient) {
    try {
      const supabaseModule = await import('@supabase/supabase-js')
      createClient = supabaseModule.createClient
    } catch (error) {
      console.error('[BUDGET API] Failed to import Supabase:', error)
      throw new Error('Failed to load Supabase client library')
    }
  }
  
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const missing = []
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
      if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
      throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`)
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseClient
}

/**
 * Helper function to get authenticated user from session
 */
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const supabase = await getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return user
}

/**
 * Verify user owns the budget
 */
async function verifyBudgetOwnership(budgetId, userId) {
  const supabase = await getSupabaseClient()
  const { data: budget, error } = await supabase
    .from('budgets')
    .select('id, user_id')
    .eq('id', budgetId)
    .single()

  if (error || !budget) {
    return { valid: false, budget: null }
  }

  if (budget.user_id !== userId) {
    return { valid: false, budget: null }
  }

  return { valid: true, budget }
}

export default async function handler(req, res) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req)
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      })
    }

    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Budget ID is required'
      })
    }

    // Verify user owns this budget
    const { valid, budget: existingBudget } = await verifyBudgetOwnership(id, user.id)
    
    if (!valid) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Budget not found or you do not have permission to access it'
      })
    }

    // Get Supabase client
    const supabase = await getSupabaseClient()
    
    // Handle GET request - Get specific budget
    if (req.method === 'GET') {
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single()

      if (budgetError) {
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch budget'
        })
      }

      return res.status(200).json({
        success: true,
        budget: budget
      })
    }

    // Handle PUT request - Update budget
    if (req.method === 'PUT') {
      const { name, description, currency_code } = req.body

      // Build update object
      const updates = {}
      if (name !== undefined) {
        if (name.trim() === '') {
          return res.status(400).json({
            error: 'Validation error',
            message: 'Budget name cannot be empty'
          })
        }
        updates.name = name.trim()
      }
      if (description !== undefined) {
        updates.description = description?.trim() || null
      }
      if (currency_code !== undefined) {
        if (!/^[A-Z]{3}$/.test(currency_code)) {
          return res.status(400).json({
            error: 'Validation error',
            message: 'Currency code must be a valid 3-letter ISO 4217 code'
          })
        }
        updates.currency_code = currency_code
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'No valid fields to update'
        })
      }

      const { data: updatedBudget, error: updateError } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating budget:', updateError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update budget'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        budget: updatedBudget
      })
    }

    // Handle DELETE request - Delete budget
    if (req.method === 'DELETE') {
      // Check if this is the user's active budget
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('budget_id')
        .eq('id', user.id)
        .single()

      // Delete the budget (cascade will handle budget_tabs)
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting budget:', deleteError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to delete budget'
        })
      }

      // If this was the active budget, clear it from user profile
      if (profile?.budget_id === id) {
        await supabase
          .from('user_profiles')
          .update({ budget_id: null })
          .eq('id', user.id)
      }

      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully'
      })
    }

    // Method not allowed
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed for this endpoint`
    })

  } catch (error) {
    console.error('Budget API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

