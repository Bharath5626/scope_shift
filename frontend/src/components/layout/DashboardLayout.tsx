import type { ReactNode } from 'react'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div className="flex items-center gap-3">
              {action}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {children}
      </main>
    </div>
  )
}