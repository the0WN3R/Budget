/**
 * Budget Edit Page
 * Placeholder for budget editing functionality
 */

import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import Card from '../../../components/Card'
import Button from '../../../components/Button'

export default function BudgetEdit() {
  const router = useRouter()
  const { id } = router.query

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Edit Budget</h1>
          <Button variant="secondary" onClick={() => router.push(`/budgets/${id}`)}>
            Cancel
          </Button>
        </div>
        
        <Card title="Budget Editing">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Budget editing functionality coming soon!
            </p>
            <p className="text-sm text-gray-400 mb-6">
              You'll be able to edit budget name, description, currency, and manage tabs/categories here.
            </p>
            <Button variant="primary" onClick={() => router.push(`/budgets/${id}`)}>
              Back to Budget View
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

