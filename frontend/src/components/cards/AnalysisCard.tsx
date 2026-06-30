import type { Analysis } from '../../types'

interface AnalysisCardProps {
  analysis: Analysis
  projectName: string
}

const riskStyles: Record<Analysis['riskLevel'], string> = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-red-600 dark:text-red-400',
}

export function AnalysisCard({ analysis, projectName }: AnalysisCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{projectName}</h3>
        <span className={`text-sm font-medium capitalize ${riskStyles[analysis.riskLevel]}`}>
          {analysis.riskLevel} risk
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Scope Increase</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            +{analysis.scopeIncreasePercent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Additional Hours</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {analysis.additionalHours}h
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Delay</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {analysis.delayWeeks}w
          </p>
        </div>
      </div>
    </div>
  )
}
