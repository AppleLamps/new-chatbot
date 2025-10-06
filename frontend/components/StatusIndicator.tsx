'use client'

/**
 * StatusIndicator Component
 *
 * A versatile status indicator component with multiple types and animations.
 *
 * @example
 * // Online/Offline Status
 * <StatusIndicator type="online" showLabel size="sm" />
 * <StatusIndicator type="offline" showLabel label="Away" />
 *
 * // Typing Indicator
 * <StatusIndicator type="typing" showLabel />
 *
 * // Connection Status
 * <StatusIndicator type="connected" showLabel />
 * <StatusIndicator type="connecting" showLabel />
 * <StatusIndicator type="error" showLabel label="Connection Failed" />
 *
 * // Using utility components
 * <OnlineStatus />
 * <TypingIndicator />
 * <ConnectionStatus status="connecting" />
 */

interface StatusIndicatorProps {
  type: 'online' | 'offline' | 'typing' | 'connected' | 'connecting' | 'error'
  label?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StatusIndicator({
  type,
  label,
  showLabel = false,
  size = 'md',
  className = ''
}: StatusIndicatorProps) {

  // Size configurations
  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      gap: 'gap-1.5'
    },
    md: {
      dot: 'w-2.5 h-2.5',
      text: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      dot: 'w-3 h-3',
      text: 'text-base',
      gap: 'gap-2.5'
    }
  }

  const currentSize = sizeClasses[size]

  // Render online/offline status
  if (type === 'online' || type === 'offline') {
    const isOnline = type === 'online'
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        <div className="relative">
          {/* Status dot */}
          <div
            className={`${currentSize.dot} rounded-full ${isOnline
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : 'bg-neutral-400 dark:bg-neutral-500'
              }`}
          />
          {/* Pulse ring for online status */}
          {isOnline && (
            <div
              className={`absolute inset-0 ${currentSize.dot} rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping opacity-75`}
            />
          )}
        </div>
        {showLabel && (
          <span className={`${currentSize.text} font-medium ${isOnline
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-neutral-600 dark:text-neutral-400'
            }`}>
            {label || (isOnline ? 'Online' : 'Offline')}
          </span>
        )}
      </div>
    )
  }

  // Render typing indicator
  if (type === 'typing') {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          {/* Animated dots */}
          <div className={`${currentSize.dot} rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce`} />
          <div className={`${currentSize.dot} rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce-delay-1`} />
          <div className={`${currentSize.dot} rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce-delay-2`} />
        </div>
        {showLabel && (
          <span className={`${currentSize.text} text-neutral-600 dark:text-neutral-400`}>
            {label || 'Typing...'}
          </span>
        )}
      </div>
    )
  }

  // Render connection status
  if (type === 'connected' || type === 'connecting' || type === 'error') {
    let statusConfig = {
      color: '',
      bgColor: '',
      borderColor: '',
      icon: null as React.ReactNode,
      defaultLabel: ''
    }

    if (type === 'connected') {
      statusConfig = {
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        icon: (
          <svg className={`${currentSize.dot === 'w-2 h-2' ? 'w-4 h-4' : currentSize.dot === 'w-2.5 h-2.5' ? 'w-5 h-5' : 'w-6 h-6'} text-emerald-600 dark:text-emerald-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        defaultLabel: 'Connected'
      }
    } else if (type === 'connecting') {
      statusConfig = {
        color: 'text-brand-700 dark:text-brand-400',
        bgColor: 'bg-brand-50 dark:bg-brand-900/20',
        borderColor: 'border-brand-200 dark:border-brand-800',
        icon: (
          <svg className={`${currentSize.dot === 'w-2 h-2' ? 'w-4 h-4' : currentSize.dot === 'w-2.5 h-2.5' ? 'w-5 h-5' : 'w-6 h-6'} text-brand-600 dark:text-brand-400 animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ),
        defaultLabel: 'Connecting...'
      }
    } else { // error
      statusConfig = {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: (
          <svg className={`${currentSize.dot === 'w-2 h-2' ? 'w-4 h-4' : currentSize.dot === 'w-2.5 h-2.5' ? 'w-5 h-5' : 'w-6 h-6'} text-red-600 dark:text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        defaultLabel: 'Connection Error'
      }
    }

    return (
      <div className={`inline-flex items-center ${currentSize.gap} px-3 py-2 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor} ${className}`}>
        {statusConfig.icon}
        {showLabel && (
          <span className={`${currentSize.text} font-medium ${statusConfig.color}`}>
            {label || statusConfig.defaultLabel}
          </span>
        )}
      </div>
    )
  }

  return null
}

// Export additional utility components for common use cases
export function OnlineStatus({ showLabel = true, size = 'sm' }: { showLabel?: boolean, size?: 'sm' | 'md' | 'lg' }) {
  return <StatusIndicator type="online" showLabel={showLabel} size={size} />
}

export function TypingIndicator({ showLabel = false, size = 'md' }: { showLabel?: boolean, size?: 'sm' | 'md' | 'lg' }) {
  return <StatusIndicator type="typing" showLabel={showLabel} size={size} />
}

export function ConnectionStatus({
  status,
  showLabel = true,
  size = 'md'
}: {
  status: 'connected' | 'connecting' | 'error',
  showLabel?: boolean,
  size?: 'sm' | 'md' | 'lg'
}) {
  return <StatusIndicator type={status} showLabel={showLabel} size={size} />
}

