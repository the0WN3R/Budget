/**
 * Budget Tabs Management Page
 * Add, edit, and remove budget tabs/categories
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import Card from '../../../components/Card'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { getSession, budgetAPI } from '../../../lib/api'

export default function BudgetTabs() {
  const router = useRouter()
  const { id } = router.query
  
  const [budget, setBudget] = useState(null)
  const [tabs, setTabs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTab, setEditingTab] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount_allocated: '',
    color: '#3B82F6',
  })

  const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ]

  useEffect(() => {
    // Check authentication
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
      return
    }

    if (id) {
      loadData()
    }
  }, [id, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Load budget info
      const budgetResponse = await budgetAPI.getById(id)
      if (budgetResponse.success) {
        setBudget(budgetResponse.budget)
        setTabs(budgetResponse.budget.tabs || [])
      } else {
        setError('Failed to load budget')
      }
    } catch (err) {
      console.error('Error loading data:', err)
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
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount_allocated: '',
      color: '#3B82F6',
    })
    setEditingTab(null)
    setShowAddForm(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    if (!formData.name.trim()) {
      setError('Tab name is required')
      return
    }

    const amount = parseFloat(formData.amount_allocated || 0)
    if (isNaN(amount) || amount < 0) {
      setError('Amount allocated must be a valid number >= 0')
      return
    }

    try {
      const response = await budgetAPI.tabs.create(id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        amount_allocated: amount,
        color: formData.color,
      })

      if (response.success) {
        resetForm()
        loadData() // Reload to get updated tabs
      }
    } catch (err) {
      console.error('Error creating tab:', err)
      setError(err.message || 'Failed to create tab')
    }
  }

  const handleEdit = (tab) => {
    setEditingTab(tab)
    setFormData({
      name: tab.name,
      description: tab.description || '',
      amount_allocated: tab.amount_allocated?.toString() || '0',
      color: tab.color || '#3B82F6',
    })
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Tab name is required')
      return
    }

    const amount = parseFloat(formData.amount_allocated || 0)
    if (isNaN(amount) || amount < 0) {
      setError('Amount allocated must be a valid number >= 0')
      return
    }

    try {
      const response = await budgetAPI.tabs.update(id, editingTab.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        amount_allocated: amount,
        color: formData.color,
      })

      if (response.success) {
        resetForm()
        loadData()
      }
    } catch (err) {
      console.error('Error updating tab:', err)
      setError(err.message || 'Failed to update tab')
    }
  }

  const handleDelete = async (tabId) => {
    if (!confirm('Are you sure you want to delete this tab? This action cannot be undone.')) {
      return
    }

    try {
      setError('')
      const response = await budgetAPI.tabs.delete(id, tabId)

      if (response.success) {
        loadData()
      }
    } catch (err) {
      console.error('Error deleting tab:', err)
      setError(err.message || 'Failed to delete tab')
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
            <p className="mt-4 text-gray-600">Loading...</p>
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

  return (
    <Layout requiresAuth>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.push(`/budgets/${id}`)}
              className="text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Budget
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Categories - {budget?.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Add, edit, or remove budget categories and set monthly allocations
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card title={editingTab ? 'Edit Category' : 'Add New Category'}>
            <form onSubmit={editingTab ? handleUpdate : handleAdd}>
              <div className="space-y-4">
                <Input
                  label="Category Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Food, Transportation, Entertainment"
                  required
                />

                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add a description for this category..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount_allocated" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Allocation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {budget?.currency_code || 'USD'}
                      </span>
                      <input
                        type="number"
                        id="amount_allocated"
                        name="amount_allocated"
                        value={formData.amount_allocated}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Amount allocated per month for this category
                    </p>
                  </div>

                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1 flex space-x-1">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-8 h-8 rounded-lg border-2 ${
                              formData.color === color ? 'border-gray-900' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingTab ? 'Update Category' : 'Add Category'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Tabs List */}
        <Card 
          title="Categories"
          action={
            !showAddForm && (
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                + Add Category
              </Button>
            )
          }
        >
          {tabs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No categories yet.</p>
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                Add Your First Category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Allocation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tabs.map((tab) => (
                    <tr key={tab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {tab.color && (
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: tab.color }}
                            ></div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tab.name}</div>
                            {tab.description && (
                              <div className="text-sm text-gray-500">{tab.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(tab.amount_allocated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(tab)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tab.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(tabs.reduce((sum, tab) => sum + (parseFloat(tab.amount_allocated) || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

