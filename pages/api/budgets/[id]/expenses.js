/**
 * Budget Expenses API Endpoint
 * 
 * GET /api/budgets/[id]/expenses - Get all expenses for a budget
 * POST /api/budgets/[id]/expenses - Create a new expense
 * 
 * Handles expense logging for budgets
 */

// Use CommonJS require to load the server-side helper
const { getSupabaseClient, getAuthenticatedSupabaseClient } = require('../../../../lib/supabase-server.js')

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

/**
 * Verify user owns the budget
 */
async function verifyBudgetOwnership(budgetId, userId, token) {
  const supabase = getAuthenticatedSupabaseClient(token)
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

module.exports = async function handler(req, res) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult || !authResult.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in to access this resource' })
    }

    const { user, token } = authResult
    const { id: budgetId } = req.query

    if (!budgetId) {
      return res.status(400).json({ error: 'Bad request', message: 'Budget ID is required' })
    }

    const { valid } = await verifyBudgetOwnership(budgetId, user.id, token)
    if (!valid) {
      return res.status(404).json({ error: 'Not found', message: 'Budget not found or you do not have permission to access it' })
    }

    const supabase = getAuthenticatedSupabaseClient(token)

    // GET: Fetch all expenses for a budget
    if (req.method === 'GET') {
      const { data: expenses, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('budget_id', budgetId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching expenses:', fetchError)
        return res.status(500).json({ error: 'Database error', message: 'Failed to fetch expenses' })
      }

      return res.status(200).json({ success: true, expenses: expenses || [] })
    }

    // POST: Create a new expense
    if (req.method === 'POST') {
      const { tab_id, amount, description, expense_date } = req.body

      // Validation
      if (!tab_id) {
        return res.status(400).json({ error: 'Validation error', message: 'Tab ID is required' })
      }
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Validation error', message: 'Amount must be a positive number' })
      }

      // Verify the tab belongs to this budget
      const { data: tab, error: tabError } = await supabase
        .from('budget_tabs')
        .select('id, budget_id')
        .eq('id', tab_id)
        .eq('budget_id', budgetId)
        .single()

      if (tabError || !tab) {
        return res.status(404).json({ error: 'Validation error', message: 'Tab not found or does not belong to this budget' })
      }

      // Create the expense
      const expenseData = {
        budget_id: budgetId,
        tab_id: tab_id,
        user_id: user.id,
        amount: parseFloat(amount),
        description: description?.trim() || null,
        expense_date: expense_date || new Date().toISOString().split('T')[0], // Use today if not provided
      }

      const { data: newExpense, error: insertError } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating expense:', insertError)
        return res.status(500).json({ error: 'Database error', message: 'Failed to create expense' })
      }

      return res.status(201).json({ success: true, message: 'Expense logged successfully', expense: newExpense })
    }

    return res.status(405).json({ error: 'Method not allowed', message: `Method ${req.method} not allowed for this endpoint` })

  } catch (error) {
    console.error('Budget Expenses API error:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message || 'An unexpected error occurred' })
  }
}

