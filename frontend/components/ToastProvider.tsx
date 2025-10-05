'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const typeStyles: Record<ToastType, { container: string; icon: string }> = {
  info: {
    container: 'border-blue-500/40 bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-100',
    icon: 'text-blue-500 dark:text-blue-300'
  },
  success: {
    container: 'border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100',
    icon: 'text-emerald-500 dark:text-emerald-300'
  },
  warning: {
    container: 'border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100',
    icon: 'text-amber-500 dark:text-amber-300'
  },
  error: {
    container: 'border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950/80 dark:text-red-100',
    icon: 'text-red-500 dark:text-red-300'
  }
}

const icons: Record<ToastType, JSX.Element> = {
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01M10.29 3.86l-7.21 12.5A1 1 0 004.03 18h15.94a1 1 0 00.86-1.5l-7.21-12.5a1 1 0 00-1.72 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Record<string, number>>({})

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
    const timer = timersRef.current[id]
    if (timer) {
      window.clearTimeout(timer)
      delete timersRef.current[id]
    }
  }, [])

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const type = options.type ?? 'info'
    const duration = options.duration ?? 4000

    setToasts(prev => [...prev, { id, message, type }])

    if (duration > 0) {
      const timer = window.setTimeout(() => removeToast(id), duration)
      timersRef.current[id] = timer
    }
  }, [removeToast])

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(timerId => window.clearTimeout(timerId))
    }
  }, [])

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map(toast => {
          const styles = typeStyles[toast.type]
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-80 max-w-xs rounded-xl border backdrop-blur shadow-lg ring-1 ring-black/5 transition-transform ${styles.container}`}
              role="alert"
              aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
              aria-atomic="true"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/60 dark:bg-white/10 ${styles.icon}`}>
                  {icons[toast.type]}
                </span>
                <div className="flex-1 text-sm leading-relaxed">
                  {toast.message}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-current transition hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                  aria-label="Dismiss notification"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}


