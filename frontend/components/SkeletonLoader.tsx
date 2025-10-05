interface SkeletonLoaderProps {
  variant?: 'message' | 'suggestion' | 'chat-item'
}

export default function SkeletonLoader({ variant = 'message' }: SkeletonLoaderProps) {
  if (variant === 'message') {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs lg:max-w-2xl w-full">
          <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 animate-pulse">
            {/* Skeleton lines */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
            {/* Timestamp skeleton */}
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mt-3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'suggestion') {
    return (
      <div className="flex flex-wrap gap-2 mt-2 ml-2 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-32"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-40"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
      </div>
    )
  }

  if (variant === 'chat-item') {
    return (
      <div className="p-3 rounded-lg border border-transparent animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

