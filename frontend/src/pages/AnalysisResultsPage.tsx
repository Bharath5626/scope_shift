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
  Low:    { bg: 'bg-green-50',  text: 'text-[var(--color-success)]',  badge: 'bg-green-100 text-[var(--color-success)]' },
  Medium: { bg: 'bg-amber-50',  text: 'text-[var(--color-warning)]',  badge: 'bg-amber-100 text-[var(--color-warning)]' },
  High:   { bg: 'bg-red-50',    text: 'text-[var(--color-danger)]',    badge: 'bg-red-100 text-[var(--color-danger)]' },
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
        <p className="text-lg font-bold text-[var(--text-primary)]">{level}</p>
        <p className="text-xs text-[var(--text-subtle)]">complexity</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-white px-5 py-4 text-center shadow-sm">
      <p className="text-xs font-medium text-[var(--text-soft)] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-indigo-700">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--text-subtle)]">{sub}</p>}
    </div>
  )
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4 text-[var(--color-warning)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-soft)] text-sm">No analysis data found.</p>
          <button
            onClick={() => navigate(projectId ? `/scope-builder?project=${projectId}` : '/')}
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
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
    <div className="min-h-screen bg-[var(--bg-page)] p-8">
      <div className="w-full max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">6</div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Impact Analysis Results (Summary)</h1>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-xl border border-[var(--border-primary)] bg-white p-8 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Impact Analysis Summary</h2>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">Here's how the scope affects your project</p>

          {/* Top stats row */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <StatCard label="Scope" value={`${scopeScore}%`} />
            <StatCard label="Estimated Effort" value={`${estimatedHours} hrs`} />
            <StatCard label="Estimated Timeline" value={`${estimatedWeeks} ${estimatedWeeks === 1 ? 'week' : 'weeks'}`} />
            <div className="rounded-xl border border-[var(--border-primary)] bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-medium text-[var(--text-soft)] uppercase tracking-wide">Risk Level</p>
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
              <h3 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">Effort Breakdown (Hours)</h3>
              <div className="space-y-2">
                {effortRows.map(({ label, hours }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="font-medium text-[var(--text-primary)]">+{hours} hrs</span>
                  </div>
                ))}
                <div className="mt-3 border-t border-[var(--border-primary)] pt-3 flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-indigo-700">+{total} hrs</span>
                </div>
              </div>
            </div>

            {/* Complexity donut */}
            <div className="col-span-1 flex flex-col items-center justify-start">
              <h3 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">Complexity</h3>
              <DonutChart level={complexity.level} score={complexity.score} />
              <p className="mt-2 text-xs text-[var(--text-subtle)]">(was Medium)</p>
            </div>

            {/* Risk Factors */}
            <div className="col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">Risk Factors</h3>
              <div className="space-y-2.5">
                {riskFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <WarningIcon />
                    <span className="text-sm text-[var(--text-muted)]">{factor}</span>
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
            className="rounded-lg bg-[var(--color-primary)] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
          >
            View Detailed Report
          </button>
        </div>

      </div>
    </div>
  )
}
