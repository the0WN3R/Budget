/**
 * Edit Profile Page
 * Allows users to update their profile information
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { getSession, profileAPI } from '../../lib/api'

// Common timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Australia/Sydney', label: 'AEDT (Sydney)' },
]

// Common currencies
const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { value: 'AUD', label: 'AUD - Australian Dollar (A$)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar (C$)' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan (¥)' },
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'BRL', label: 'BRL - Brazilian Real (R$)' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
]

export default function EditProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    currency_code: 'USD',
    timezone: 'UTC',
  })

  useEffect(() => {
    // Check authentication
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
      return
    }

    loadProfile()
  }, [router])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await profileAPI.get()
      
      if (response.success) {
        setProfile(response.profile)
        setUser(response.user)
        setFormData({
          full_name: response.profile.full_name || '',
          display_name: response.profile.display_name || '',
          currency_code: response.profile.currency_code || 'USD',
          timezone: response.profile.timezone || 'UTC',
        })
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
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
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (formData.display_name && formData.display_name.trim() === '') {
      setError('Display name cannot be empty')
      return
    }

    setIsSaving(true)

    try {
      const response = await profileAPI.update({
        full_name: formData.full_name.trim() || null,
        display_name: formData.display_name.trim() || null,
        currency_code: formData.currency_code,
        timezone: formData.timezone,
      })

      if (response.success) {
        setSuccess(true)
        setProfile(response.profile)
        
        // Update localStorage
        if (typeof window !== 'undefined' && response.profile) {
          localStorage.setItem('profile', JSON.stringify(response.profile))
        }

        // Show success message and redirect after a moment
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setError(response.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Layout requiresAuth>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
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
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your profile information
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-800">Profile updated successfully! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <Card title="Profile Information">
          <form onSubmit={handleSubmit}>
            {/* Email (Read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                {user?.email || 'Not set'}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed from this page. Contact support if you need to change your email.
              </p>
            </div>

            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
            />

            {/* Display Name */}
            <Input
              label="Display Name"
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="e.g., John"
              required
            />

            {/* Currency */}
            <div className="mb-4">
              <label htmlFor="currency_code" className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                id="currency_code"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                All amounts will be displayed in this currency
              </p>
            </div>

            {/* Timezone */}
            <div className="mb-6">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Timezone <span className="text-red-500">*</span>
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Used for date and time displays
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard')}
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

