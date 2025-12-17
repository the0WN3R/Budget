/**
 * Budget Tabs API Endpoint
 * 
 * GET /api/budgets/[id]/tabs - Get all tabs for a budget
 * POST /api/budgets/[id]/tabs - Create a new tab
 * PUT /api/budgets/[id]/tabs/[tabId] - Update a tab (via separate endpoint)
 * DELETE /api/budgets/[id]/tabs/[tabId] - Delete a tab (via separate endpoint)
 * 
 * Handles tab/category management for budgets
 */

const { getSupabaseClient } = require('../../../../lib/supabase-server.js')

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
 * Verify user owns the budget
 */
async function verifyBudgetOwnership(budgetId, userId) {
  const supabase = getSupabaseClient()
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
    const { valid } = await verifyBudgetOwnership(id, user.id)
    
    if (!valid) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Budget not found or you do not have permission to access it'
      })
    }

    const supabase = getSupabaseClient()

    // Handle GET request - Get all tabs for budget
    if (req.method === 'GET') {
      const { data: tabs, error: tabsError } = await supabase
        .from('budget_tabs')
        .select('*')
        .eq('budget_id', id)
        .order('position', { ascending: true })

      if (tabsError) {
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch tabs'
        })
      }

      return res.status(200).json({
        success: true,
        tabs: tabs || []
      })
    }

    // Handle POST request - Create a new tab
    if (req.method === 'POST') {
      const { name, description, amount_allocated, color, position } = req.body

      // Validate required fields
      if (!name || name.trim() === '') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Tab name is required'
        })
      }

      // Validate amount_allocated
      const allocated = parseFloat(amount_allocated || 0)
      if (isNaN(allocated) || allocated < 0) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Amount allocated must be a valid number >= 0'
        })
      }

      // Get current max position if position not provided
      let tabPosition = position
      if (tabPosition === undefined || tabPosition === null) {
        const { data: existingTabs } = await supabase
          .from('budget_tabs')
          .select('position')
          .eq('budget_id', id)
          .order('position', { ascending: false })
          .limit(1)

        tabPosition = existingTabs && existingTabs.length > 0 
          ? (existingTabs[0].position || 0) + 1 
          : 0
      }

      // Check for duplicate tab names within the same budget
      const { data: existingTab } = await supabase
        .from('budget_tabs')
        .select('id')
        .eq('budget_id', id)
        .eq('name', name.trim())
        .single()

      if (existingTab) {
        return res.status(409).json({
          error: 'Duplicate tab name',
          message: 'A tab with this name already exists in this budget'
        })
      }

      // Create the tab
      const tabData = {
        budget_id: id,
        name: name.trim(),
        description: description?.trim() || null,
        amount_allocated: allocated,
        color: color || null,
        position: tabPosition
      }

      const { data: newTab, error: createError } = await supabase
        .from('budget_tabs')
        .insert(tabData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating tab:', createError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create tab'
        })
      }

      return res.status(201).json({
        success: true,
        message: 'Tab created successfully',
        tab: newTab
      })
    }

    // Method not allowed
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed for this endpoint`
    })

  } catch (error) {
    console.error('Budget tabs API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

