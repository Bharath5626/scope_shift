import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: number | string
  icon: ReactNode
  accent?: 'primary' | 'success' | 'warning' | 'danger'
}

const accentStyles = {
  primary: 'bg-[var(--color-primary-50)] text-[var(--color-primary)] dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)]',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] dark:bg-[var(--color-danger)]/20 dark:text-[var(--color-danger-light)]',
}

export function StatsCard({
  label,
  value,
  icon,
  accent = 'primary',
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[var(--color-primary)]/50 dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)] dark:hover:border-[var(--color-primary-light)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-soft)] dark:text-[var(--text-subtle)]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)] dark:text-gray-100">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}