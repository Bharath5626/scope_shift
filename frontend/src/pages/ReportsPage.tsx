import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { PROJECT_TYPE_LABELS } from '../utils/constants'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton, LoadingSkeleton } from '../components/LoadingSkeleton'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION } from '../utils/designSystem'

type RiskLevel = 'Low' | 'Medium' | 'High'

interface AnalysisRow {
  id: string
  scopeScore: number
  complexityScore: number | null
  scopeIncreasePercent: number
  additionalHours: number
  estimatedWeeks: number
  riskLevel: string
  complexityLevel: string
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
  Low:    { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  dot: 'bg-green-500' },
  Medium: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',  dot: 'bg-amber-500' },
  High:   { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',      dot: 'bg-red-500' },
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
      <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900">
        <div className="w-full px-8 py-10 space-y-8">
          <div className="flex flex-col gap-4 border-b border-[var(--border-primary)] pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
            <div className="space-y-2">
              <LoadingSkeleton className="h-8 w-48" />
              <LoadingSkeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-3">
              <LoadingSkeleton className="h-10 w-48 rounded-xl" />
              <LoadingSkeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center dark:bg-gray-900">
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    )
  }

  const handleExportCSV = () => {
    const headers = ['Project Name', 'Type', 'Risk Level', 'Scope Score', 'Additional Hours', 'Estimated Weeks', 'Created Date']
    const rows = filteredProjects.map(project => {
      const analysis = project.analyses[0]
      return [
        project.name,
        PROJECT_TYPE_LABELS[project.type] ?? project.type,
        analysis?.riskLevel ?? 'Medium',
        analysis?.scopeScore ?? 0,
        analysis?.additionalHours ?? 0,
        analysis?.estimatedWeeks ?? 0,
        formatDate(analysis?.createdAt || project.createdAt)
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `scope-creep-reports-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
  <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900">
    <div className={`w-full ${SPACING.page.padding} py-10 space-y-8`}>

      {/* HEADER + SEARCH ROW */}
{/* HEADER + FILTERS */}
<div className="flex flex-col gap-4 border-b border-[var(--border-primary)] pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">

  {/* LEFT TITLE */}
  <div>
    <h1 className={`${TYPOGRAPHY.pageTitle} text-[var(--text-primary)] dark:text-gray-100`}>
      Analysis Reports
    </h1>
    <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
      View AI-generated scope analysis reports for your projects
    </p>
  </div>

  {/* RIGHT CONTROLS */}
  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">

    {/* SEARCH (slightly left aligned, not full right stick) */}
    <div className="relative w-full sm:w-[260px]">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)] dark:text-[var(--text-soft)]"
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
  className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-4 ${TYPOGRAPHY.body} ${SHADOW.card}
             focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
/>
    </div>

    {/* RISK FILTER */}
    <select
  value={riskFilter}
  onChange={(e) => setRiskFilter(e.target.value as any)}
  className={`${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-surface)] px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] ${SHADOW.card} focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
>
  <option value="all">All Risk</option>
  <option value="Low">Low Risk</option>
  <option value="Medium">Medium Risk</option>
  <option value="High">High Risk</option>
</select>

    {/* EXPORT BUTTON */}
    {filteredProjects.length > 0 && (
      <button
        onClick={handleExportCSV}
        className={`flex items-center gap-2 ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] ${TRANSITION} hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
        title="Export to CSV"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>
    )}

  {(search || riskFilter !== 'all') && (
  <button
    onClick={() => {
      setSearch('')
      setRiskFilter('all')
    }}
    className={`${TYPOGRAPHY.body} font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300`}
  >
    Clear filters
  </button>
)}
  </div>
 
</div>
      {/* CONTENT */}

      {projects.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Run an AI analysis on your projects to generate detailed scope creep reports."
          action={{
            label: 'Go to Analysis',
            onClick: () => navigate('/analysis'),
          }}
          size="md"
        />
      ) : (
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
          {filteredProjects.map((project) => {
            const analysis = project.analyses[0]
            const risk = (analysis?.riskLevel ?? 'Medium') as RiskLevel
            const riskColor = RISK_COLORS[risk] ?? RISK_COLORS.Medium

            return (
              <div
                key={project.id}
                className={`group flex flex-col ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} ${TRANSITION} hover:shadow-md cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-900/30`}
                onClick={() => navigate(`/reports/${project.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className={`truncate ${TYPOGRAPHY.cardTitle} text-[var(--text-primary)] dark:text-gray-100`}>
                      {project.name}
                    </h2>
                    <p className={`mt-0.5 ${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
                      {PROJECT_TYPE_LABELS[project.type] ?? project.type}
                    </p>
                  </div>

                  <span className={`shrink-0 ${BORDER_RADIUS.tag} px-2.5 py-0.5 ${TYPOGRAPHY.caption} font-semibold ${riskColor.badge}`}>
                    {risk} Risk
                  </span>
                </div>

                {project.description && (
                  <p className={`mt-3 ${TYPOGRAPHY.body} text-[var(--text-soft)] line-clamp-2 dark:text-[var(--text-subtle)]`}>
                    {project.description}
                  </p>
                )}

                {analysis && (
                  <div className={`mt-4 grid grid-cols-3 gap-3 ${SPACING.section.gap}`}>
                    <div className={`${BORDER_RADIUS.small} bg-[var(--bg-section)] px-3 py-2 text-center dark:bg-gray-700`}>
                      <p className={`${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>Scope Score</p>
                      <p className="mt-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                        {analysis.complexityScore ?? Math.round(analysis.scopeIncreasePercent)}%
                      </p>
                    </div>

                    <div className={`${BORDER_RADIUS.small} bg-[var(--bg-section)] px-3 py-2 text-center dark:bg-gray-700`}>
                      <p className={`${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>Hours</p>
                      <p className="mt-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                        {analysis.additionalHours} hrs
                      </p>
                    </div>

                    <div className={`${BORDER_RADIUS.small} bg-[var(--bg-section)] px-3 py-2 text-center dark:bg-gray-700`}>
                      <p className={`${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>Timeline</p>
                      <p className="mt-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                        {analysis.estimatedWeeks}w
                      </p>
                    </div>
                  </div>
                )}

                <div className={`mt-4 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700`}>
                  <p className={`${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
                    Report created on {formatDate(analysis?.createdAt || project.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  </div>
)}