import { useState, useEffect } from 'react'
import SkeletonLoader from './SkeletonLoader'

interface LoadingIndicatorProps {
  showSkeleton?: boolean
  className?: string
}

const loadingMessages = [
  'Thinking...',
  'Processing your request...',
  'Analyzing the context...',
  'Generating response...',
  'Almost there...'
]

export default function LoadingIndicator({ showSkeleton = true, className = '' }: LoadingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [])

  if (showSkeleton) {
    return (
      <div className={className}>
        <SkeletonLoader variant="message" />
        <div className="flex justify-start mt-2 animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-light border border-brand-200/60 dark:border-brand-600/30 shadow-elev-2">
            {/* Elegant gradient spinner */}
            <div className="relative w-5 h-5">
              {/* Outer spinning ring with gradient */}
              <svg
                className="w-5 h-5 animate-spin-smooth"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="60 40"
                  className="opacity-90"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="text-brand-600" stopColor="currentColor" />
                    <stop offset="50%" className="text-accent-purple-600" stopColor="currentColor" />
                    <stop offset="100%" className="text-accent-blue-600" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-brand-600 to-accent-purple-600 animate-pulse-soft"></div>
              </div>
            </div>

            <span className="text-sm text-brand-700 dark:text-brand-300 font-medium">
              {loadingMessages[messageIndex]}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-start ${className}`}>
      <div className="glass-light border border-neutral-300/60 dark:border-neutral-600/50 px-4 py-3 rounded-xl shadow-elev-2 animate-fade-in">
        <div className="flex space-x-2 items-center">
          <span className="text-sm mr-2 text-neutral-700 dark:text-neutral-300 font-medium">{loadingMessages[messageIndex]}</span>
          {/* Elegant bouncing dots with gradient colors */}
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-accent-purple-600 to-accent-purple-700 animate-bounce-delay-1"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-accent-blue-600 to-accent-blue-700 animate-bounce-delay-2"></div>
        </div>
      </div>
    </div>
  )
}

