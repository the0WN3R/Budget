/**
 * Single Budget Tab API Endpoint
 * 
 * PUT /api/budgets/[id]/tabs/[tabId] - Update a tab
 * DELETE /api/budgets/[id]/tabs/[tabId] - Delete a tab
 * 
 * Handles individual tab operations
 */

const { getSupabaseClient } = require('../../../../../lib/supabase-server.js')

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

  return user
}

/**
 * Verify user owns the budget and tab
 */
async function verifyTabOwnership(budgetId, tabId, userId) {
  const supabase = getSupabaseClient()
  
  // Get tab and verify it belongs to user's budget
  const { data: tab, error: tabError } = await supabase
    .from('budget_tabs')
    .select('id, budget_id')
    .eq('id', tabId)
    .single()

  if (tabError || !tab) {
    return { valid: false, tab: null }
  }

  if (tab.budget_id !== budgetId) {
    return { valid: false, tab: null }
  }

  // Verify user owns the budget
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('id, user_id')
    .eq('id', budgetId)
    .single()

  if (budgetError || !budget) {
    return { valid: false, tab: null }
  }

  if (budget.user_id !== userId) {
    return { valid: false, tab: null }
  }

  return { valid: true, tab }
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

    const { id, tabId } = req.query

    if (!id || !tabId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Budget ID and Tab ID are required'
      })
    }

    // Verify user owns this budget and tab
    const { valid } = await verifyTabOwnership(id, tabId, user.id)
    
    if (!valid) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Tab not found or you do not have permission to access it'
      })
    }

    const supabase = getSupabaseClient()

    // Handle PUT request - Update a tab
    if (req.method === 'PUT') {
      const { name, description, amount_allocated, color, position } = req.body

      // Build update object
      const updates = {}
      
      if (name !== undefined) {
        if (name.trim() === '') {
          return res.status(400).json({
            error: 'Validation error',
            message: 'Tab name cannot be empty'
          })
        }
        updates.name = name.trim()
      }
      
      if (description !== undefined) {
        updates.description = description?.trim() || null
      }
      
      if (amount_allocated !== undefined) {
        const allocated = parseFloat(amount_allocated)
        if (isNaN(allocated) || allocated < 0) {
          return res.status(400).json({
            error: 'Validation error',
            message: 'Amount allocated must be a valid number >= 0'
          })
        }
        updates.amount_allocated = allocated
      }
      
      if (color !== undefined) {
        updates.color = color || null
      }
      
      if (position !== undefined) {
        updates.position = parseInt(position) || 0
      }

      // If name is being updated, check for duplicates (excluding current tab)
      if (updates.name) {
        const { data: existingTab } = await supabase
          .from('budget_tabs')
          .select('id')
          .eq('budget_id', id)
          .eq('name', updates.name)
          .neq('id', tabId)
          .single()

        if (existingTab) {
          return res.status(409).json({
            error: 'Duplicate tab name',
            message: 'A tab with this name already exists in this budget'
          })
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'No valid fields to update'
        })
      }

      const { data: updatedTab, error: updateError } = await supabase
        .from('budget_tabs')
        .update(updates)
        .eq('id', tabId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating tab:', updateError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update tab'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Tab updated successfully',
        tab: updatedTab
      })
    }

    // Handle DELETE request - Delete a tab
    if (req.method === 'DELETE') {
      const { error: deleteError } = await supabase
        .from('budget_tabs')
        .delete()
        .eq('id', tabId)

      if (deleteError) {
        console.error('Error deleting tab:', deleteError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to delete tab'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Tab deleted successfully'
      })
    }

    // Method not allowed
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed for this endpoint`
    })

  } catch (error) {
    console.error('Budget tab API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

