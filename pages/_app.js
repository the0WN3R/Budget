/**
 * Custom App Component
 * This is the root component for all pages in Next.js
 */

import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/next'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}

