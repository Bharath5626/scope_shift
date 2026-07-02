import type { ReactNode } from 'react'
import { SPACING, TYPOGRAPHY } from '../../utils/designSystem'

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function DashboardLayout({
  title,
  subtitle,
  action,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border-primary)] bg-[var(--bg-page)] backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900">
        <div className={`flex items-center justify-between ${SPACING.page.padding} py-6`}>
          <div>
            <h1 className={`${TYPOGRAPHY.pageTitle} font-semibold text-[var(--text-primary)] dark:text-gray-100`}>
              {title}
            </h1>

            {subtitle && (
              <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div className={`flex items-center gap-3`}>
              {action}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={SPACING.page.padding}>
        {children}
      </main>
    </div>
  )
}