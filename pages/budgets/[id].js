/**
 * Budget View Page
 * Displays a single budget with pie chart, spending table, and edit option
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getSession, budgetAPI } from '../../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

// Color palette for pie chart
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function BudgetView() {
  const router = useRouter()
  const { id } = router.query
  const [budget, setBudget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      
      if (response.success) {
        setBudget(response.budget)
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

  const handleEdit = () => {
    router.push(`/budgets/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError('')
      
      const response = await budgetAPI.delete(id)
      
      if (response.success) {
        // Redirect to dashboard after successful deletion
        router.push('/dashboard')
      } else {
        setError('Failed to delete budget. Please try again.')
        setIsDeleting(false)
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      console.error('Error deleting budget:', err)
      setError(err.message || 'Failed to delete budget. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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

  // Prepare data for pie chart
  const chartData = budget?.tabs?.map((tab, index) => ({
    name: tab.name,
    value: tab.amount_allocated,
    color: tab.color || COLORS[index % COLORS.length]
  })).filter(item => item.value > 0) || []

  // Custom label for pie chart showing percentage
  const renderLabel = (entry) => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0
    return `${entry.name}: ${percentage}%`
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

  if (error || !budget) {
    return (
      <Layout requiresAuth>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Budget not found'}</p>
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{budget.name}</h1>
            {budget.description && (
              <p className="mt-2 text-gray-600">{budget.description}</p>
            )}
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Monthly Budget - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="primary" onClick={() => router.push(`/budgets/${id}/expenses`)}>
              Log Expenses
            </Button>
            <Button variant="secondary" onClick={handleEdit}>
              Edit Budget
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/budgets/${id}/tabs`)}
            >
              Manage Categories
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              Delete Budget
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Delete Budget
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete "<strong>{budget.name}</strong>"? This action cannot be undone and will delete all associated tabs and data.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Budget'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-500">Total Allocated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(budget.totals?.allocated || 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-500">Amount Spent</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(budget.totals?.spent || 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-500">Amount Left</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(budget.totals?.left || 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <Card title="Budget Allocation">
            <div className="py-6">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Spending Table */}
        <Card title="Budget Breakdown">
          {budget.tabs && budget.tabs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                      Tab
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Allocated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budget.tabs.map((tab) => {
                    const spentPercentage = tab.amount_allocated > 0 
                      ? (tab.amount_spent / tab.amount_allocated) * 100 
                      : 0
                    
                    return (
                      <tr key={tab.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            {tab.color && (
                              <div 
                                className="w-4 h-4 rounded-full mr-3 mt-1 flex-shrink-0" 
                                style={{ backgroundColor: tab.color }}
                              ></div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 break-words">{tab.name}</div>
                              {tab.description && (
                                <div className="text-sm text-gray-500 break-words mt-1">{tab.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="whitespace-nowrap">{formatCurrency(tab.amount_allocated)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-orange-600">
                          <div className="whitespace-nowrap">{formatCurrency(tab.amount_spent)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600">
                          <div className="whitespace-nowrap">{formatCurrency(tab.amount_left)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                spentPercentage >= 100 
                                  ? 'bg-red-500' 
                                  : spentPercentage >= 80 
                                  ? 'bg-orange-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {spentPercentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tabs/categories added to this budget yet.</p>
              <Button variant="primary" onClick={handleEdit}>
                Add Categories
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

