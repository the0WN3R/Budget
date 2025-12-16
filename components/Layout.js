/**
 * Layout Component
 * Main layout wrapper for pages
 */

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getSession, clearSession } from '../lib/api'

export default function Layout({ children, requiresAuth = false }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(requiresAuth)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (requiresAuth) {
      const session = getSession()
      if (!session || !session.access_token) {
        router.push('/login')
      } else {
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [requiresAuth, router])

  const handleLogout = async () => {
    clearSession()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (requiresAuth && !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      {(requiresAuth || isAuthenticated) && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">Budget App</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Budget App. Built with Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}

