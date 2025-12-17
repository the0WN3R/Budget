/**
 * Signup Page
 * User registration page
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import { authAPI, saveSession } from '../lib/api'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    displayName: '',
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.signup(
        formData.email,
        formData.password,
        formData.fullName || null,
        formData.displayName || null
      )

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
      setError(err.message || 'Signup failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] py-8">
        <div className="w-full max-w-md">
          <Card title="Create Your Account">
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
                      {error.includes('already exists') && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="text-sm text-red-700 hover:text-red-900 font-medium underline"
                          >
                            Go to Login Page →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />

              <Input
                label="Display Name"
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="John"
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Log in
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

