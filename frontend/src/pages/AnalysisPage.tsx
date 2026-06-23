import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'
import { api } from '../services/api'
import type { Project, ProjectStatus, ProjectType } from '../types'




const statusStyles: Record<Project['status'], string> = {
  draft:     'bg-gray-100 text-gray-600',
  active:    'bg-green-50 text-green-600',
  completed: 'bg-indigo-50 text-indigo-600',
  at_risk:   'bg-red-50 text-red-600',
}


const RISK_COLORS: Record<string, { badge: string; text: string; bar: string }> = {
  Low:    { badge: 'bg-green-100 text-green-700',  text: 'text-green-700',  bar: 'bg-green-400' },
  Medium: { badge: 'bg-amber-100 text-amber-700',  text: 'text-amber-700',  bar: 'bg-amber-400' },
  High:   { badge: 'bg-red-100 text-red-700',      text: 'text-red-700',    bar: 'bg-red-400' },
}

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
  analyses: AnalysisRow[]
}

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  )
}

function AnalysisProjectCard({
  project,
  lastAnalysis,
}: {
  project: Project
  lastAnalysis: AnalysisRow | null
}) {
  const navigate = useNavigate()
  const { setActiveProjectId } = useProjects()
  const risk = lastAnalysis ? RISK_COLORS[lastAnalysis.riskLevel] ?? RISK_COLORS.Medium : null

  const handleRun = () => {
    setActiveProjectId(project.id)
    navigate(`/analyzing?project=${project.id}`)
  }

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md">

      {/* Card header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {project.description || <span className="italic text-gray-300">No description</span>}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-500">{PROJECT_TYPE_LABELS[project.type]}</span>
          <span>Updated {formatRelativeDate(project.updatedAt)}</span>
        </div>
      </div>

      {/* Last analysis summary */}
      {lastAnalysis && risk ? (
        <div className="mx-6 mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Analysis</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${risk.badge}`}>
              {lastAnalysis.riskLevel} Risk
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-white border border-gray-100 px-2 py-2 text-center">
              <p className="text-xs text-gray-400">Scope</p>
              <p className="mt-0.5 text-sm font-bold text-indigo-700">{lastAnalysis.scopeIncreasePercent}%</p>
            </div>
            <div className="rounded-lg bg-white border border-gray-100 px-2 py-2 text-center">
              <p className="text-xs text-gray-400">Hours</p>
              <p className="mt-0.5 text-sm font-bold text-indigo-700">{lastAnalysis.additionalHours}h</p>
            </div>
            <div className="rounded-lg bg-white border border-gray-100 px-2 py-2 text-center">
              <p className="text-xs text-gray-400">Delay</p>
              <p className="mt-0.5 text-sm font-bold text-indigo-700">{lastAnalysis.delayWeeks}w</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Run {formatRelativeDate(lastAnalysis.createdAt)}
          </p>
        </div>
      ) : (
        <div className="mx-6 mb-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-center">
          <p className="text-xs text-gray-400">No analysis run yet</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-auto flex gap-2 border-t border-gray-100 p-4">
        <button
          onClick={handleRun}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {lastAnalysis ? 'Re-run Analysis' : 'Run AI Analysis'}
        </button>

        {lastAnalysis && (
          <Link
            to={`/reports/${project.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
            title="View full report"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Report
          </Link>
        )}
      </div>

    </div>
  )
}

export function AnalysisPage() {
  const { projects, loading: projectsLoading } = useProjects()
  const [analysisMap, setAnalysisMap] = useState<Record<string, AnalysisRow | null>>({})
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const ALL = 'all'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | typeof ALL>(ALL)
  const [typeFilter, setTypeFilter] = useState<ProjectType | typeof ALL>(ALL)
  const filteredProjects = projects.filter((p) => {
  const matchesSearch =
    search.trim() === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())

  const matchesStatus = statusFilter === ALL || p.status === statusFilter
  const matchesType = typeFilter === ALL || p.type === typeFilter

  return matchesSearch && matchesStatus && matchesType
})


  useEffect(() => {
    api.get<AnalyzedProject[]>('/projects/analyzed')
      .then((analyzed) => {
        const map: Record<string, AnalysisRow | null> = {}
        analyzed.forEach((p) => {
          map[p.id] = p.analyses[0] ?? null
        })
        setAnalysisMap(map)
      })
      .catch(() => setAnalysisMap({}))
      .finally(() => setAnalysisLoading(false))
  }, [])

  const loading = projectsLoading || analysisLoading
  const analyzedCount = Object.values(analysisMap).filter(Boolean).length

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
  <div className="w-full px-8 pt-10 pb-4">

<div className="sticky top-0 z-30 bg-gray-50 py-4 flex items-start justify-between gap-4 border-b border-gray-100">
  
  {/* LEFT SIDE */}
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">
      AI Impact Analysis
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      {projects.length === 0
        ? 'Create a project to get started'
        : analyzedCount > 0
          ? `${analyzedCount} of ${projects.length} project${projects.length === 1 ? '' : 's'} analysed`
          : `${projects.length} project${projects.length === 1 ? '' : 's'} — no analysis run yet`}
    </p>
  </div>

  {/* RIGHT SIDE — SAME FILTER UI */}
  <div className="flex flex-wrap items-center justify-end gap-3 min-w-[420px]">

    {/* SEARCH (slightly wider + left spacing fix) */}
    <div className="relative flex-1 min-w-56">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>

      <input
        type="text"
        placeholder="Search projects…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </div>

    {/* STATUS */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value as any)}
      className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
    >
      <option value={ALL}>All Statuses</option>
      {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>

    {/* TYPE */}
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value as any)}
      className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
    >
      <option value={ALL}>All Types</option>
      {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>

    {/* CLEAR (only if needed) */}
    {(search || statusFilter !== ALL || typeFilter !== ALL) && (
      <button
        onClick={() => {
          setSearch('')
          setStatusFilter(ALL)
          setTypeFilter(ALL)
        }}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700"
      >
        Clear
      </button>
    )}
  </div>
</div>
          
        {/* How it works */}
        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-8 py-6">
  <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-indigo-600">
    How it works
  </p>

  <div className="grid gap-5 sm:grid-cols-3">
    <Step
      number={1}
      title="Define your scope"
      desc="Structure your project scope by adding features, changes, and requirements."
    />

    <Step
      number={2}
      title="Run AI analysis"
      desc="AI-powered analysis evaluates effort, complexity, risk, and timeline."
    />

    <Step
      number={3}
      title="Review insights"
      desc="Get structured estimates, risk signals, and actionable recommendations."
    />
  </div>
</div>
        {/* Content */}
        <div className="mt-10">

          {/* Loading skeletons */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                    </div>
                    <div className="h-6 w-14 rounded-full bg-gray-100" />
                  </div>
                  <div className="h-24 w-full rounded-xl bg-gray-100" />
                  <div className="h-9 w-full rounded-xl bg-gray-100" />
                </div>
              ))}
            </div>
          )}

          {/* No projects */}
          {!loading && projects.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No projects to analyse yet</h3>
              <p className="mt-2 mx-auto max-w-sm text-sm text-gray-500">
                Create a project, add features in the Scope Builder, then come back here to run an AI analysis.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/projects/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create a Project
                </Link>
                <Link
                  to="/scope-builder"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Open Scope Builder
                </Link>
              </div>
            </div>
          )}

          {/* Projects grid */}
          {!loading && projects.length > 0 && (
            <>
              <p className="mb-4 text-xs text-gray-400">
                {analyzedCount > 0
                  ? `${analyzedCount} project${analyzedCount === 1 ? '' : 's'} with past results — hover "Report" to revisit, or re-run the analysis`
                  : 'Click "Run AI Analysis" on any project to get started'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <AnalysisProjectCard
                    key={project.id}
                    project={project}
                    lastAnalysis={analysisMap[project.id] ?? null}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
