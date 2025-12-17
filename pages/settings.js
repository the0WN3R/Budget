/**
 * Settings Page
 * Account settings, support, and theme preferences
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { getSession, authAPI, profileAPI } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'

export default function Settings() {
  const router = useRouter()
  const { theme, changeTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('general')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
  })
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false)
  const [supportError, setSupportError] = useState('')
  const [supportSuccess, setSupportSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Check authentication
  if (typeof window !== 'undefined') {
    const session = getSession()
    if (!session || !session.access_token) {
      router.push('/login')
      return null
    }
  }

  const handleSupportSubmit = async (e) => {
    e.preventDefault()
    setSupportError('')
    setSupportSuccess(false)

    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      setSupportError('Please fill in all fields')
      return
    }

    setIsSubmittingSupport(true)

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getSession()?.access_token}`,
        },
        body: JSON.stringify({
          subject: supportForm.subject.trim(),
          message: supportForm.message.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSupportSuccess(true)
        setSupportForm({ subject: '', message: '' })
      } else {
        setSupportError(data.message || 'Failed to send support request')
      }
    } catch (err) {
      setSupportError(err.message || 'Failed to send support request')
    } finally {
      setIsSubmittingSupport(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getSession()?.access_token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        // Clear local storage and redirect to home
        if (typeof window !== 'undefined') {
          localStorage.clear()
        }
        router.push('/')
      } else {
        setDeleteError(data.message || 'Failed to delete account')
        setIsDeleting(false)
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <Layout requiresAuth>
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveSection('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveSection('support')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'support'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contact Support
            </button>
            <button
              onClick={() => setActiveSection('danger')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'danger'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Danger Zone
            </button>
          </nav>
        </div>

        {/* General Settings */}
        {activeSection === 'general' && (
          <Card title="General Settings">
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light Theme */}
                  <button
                    onClick={() => changeTheme('light')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Light</span>
                      {theme === 'light' && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Clean and bright interface</p>
                    <div className="mt-3 flex space-x-1">
                      <div className="w-4 h-4 rounded bg-white border-2 border-gray-300"></div>
                      <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
                      <div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-300"></div>
                    </div>
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Dark</span>
                      {theme === 'dark' && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Easy on the eyes</p>
                    <div className="mt-3 flex space-x-1">
                      <div className="w-4 h-4 rounded bg-gray-800 border-2 border-gray-700"></div>
                      <div className="w-4 h-4 rounded bg-gray-700 border-2 border-gray-600"></div>
                      <div className="w-4 h-4 rounded bg-gray-600 border-2 border-gray-500"></div>
                    </div>
                  </button>

                  {/* Muted Theme */}
                  <button
                    onClick={() => changeTheme('muted')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      theme === 'muted'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Muted</span>
                      {theme === 'muted' && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Blues, purples, and grays</p>
                    <div className="mt-3 flex space-x-1">
                      <div className="w-4 h-4 rounded bg-slate-800 border-2 border-slate-700"></div>
                      <div className="w-4 h-4 rounded bg-indigo-900 border-2 border-indigo-800"></div>
                      <div className="w-4 h-4 rounded bg-slate-700 border-2 border-slate-600"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Contact Support */}
        {activeSection === 'support' && (
          <Card title="Contact Support">
            {supportSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Your support request has been sent successfully! We'll get back to you soon.
                </p>
              </div>
            )}

            {supportError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{supportError}</p>
              </div>
            )}

            <form onSubmit={handleSupportSubmit}>
              <div className="space-y-4">
                <Input
                  label="Subject"
                  type="text"
                  name="subject"
                  value={supportForm.subject}
                  onChange={(e) =>
                    setSupportForm({ ...supportForm, subject: e.target.value })
                  }
                  placeholder="What can we help you with?"
                  required
                />

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={supportForm.message}
                    onChange={(e) =>
                      setSupportForm({ ...supportForm, message: e.target.value })
                    }
                    placeholder="Please describe your issue or question..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingSupport}
                  className="w-full"
                >
                  {isSubmittingSupport ? 'Sending...' : 'Send Support Request'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Danger Zone */}
        {activeSection === 'danger' && (
          <Card title="Danger Zone">
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. This will permanently
                  delete your account, all your budgets, categories, and associated data.
                </p>

                {!showDeleteConfirm ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete My Account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Type <span className="font-mono">DELETE</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="DELETE"
                      />
                    </div>

                    {deleteError && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm text-red-700">{deleteError}</p>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                          setDeleteError('')
                        }}
                        disabled={isDeleting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                        className="flex-1"
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

