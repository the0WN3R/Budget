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

