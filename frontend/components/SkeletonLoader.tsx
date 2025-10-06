interface SkeletonLoaderProps {
  variant?: 'message' | 'suggestion' | 'chat-item'
}

export default function SkeletonLoader({ variant = 'message' }: SkeletonLoaderProps) {
  if (variant === 'message') {
    return (
      <div className="flex justify-start animate-fade-in-up">
        <div className="max-w-xs lg:max-w-2xl w-full">
          {/* Glass-morphism skeleton with shimmer effect */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-700/40 shadow-elev-2 px-4 py-3">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>

            {/* Skeleton lines */}
            <div className="space-y-2 relative">
              <div className="h-4 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-full"></div>
              <div className="h-4 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-5/6"></div>
            </div>
            {/* Timestamp skeleton */}
            <div className="h-3 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-16 mt-3 relative"></div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'suggestion') {
    const suggestionWidths = ['w-32', 'w-40', 'w-28']
    return (
      <div className="flex flex-wrap gap-2 mt-2 ml-2 animate-fade-in">
        {suggestionWidths.map((widthClass, index) => (
          <div
            key={index}
            className={`relative overflow-hidden h-8 rounded-full backdrop-blur-sm bg-white/60 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-700/40 ${widthClass}`}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"></div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'chat-item') {
    return (
      <div className="relative overflow-hidden p-3 rounded-lg border border-transparent backdrop-blur-sm bg-white/40 dark:bg-neutral-800/40">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>

        <div className="space-y-2 relative">
          <div className="h-4 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-3/4"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-20"></div>
            <div className="h-3 bg-neutral-300/60 dark:bg-neutral-600/60 rounded w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

