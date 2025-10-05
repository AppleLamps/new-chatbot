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
        <div className="flex justify-start mt-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-600/10 border border-brand-100/80 dark:border-white/10">
            <svg 
              className="w-4 h-4 text-brand-700 dark:text-brand-600 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              {loadingMessages[messageIndex]}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-start ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600">
        <div className="flex space-x-1 items-center">
          <span className="text-sm mr-2">{loadingMessages[messageIndex]}</span>
          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-delay-1"></div>
          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-delay-2"></div>
        </div>
      </div>
    </div>
  )
}

