/**
 * Create Budget Page
 * Page for creating a new budget
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { budgetAPI, getSession } from '../../lib/api'

export default function NewBudget() {
  const router = useRouter()
  
  // Check authentication on mount
  useEffect(() => {
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
    }
  }, [router])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency_code: 'USD',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)

    // Validate
    if (!formData.name.trim()) {
      setError('Budget name is required')
      setIsLoading(false)
      return
    }

    try {
      const response = await budgetAPI.create(
        formData.name.trim(),
        formData.description.trim() || null,
        formData.currency_code
      )

      if (response.success) {
        // Redirect to dashboard - it will reload budgets automatically
        router.push('/dashboard?created=true')
      }
    } catch (err) {
      // Handle authentication errors
      if (err.message.includes('Not authenticated') || err.message.includes('Unauthorized')) {
        router.push('/login')
        return
      }
      setError(err.message || 'Failed to create budget. Please try again.')
      setIsLoading(false)
    }
  }

  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'MXN', label: 'MXN - Mexican Peso' },
  ]

  return (
    <Layout requiresAuth>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
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
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Budget</h1>
          <p className="mt-2 text-gray-600">
            Set up a new budget to start tracking your expenses
          </p>
        </div>

        <Card title="Budget Details">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
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
              error={error && !formData.name.trim() ? 'Budget name is required' : null}
            />

            <div className="mb-4">
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

            <div className="mb-6">
              <label
                htmlFor="currency_code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                id="currency_code"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                All amounts in this budget will be in the selected currency
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Budget Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Give your budget a descriptive name to easily identify it</li>
            <li>• You can create multiple budgets for different purposes</li>
            <li>• After creating, you can add categories (tabs) to organize expenses</li>
            <li>• The first budget you create becomes your active budget</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}

