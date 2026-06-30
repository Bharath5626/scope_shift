import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  illustration?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: {
    container: 'py-8 px-6',
    icon: 'h-10 w-10',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12 px-8',
    icon: 'h-14 w-14',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-10',
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
  },
}

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const styles = sizeStyles[size]

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : icon ? (
        <div className={`mb-6 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 ${styles.icon}`}>
          {icon}
        </div>
      ) : (
        <div className={`mb-6 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 ${styles.icon}`}>
          <svg className="h-1/2 w-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}

      <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${styles.title}`}>
        {title}
      </h3>

      <p className={`mt-2 max-w-sm text-gray-500 dark:text-gray-400 ${styles.description}`}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition ${
                action.variant === 'secondary'
                  ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
