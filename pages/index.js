/**
 * Home Page
 * Landing page that redirects to login or dashboard
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession } from '../lib/api'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (session && session.access_token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    </Layout>
  )
}

