/**
 * Custom App Component
 * This is the root component for all pages in Next.js
 */

import '../styles/globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import BackgroundMusic from '../components/BackgroundMusic'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <BackgroundMusic />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

