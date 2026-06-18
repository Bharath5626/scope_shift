import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { PROJECT_TYPE_LABELS } from '../utils/constants'

type RiskLevel = 'Low' | 'Medium' | 'High'

interface EffortBreakdown {
  development: number
  testing: number
  integration: number
  documentation: number
}

interface Analysis {
  id: string
  scopeIncreasePercent: number
  additionalHours: number
  delayWeeks: number
  riskLevel: string
  complexity: string
  effortBreakdown: EffortBreakdown | null
  riskFactors: string[] | null
  recommendations: string[] | null
  createdAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
}

const RISK_COLORS: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  Low:    { bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  border: 'border-green-200' },
  Medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',  border: 'border-amber-200' },
  High:   { bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',      border: 'border-red-200' },
}

const COMPLEXITY_STROKE: Record<string, string> = {
  Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444',
}

const TABS = ['Summary', 'Effort Breakdown', 'Risk Analysis', 'Recommendations'] as const
type Tab = typeof TABS[number]

function DonutChart({ level, score }: { level: string; score: number }) {
  const r = 45
  const circ = 2 * Math.PI * r
  const filled = (Math.min(score, 100) / 100) * circ
  const color = COMPLEXITY_STROKE[level] ?? '#f59e0b'
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{level}</p>
        <p className="text-xs text-gray-400">complexity</p>
      </div>
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

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? 'text-indigo-700'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function SummaryTab({ analysis }: { analysis: Analysis }) {
  const risk = analysis.riskLevel as RiskLevel
  const riskColors = RISK_COLORS[risk] ?? RISK_COLORS.Medium
  const complexity = analysis.complexity as RiskLevel
  const score = Math.round(analysis.scopeIncreasePercent)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Scope Score" value={`${score}%`} />
        <StatCard label="Estimated Effort" value={`${analysis.additionalHours} hrs`} />
        <StatCard label="Timeline" value={`${analysis.delayWeeks} ${analysis.delayWeeks === 1 ? 'week' : 'weeks'}`} />
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Risk Level</p>
          <p className={`mt-1 text-2xl font-bold ${riskColors.text}`}>{risk}</p>
          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${riskColors.badge}`}>
            {risk} Risk
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:gap-8">
        <DonutChart level={complexity} score={score} />
        <div>
          <p className="text-sm font-semibold text-gray-700">Complexity Level</p>
          <p className={`mt-1 text-3xl font-bold ${riskColors.text}`}>{complexity}</p>
          <p className="mt-1 text-sm text-gray-500">
            Based on {analysis.additionalHours} hours of estimated effort across all categories.
          </p>
        </div>
      </div>
    </div>
  )
}

function EffortTab({ breakdown }: { breakdown: EffortBreakdown | null }) {
  if (!breakdown) {
    return <p className="text-sm text-gray-400">No effort breakdown available for this analysis.</p>
  }
  const rows = [
    { label: 'Development',   hours: breakdown.development,   pct: 60 },
    { label: 'Testing',       hours: breakdown.testing,       pct: 17 },
    { label: 'Integration',   hours: breakdown.integration,   pct: 13 },
    { label: 'Documentation', hours: breakdown.documentation, pct: 10 },
  ]
  const total = breakdown.development + breakdown.testing + breakdown.integration + breakdown.documentation
  const maxHours = Math.max(...rows.map((r) => r.hours), 1)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-semibold text-gray-700">Hours by Category</h3>
      {rows.map(({ label, hours }) => {
        const pct = Math.round((hours / maxHours) * 100)
        return (
          <div key={label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{label}</span>
              <span className="font-semibold text-gray-900">{hours} hrs</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
      <div className="border-t border-gray-200 pt-4 flex items-center justify-between text-sm font-bold">
        <span className="text-gray-800">Total</span>
        <span className="text-indigo-700">{total} hrs</span>
      </div>
    </div>
  )
}

function RiskTab({ riskLevel, riskFactors, complexity }: { riskLevel: string; riskFactors: string[] | null; complexity: string }) {
  const risk = riskLevel as RiskLevel
  const riskColors = RISK_COLORS[risk] ?? RISK_COLORS.Medium
  const factors = riskFactors ?? []

  return (
    <div className="space-y-5">
      <div className={`flex items-center gap-4 rounded-xl border p-5 ${riskColors.bg} ${riskColors.border}`}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold ${riskColors.text}`}>
          {risk[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Overall Risk: {risk}</p>
          <p className="text-xs text-gray-500 mt-0.5">Complexity level: {complexity}</p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${riskColors.badge}`}>
          {risk} Risk
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Identified Risk Factors</h3>
        {factors.length === 0 ? (
          <p className="text-sm text-gray-400">No risk factors recorded for this analysis.</p>
        ) : (
          <div className="space-y-3">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                <WarningIcon />
                <span className="text-sm text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationsTab({ recommendations }: { recommendations: string[] | null }) {
  const items = recommendations ?? []
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">AI Recommendations</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No recommendations recorded for this analysis.</p>
      ) : (
        <div className="space-y-3">
          {items.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
              <CheckIcon />
              <span className="text-sm text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ReportDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Summary')

  useEffect(() => {
    if (!projectId) return
    Promise.all([
      api.get<Project>(`/projects/${projectId}`),
      api.get<Analysis>(`/projects/${projectId}/analyses/latest`),
    ])
      .then(([proj, anal]) => {
        setProject(proj)
        setAnalysis(anal)
      })
      .catch(() => setError('Failed to load report data'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading report…</p>
        </div>
      </div>
    )
  }

  if (error || !project || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/reports')}
            className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/reports')}
              className="mb-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Reports
            </button>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {PROJECT_TYPE_LABELS[project.type] ?? project.type} · Detailed Analysis Report
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'Summary' && <SummaryTab analysis={analysis} />}
          {activeTab === 'Effort Breakdown' && (
            <EffortTab breakdown={analysis.effortBreakdown as EffortBreakdown | null} />
          )}
          {activeTab === 'Risk Analysis' && (
            <RiskTab
              riskLevel={analysis.riskLevel}
              riskFactors={analysis.riskFactors as string[] | null}
              complexity={analysis.complexity}
            />
          )}
          {activeTab === 'Recommendations' && (
            <RecommendationsTab recommendations={analysis.recommendations as string[] | null} />
          )}
        </div>

      </div>
    </div>
  )
}
