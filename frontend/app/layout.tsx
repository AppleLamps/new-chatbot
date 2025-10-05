import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '../components/ToastProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
