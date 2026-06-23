import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { PROJECT_TYPE_LABELS } from '../utils/constants'

type RiskLevel = 'Low' | 'Medium' | 'High'

interface AnalysisRow {
  id: string
  scopeIncreasePercent: number
  additionalHours: number
  delayWeeks: number
  riskLevel: string
  complexity: string
  createdAt: string
}

interface AnalyzedProject {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  createdAt: string
  analyses: AnalysisRow[]
}

const RISK_COLORS: Record<string, { badge: string; dot: string }> = {
  Low:    { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  Medium: { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  High:   { badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReportsPage() {

  const [search, setSearch] = useState('')
const [riskFilter, setRiskFilter] = useState<'all' | 'Low' | 'Medium' | 'High'>('all')
  const navigate = useNavigate()
  const [projects, setProjects] = useState<AnalyzedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<AnalyzedProject[]>('/projects/analyzed')
      .then(setProjects)
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading reports…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }
const filteredProjects = projects.filter((p) => {
  const matchesSearch =
    search.trim() === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())

  const analysis = p.analyses[0]
 const risk = analysis?.riskLevel as RiskLevel | undefined

const matchesRisk =
  riskFilter === 'all' || risk === riskFilter

  return matchesSearch && matchesRisk
})
 return (
  <div className="min-h-screen bg-gray-50">
    <div className="w-full px-8 py-10 space-y-8">

      {/* HEADER + SEARCH ROW */}
{/* HEADER + FILTERS */}
<div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">

  {/* LEFT TITLE */}
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">
      Analysis Reports
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      View AI-generated scope analysis reports for your projects
    </p>
  </div>

  {/* RIGHT CONTROLS */}
  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">

    {/* SEARCH (slightly left aligned, not full right stick) */}
    <div className="relative w-full sm:w-[260px]">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
        />
      </svg>

     <input
  type="text"
  placeholder="Search reports…"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm
             focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
/>
    </div>

    {/* RISK FILTER */}
    <select
  value={riskFilter}
  onChange={(e) => setRiskFilter(e.target.value as any)}
  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
>
  <option value="all">All Risk</option>
  <option value="Low">Low Risk</option>
  <option value="Medium">Medium Risk</option>
  <option value="High">High Risk</option>
</select>
 {(search || riskFilter !== 'all') && (
  <button
    onClick={() => {
      setSearch('')
      setRiskFilter('all')
    }}
    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
  >
    Clear filters
  </button>
)}
  </div>
 
</div>
      {/* CONTENT */}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-sm text-gray-500">No reports yet</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const analysis = project.analyses[0]
            const risk = (analysis?.riskLevel ?? 'Medium') as RiskLevel
            const riskColor = RISK_COLORS[risk] ?? RISK_COLORS.Medium

            return (
              <div
                key={project.id}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/reports/${project.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-gray-900">
                      {project.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {PROJECT_TYPE_LABELS[project.type] ?? project.type}
                    </p>
                  </div>

                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor.badge}`}>
                    {risk} Risk
                  </span>
                </div>

                {project.description && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {analysis && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Scope</p>
                      <p className="mt-0.5 text-sm font-bold text-indigo-700">
                        {analysis.scopeIncreasePercent}%
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Hours</p>
                      <p className="mt-0.5 text-sm font-bold text-indigo-700">
                        {analysis.additionalHours} hrs
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Timeline</p>
                      <p className="mt-0.5 text-sm font-bold text-indigo-700">
                        {analysis.delayWeeks}w
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  </div>
)}