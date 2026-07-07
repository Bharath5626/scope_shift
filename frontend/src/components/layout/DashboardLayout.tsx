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
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border-primary)] bg-[var(--bg-page)]/80 backdrop-blur-md dark:bg-[var(--bg-page)]/80">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${SPACING.page.headerPadding}`}>
          <div>
            <h1 className={`${TYPOGRAPHY.pageTitle} font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]`}>
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