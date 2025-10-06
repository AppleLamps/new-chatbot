import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '../components/ToastProvider'

// Configure Geist font with multiple weights for better typography
const geist = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap', // Add font-display: swap for performance
})

// Keep Inter as fallback
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LampChat',
  description: 'A ChatGPT-like chatbot experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 transition-colors">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
