/**
 * Budgets API Endpoint
 * 
 * POST /api/budgets - Create a new budget
 * GET /api/budgets - Get all budgets for the authenticated user
 * 
 * Handles budget creation and retrieval:
 * 1. Creates a new budget linked to the authenticated user
 * 2. Optionally updates user_profiles.budget_id if this is the first/active budget
 * 3. Returns the created budget with all details
 */

import { supabase } from '../../../lib/supabase.js'

/**
 * Helper function to get authenticated user from session
 */
async function getAuthenticatedUser(req) {
  // Get the authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  // Verify the token and get user
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return user
}

/**
 * POST /api/budgets - Create a new budget
 */
export default async function handler(req, res) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req)
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to create a budget'
      })
    }

    // Get user profile to ensure it exists and get user_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'User profile does not exist. Please complete your profile setup.'
      })
    }

    // Handle POST request - Create budget
    if (req.method === 'POST') {
      const { name, description, currency_code } = req.body

      // Validate required fields
      if (!name || name.trim() === '') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Budget name is required'
        })
      }

      // Validate currency code format if provided
      if (currency_code && !/^[A-Z]{3}$/.test(currency_code)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Currency code must be a valid 3-letter ISO 4217 code (e.g., USD, EUR, GBP)'
        })
      }

      // Create the budget
      const budgetData = {
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        currency_code: currency_code || 'USD',
      }

      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single()

      if (budgetError) {
        console.error('Error creating budget:', budgetError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create budget. Please try again.'
        })
      }

      // If user doesn't have an active budget yet, set this as their active budget
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('budget_id')
        .eq('id', user.id)
        .single()

      if (!currentProfile?.budget_id) {
        // Update user profile to link to this budget
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ budget_id: budget.id })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
          // Don't fail the request - budget was created successfully
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        budget: budget
      })
    }

    // Handle GET request - Get all budgets for user
    if (req.method === 'GET') {
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch budgets. Please try again.'
        })
      }

      return res.status(200).json({
        success: true,
        budgets: budgets || [],
        count: budgets?.length || 0
      })
    }

    // Method not allowed
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST and GET requests'
    })

  } catch (error) {
    console.error('Budget API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    })
  }
}

