import { DashboardLayout } from '../components/layout/DashboardLayout'

interface PlaceholderPageProps {
  title: string
  subtitle: string
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-12 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-text-primary">Coming in the next phase</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          This page is part of the ScopeAI flow and will be built out shortly.
        </p>
      </div>
    </DashboardLayout>
  )
}
