import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

type RiskLevel = 'Low' | 'Medium' | 'High'

interface AnalysisResult {
  scopeScore: number
  estimatedHours: number
  estimatedWeeks: number
  riskLevel: RiskLevel
  effortBreakdown: {
    development: number
    testing: number
    integration: number
    documentation: number
  }
  complexity: {
    level: RiskLevel
    score: number
  }
  riskFactors: string[]
}

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; badge: string }> = {
  Low:    { bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  Medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  High:   { bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
}

const COMPLEXITY_STROKE: Record<RiskLevel, string> = {
  Low:    '#22c55e',
  Medium: '#f59e0b',
  High:   '#ef4444',
}

function DonutChart({ level, score }: { level: RiskLevel; score: number }) {
  const r = 45
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = COMPLEXITY_STROKE[level]

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{level}</p>
        <p className="text-xs text-gray-400">complexity</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-indigo-700">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

export function AnalysisResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const projectId = searchParams.get('project') ?? ''

  const result = location.state?.result as AnalysisResult | undefined

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">No analysis data found.</p>
          <button
            onClick={() => navigate(projectId ? `/scope-builder?project=${projectId}` : '/')}
            className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const { scopeScore, estimatedHours, estimatedWeeks, riskLevel, effortBreakdown, complexity, riskFactors } = result
  const total = effortBreakdown.development + effortBreakdown.testing + effortBreakdown.integration + effortBreakdown.documentation
  const riskColors = RISK_COLORS[riskLevel] ?? RISK_COLORS.Medium

  const effortRows = [
    { label: 'Development',  hours: effortBreakdown.development },
    { label: 'Testing',      hours: effortBreakdown.testing },
    { label: 'Integration',  hours: effortBreakdown.integration },
    { label: 'Documentation',hours: effortBreakdown.documentation },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">6</div>
            <h1 className="text-xl font-semibold text-gray-900">Impact Analysis Results (Summary)</h1>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Impact Analysis Summary</h2>
          <p className="mt-0.5 text-sm text-gray-500">Here's how the scope affects your project</p>

          {/* Top stats row */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <StatCard label="Scope" value={`${scopeScore}%`} />
            <StatCard label="Estimated Effort" value={`${estimatedHours} hrs`} />
            <StatCard label="Estimated Timeline" value={`${estimatedWeeks} ${estimatedWeeks === 1 ? 'week' : 'weeks'}`} />
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Risk Level</p>
              <p className={`mt-1 text-2xl font-bold ${riskColors.text}`}>{riskLevel}</p>
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${riskColors.badge}`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Bottom three-column section */}
          <div className="mt-8 grid grid-cols-3 gap-6">

            {/* Effort Breakdown */}
            <div className="col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Effort Breakdown (Hours)</h3>
              <div className="space-y-2">
                {effortRows.map(({ label, hours }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">+{hours} hrs</span>
                  </div>
                ))}
                <div className="mt-3 border-t border-gray-200 pt-3 flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-indigo-700">+{total} hrs</span>
                </div>
              </div>
            </div>

            {/* Complexity donut */}
            <div className="col-span-1 flex flex-col items-center justify-start">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Complexity</h3>
              <DonutChart level={complexity.level} score={complexity.score} />
              <p className="mt-2 text-xs text-gray-400">(was Medium)</p>
            </div>

            {/* Risk Factors */}
            <div className="col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Risk Factors</h3>
              <div className="space-y-2.5">
                {riskFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <WarningIcon />
                    <span className="text-sm text-gray-600">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer action */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/reports/${projectId}`)}
            className="rounded-lg bg-indigo-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            View Detailed Report
          </button>
        </div>

      </div>
    </div>
  )
}
