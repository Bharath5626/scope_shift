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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
  <div className="mx-auto max-w-5xl">

    {/* Header */}
    <div className="py-6 border-b border-gray-200 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analysis Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View AI-generated scope analysis reports for your projects
        </p>
      </div>
    </div>

    {/* Content starts here */}
       

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-700">No reports yet</p>
            <p className="mt-1 text-xs text-gray-400">Complete an analysis on a project to see its report here</p>
            <button
              onClick={() => navigate('/projects/new')}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create a Project
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((project) => {
              const analysis = project.analyses[0]
              const risk = (analysis?.riskLevel ?? 'Medium') as RiskLevel
              const riskColor = RISK_COLORS[risk] ?? RISK_COLORS.Medium

              return (
                <div
                  key={project.id}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md cursor-pointer"
                  onClick={() => navigate(`/reports/${project.id}`)}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-gray-900">{project.name}</h2>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {PROJECT_TYPE_LABELS[project.type] ?? project.type}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor.badge}`}>
                      {risk} Risk
                    </span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}

                  {/* Stats */}
                  {analysis && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                        <p className="text-xs text-gray-400">Scope</p>
                        <p className="mt-0.5 text-sm font-bold text-indigo-700">{analysis.scopeIncreasePercent}%</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                        <p className="text-xs text-gray-400">Hours</p>
                        <p className="mt-0.5 text-sm font-bold text-indigo-700">{analysis.additionalHours} hrs</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                        <p className="text-xs text-gray-400">Timeline</p>
                        <p className="mt-0.5 text-sm font-bold text-indigo-700">{analysis.delayWeeks}w</p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Analysed {analysis ? formatDate(analysis.createdAt) : '—'}
                    </p>
                    <span className="text-xs font-medium text-indigo-600 group-hover:underline">
                      View Report →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
