/**
 * Budget Edit Page
 * Edit budget name and description
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import Card from '../../../components/Card'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { getSession, budgetAPI } from '../../../lib/api'

export default function BudgetEdit() {
  const router = useRouter()
  const { id } = router.query
  
  const [budget, setBudget] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Check authentication
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
      return
    }

    if (id) {
      loadBudget()
    }
  }, [id, router])

  const loadBudget = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await budgetAPI.getById(id)
      
      if (response.success && response.budget) {
        setBudget(response.budget)
        setFormData({
          name: response.budget.name || '',
          description: response.budget.description || '',
        })
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    // Validate
    if (!formData.name.trim()) {
      setError('Budget name is required')
      setIsSaving(false)
      return
    }

    try {
      const response = await budgetAPI.update(id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      })

      if (response.success) {
        // Redirect back to budget view
        router.push(`/budgets/${id}`)
      } else {
        setError('Failed to update budget. Please try again.')
        setIsSaving(false)
      }
    } catch (err) {
      console.error('Error updating budget:', err)
      
      // Handle authentication errors
      if (err.message.includes('Not authenticated') || err.message.includes('Unauthorized')) {
        router.push('/login')
        return
      }
      
      setError(err.message || 'Failed to update budget. Please try again.')
      setIsSaving(false)
    }
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
              <div className="flex space-x-3 justify-center">
                <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
                <Button variant="primary" onClick={loadBudget}>
                  Try Again
                </Button>
              </div>
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
            onClick={() => router.push(`/budgets/${id}`)}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Budget
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Budget</h1>
          <p className="mt-2 text-gray-600">
            Update your budget name and description
          </p>
        </div>

        <Card title="Budget Details">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Budget Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Monthly Budget 2024"
              required
            />

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a description for this budget..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You can only edit the budget name and description here. 
                    To modify tabs/categories or currency, please delete and recreate the budget.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/budgets/${id}`)}
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
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
