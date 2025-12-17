/**
 * Dashboard Page
 * Main user dashboard showing profile and budget overview
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { getSession, budgetAPI } from '../lib/api'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [budgetsWithTabs, setBudgetsWithTabs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [budgetsLoading, setBudgetsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
      return
    }

    // Load user and profile from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      const savedProfile = localStorage.getItem('profile')

      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    }

    setIsLoading(false)
    
    // Load budgets
    loadBudgets()
  }, [router])

  // Reload budgets when page becomes visible (e.g., after returning from create page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadBudgets()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadBudgets = async () => {
    try {
      setBudgetsLoading(true)
      
      // Check session first
      const session = getSession()
      if (!session || !session.access_token) {
        console.error('No session found when loading budgets')
        router.push('/login')
        return
      }
      
      console.log('Loading budgets...')
      const response = await budgetAPI.getAll()
      
      console.log('Budget API response:', response)
      
      if (response.success) {
        const budgetsList = response.budgets || []
        console.log('Budgets loaded:', budgetsList.length)
        setBudgets(budgetsList)
        
        // Load tabs for each budget to check if categories exist
        const budgetsWithTabsData = await Promise.all(
          budgetsList.map(async (budget) => {
            try {
              const tabsResponse = await budgetAPI.tabs.getAll(budget.id)
              return {
                ...budget,
                hasTabs: tabsResponse.success && tabsResponse.tabs && tabsResponse.tabs.length > 0
              }
            } catch (err) {
              console.error('Error loading tabs for budget:', budget.id, err)
              return { ...budget, hasTabs: false }
            }
          })
        )
        setBudgetsWithTabs(budgetsWithTabsData)
      } else {
        console.error('Budget API returned unsuccessful response:', response)
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      
      // If it's an auth error, redirect to login
      if (error.message.includes('Not authenticated') || error.message.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setBudgetsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Layout requiresAuth>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your budgets and track your expenses
          </p>
        </div>

        {/* Profile Card */}
        <Card title="Your Profile">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Display Name
                </label>
                <p className="text-gray-900">{profile?.display_name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Currency
                </label>
                <p className="text-gray-900">{profile?.currency_code || 'USD'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Timezone
                </label>
                <p className="text-gray-900">{profile?.timezone || 'UTC'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Budgets Overview */}
        <Card 
          title="Your Budgets"
          className="relative"
        >
          {budgetsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">No budgets yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Create your first budget to start tracking your expenses
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/budgets/new')}
              >
                Create Your First Budget
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  You have {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
                </p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/budgets/new')}
                >
                  + Create New Budget
                </Button>
              </div>
              <div className="space-y-3">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {budget.name}
                        </h3>
                        {budget.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {budget.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {budget.currency_code}
                          </span>
                          <span>
                            Created {new Date(budget.created_at).toLocaleDateString()}
                          </span>
                          {profile?.budget_id === budget.id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          router.push(`/budgets/${budget.id}`)
                        }}
                        className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  router.push('/profile/edit')
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  alert('Settings coming soon!')
                }}
              >
                Settings
              </Button>
            </div>
          </Card>

          <Card title="Getting Started">
            <div className="space-y-2 text-sm">
              <div className={`flex items-center ${user ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="mr-2">{user ? '✅' : '⏳'}</span>
                <span>Account created successfully</span>
              </div>
              <div className={`flex items-center ${profile ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="mr-2">{profile ? '✅' : '⏳'}</span>
                <span>Profile set up</span>
              </div>
              <div className={`flex items-center ${budgets.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="mr-2">{budgets.length > 0 ? '✅' : '⏳'}</span>
                <span>Create your first budget</span>
              </div>
              <div className={`flex items-center ${budgetsWithTabs.some(b => b.hasTabs) ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="mr-2">{budgetsWithTabs.some(b => b.hasTabs) ? '✅' : '⏳'}</span>
                <span>Add budget categories</span>
              </div>
              <div className="flex items-center text-gray-400">
                <span className="mr-2">⏳</span>
                <span>Start tracking expenses</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

