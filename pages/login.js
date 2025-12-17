/**
 * Login Page
 * User authentication page
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import { authAPI, saveSession } from '../lib/api'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await authAPI.login(formData.email, formData.password)

      // Save session to localStorage
      if (response.session) {
        saveSession(response.session)
        // Also save user and profile for easy access
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.user))
          if (response.profile) {
            localStorage.setItem('profile', JSON.stringify(response.profile))
          }
        }
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      // Use the error message as-is (it will be user-friendly from the API client)
      setError(err.message || 'Login failed. Please check your credentials.')
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <Card title="Welcome Back">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/signup')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

