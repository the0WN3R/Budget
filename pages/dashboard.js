/**
 * Dashboard Page
 * Main user dashboard showing profile and budget overview
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { getSession } from '../lib/api'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
  }, [router])

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
        <Card title="Your Budgets">
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
              onClick={() => {
                alert('Budget creation coming soon!')
              }}
            >
              Create Your First Budget
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  alert('Profile editing coming soon!')
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
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Account created successfully</p>
              <p>✅ Profile set up</p>
              <p>⏳ Create your first budget</p>
              <p>⏳ Add budget categories</p>
              <p>⏳ Start tracking expenses</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

