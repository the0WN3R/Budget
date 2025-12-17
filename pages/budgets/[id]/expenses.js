/**
 * Log Expenses Page
 * Allows users to log expenses against budget categories
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import Card from '../../../components/Card'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { getSession, budgetAPI } from '../../../lib/api'

export default function LogExpenses() {
  const router = useRouter()
  const { id: budgetId } = router.query
  
  const [budget, setBudget] = useState(null)
  const [formData, setFormData] = useState({
    tab_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0], // Today's date
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check authentication
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
      return
    }

    if (budgetId) {
      loadBudget()
    }
  }, [budgetId, router])

  const loadBudget = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await budgetAPI.getById(budgetId)
      
      if (response.success && response.budget) {
        setBudget(response.budget)
        // Set default tab to first tab if available
        if (response.budget.tabs && response.budget.tabs.length > 0 && !formData.tab_id) {
          setFormData(prev => ({
            ...prev,
            tab_id: response.budget.tabs[0].id
          }))
        }
      } else {
        setError('Failed to load budget')
      }
    } catch (err) {
      console.error('Error loading budget:', err)
      setError(err.message || 'Failed to load budget')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.tab_id) {
      setError('Please select a category')
      return
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    setIsSaving(true)

    try {
      const response = await budgetAPI.expenses.create(
        budgetId,
        formData.tab_id,
        formData.amount,
        formData.description,
        formData.expense_date
      )

      if (response.success) {
        setSuccess(true)
        // Reset form but keep the tab and date
        setFormData({
          tab_id: formData.tab_id,
          amount: '',
          description: '',
          expense_date: formData.expense_date,
        })
        
        // Reload budget to get updated spending amounts
        loadBudget()
        
        // Clear success message after 3 seconds and optionally redirect
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        setError(response.message || 'Failed to log expense')
      }
    } catch (err) {
      console.error('Error logging expense:', err)
      setError(err.message || 'Failed to log expense')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    const currency = budget?.currency_code || 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  if (isLoading) {
    return (
      <Layout requiresAuth>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading budget...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error && !budget) {
    return (
      <Layout requiresAuth>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  // Check if budget has any tabs
  if (!budget?.tabs || budget.tabs.length === 0) {
    return (
      <Layout requiresAuth>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push(`/budgets/${budgetId}`)}
              className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Budget
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Log Expenses</h1>
          </div>
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You need to create categories before you can log expenses.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push(`/budgets/${budgetId}/tabs`)}
              >
                Manage Categories
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requiresAuth>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/budgets/${budgetId}`)}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Budget
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Log Expenses</h1>
          <p className="mt-2 text-gray-600">
            Record expenses for {budget?.name}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-800">Expense logged successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Expense Form */}
        <Card title="Log New Expense">
          <form onSubmit={handleSubmit}>
            {/* Category Selection */}
            <div className="mb-4">
              <label htmlFor="tab_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="tab_id"
                name="tab_id"
                value={formData.tab_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category...</option>
                {budget?.tabs?.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name} (Allocated: {formatCurrency(tab.amount_allocated)})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount Spent <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {budget?.currency_code || 'USD'}
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <Input
              label="Description (Optional)"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Grocery shopping at Whole Foods"
            />

            {/* Date */}
            <div className="mb-6">
              <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="expense_date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/budgets/${budgetId}`)}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Logging...' : 'Log Expense'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Category Summary */}
        {budget?.tabs && budget.tabs.length > 0 && (
          <Card title="Category Summary" className="mt-6">
            <div className="space-y-3">
              {budget.tabs.map((tab) => {
                const remaining = tab.amount_left || (tab.amount_allocated - (tab.amount_spent || 0))
                const isOverBudget = remaining < 0
                
                return (
                  <div
                    key={tab.id}
                    className={`p-4 border rounded-lg ${
                      isOverBudget ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {tab.color && (
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: tab.color }}
                          ></div>
                        )}
                        <span className="font-medium text-gray-900">{tab.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Spent: {formatCurrency(tab.amount_spent || 0)} / {formatCurrency(tab.amount_allocated)}
                        </div>
                        <div className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                          Remaining: {formatCurrency(remaining)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

