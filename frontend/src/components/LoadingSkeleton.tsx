interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
  )
}

interface CardSkeletonProps {
  className?: string
}

export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={`rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-4 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20 ${className}`}>
      <div className="flex justify-between gap-3">
        <div className="-flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-2/3" />
          <LoadingSkeleton className="h-3 w-full" />
          <LoadingSkeleton className="h-3 w-4/5" />
        </div>
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
      <LoadingSkeleton className="h-24 w-full rounded-xl" />
      <LoadingSkeleton className="h-9 w-full rounded-xl" />
    </div>
  )
}

interface StatsCardSkeletonProps {
  className?: string
}

export function StatsCardSkeleton({ className = '' }: StatsCardSkeletonProps) {
  return (
    <div className={`rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20 ${className}`}>
      <LoadingSkeleton className="h-3 w-20 mb-1" />
      <LoadingSkeleton className="h-8 w-16" />
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  className?: string
}

export function TableSkeleton({ rows = 3, className = '' }: TableSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <LoadingSkeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-1/3" />
            <LoadingSkeleton className="h-3 w-2/3" />
          </div>
          <LoadingSkeleton className="h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}
