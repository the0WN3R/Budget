/**
 * Single Budget API Endpoint
 * 
 * GET /api/budgets/[id] - Get a specific budget
 * PUT /api/budgets/[id] - Update a budget
 * DELETE /api/budgets/[id] - Delete a budget
 * 
 * Handles operations on a specific budget
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
    console.error('[BUDGET API] Auth error:', error)
    return null
  }

  return { user, token }
}

/**
 * Verify user owns the budget
 */
async function verifyBudgetOwnership(budgetId, userId, token) {
  // Use authenticated client to ensure RLS works correctly
  const supabase = getAuthenticatedSupabaseClient(token)
  const { data: budget, error } = await supabase
    .from('budgets')
    .select('id, user_id')
    .eq('id', budgetId)
    .single()

  if (error || !budget) {
    console.error('[BUDGET API] Budget ownership check error:', error)
    return { valid: false, budget: null }
  }

  if (budget.user_id !== userId) {
    console.error('[BUDGET API] User ID mismatch:', { budgetUserId: budget.user_id, requestUserId: userId })
    return { valid: false, budget: null }
  }

  return { valid: true, budget }
}

export default async function handler(req, res) {
  try {
    // Get authenticated user and token
    const authResult = await getAuthenticatedUser(req)
    
    if (!authResult || !authResult.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      })
    }

    const { user, token } = authResult
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Budget ID is required'
      })
    }

    console.log('[BUDGET API] Fetching budget:', id, 'for user:', user.id)

    // Verify user owns this budget using authenticated client
    const { valid, budget: existingBudget } = await verifyBudgetOwnership(id, user.id, token)
    
    if (!valid) {
      console.error('[BUDGET API] Budget ownership verification failed')
      return res.status(404).json({
        error: 'Not found',
        message: 'Budget not found or you do not have permission to access it'
      })
    }

    // Get authenticated Supabase client for queries
    const supabase = getAuthenticatedSupabaseClient(token)
    
    // Handle GET request - Get specific budget with tabs and spending data
    if (req.method === 'GET') {
      // Get budget details
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

      // Get budget tabs with amount allocated, ordered by position
      const { data: tabs, error: tabsError } = await supabase
        .from('budget_tabs')
        .select('*')
        .eq('budget_id', id)
        .order('position', { ascending: true })

      if (tabsError) {
        console.error('Error fetching budget tabs:', tabsError)
        // Continue without tabs rather than failing
      }

      // Calculate totals and spending for each tab
      // For now, spending is 0 - we'll add expense tracking later
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const tabsWithSpending = (tabs || []).map(tab => {
        const allocated = parseFloat(tab.amount_allocated || 0)
        const spent = 0 // TODO: Calculate from expenses table when implemented
        const left = allocated - spent

        return {
          ...tab,
          amount_allocated: allocated,
          amount_spent: spent,
          amount_left: left,
          spent_percentage: allocated > 0 ? (spent / allocated) * 100 : 0
        }
      })

      // Calculate total allocated
      const totalAllocated = tabsWithSpending.reduce((sum, tab) => sum + tab.amount_allocated, 0)
      const totalSpent = tabsWithSpending.reduce((sum, tab) => sum + tab.amount_spent, 0)

      return res.status(200).json({
        success: true,
        budget: {
          ...budget,
          tabs: tabsWithSpending,
          totals: {
            allocated: totalAllocated,
            spent: totalSpent,
            left: totalAllocated - totalSpent
          }
        }
      })
    }

    // Handle PUT request - Update budget
    // Allow updating name, description, and currency (not tabs)
    if (req.method === 'PUT') {
      const { name, description, currency_code } = req.body

      // Build update object - name, description, and currency_code allowed
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
          message: 'No valid fields to update. Only name, description, and currency can be updated.'
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

