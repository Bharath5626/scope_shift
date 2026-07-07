import type { Analysis } from '../../types'

interface AnalysisCardProps {
  analysis: Analysis
  projectName: string
}

const riskStyles: Record<Analysis['riskLevel'], string> = {
  low: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-[var(--color-danger)] dark:text-red-400',
}

export function AnalysisCard({ analysis, projectName }: AnalysisCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--text-primary)] dark:text-gray-100">{projectName}</h3>
        <span className={`text-sm font-medium capitalize ${riskStyles[analysis.riskLevel]}`}>
          {analysis.riskLevel} risk
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Scope Increase</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">
            +{analysis.scopeIncreasePercent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Additional Hours</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">
            {analysis.additionalHours}h
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Delay</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">
            {analysis.delayWeeks}w
          </p>
        </div>
      </div>
    </div>
  )
}
