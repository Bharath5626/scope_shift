import type { Analysis } from '../../types'

interface AnalysisCardProps {
  analysis: Analysis
  projectName: string
}

const riskStyles: Record<Analysis['riskLevel'], string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-danger',
}

export function AnalysisCard({ analysis, projectName }: AnalysisCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">{projectName}</h3>
        <span className={`text-sm font-medium capitalize ${riskStyles[analysis.riskLevel]}`}>
          {analysis.riskLevel} risk
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-text-secondary">Scope Increase</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            +{analysis.scopeIncreasePercent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Additional Hours</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {analysis.additionalHours}h
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Delay</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {analysis.delayWeeks}w
          </p>
        </div>
      </div>
    </div>
  )
}
