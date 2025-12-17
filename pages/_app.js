/**
 * Custom App Component
 * This is the root component for all pages in Next.js
 */

import '../styles/globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

