import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'
import { api } from '../services/api'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION, ICON_SIZE } from '../utils/designSystem'
import type { Project, ProjectStatus, ProjectType } from '../types'




const statusStyles: Record<Project['status'], string> = {
  draft:     'bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
  active:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-[var(--color-primary-50)] text-[var(--color-primary-dark)] dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)]',
  at_risk:   'bg-red-50 text-[var(--color-danger)] dark:bg-red-900/30 dark:text-red-400',
}


const RISK_COLORS: Record<string, { badge: string; text: string; bar: string }> = {
  Low:    { badge: 'bg-green-100 text-[var(--color-success)] dark:bg-green-900/30 dark:text-green-400',  text: 'text-[var(--color-success)] dark:text-green-400',  bar: 'bg-green-400' },
  Medium: { badge: 'bg-amber-100 text-[var(--color-warning)] dark:bg-amber-900/30 dark:text-amber-400',  text: 'text-[var(--color-warning)] dark:text-amber-400',  bar: 'bg-amber-400' },
  High:   { badge: 'bg-red-100 text-[var(--color-danger)] dark:bg-red-900/30 dark:text-red-400',      text: 'text-[var(--color-danger)] dark:text-red-400',    bar: 'bg-red-400' },
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{title}</p>
        <p className="mt-0.5 text-sm text-[var(--text-muted)] dark:text-[var(--text-muted)]">{desc}</p>
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
    <div className={`flex flex-col ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SHADOW.card} ${TRANSITION} hover:border-[var(--color-primary)]/50 ${SHADOW.cardHover} dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)] dark:hover:border-[var(--color-primary-light)]`}>

      {/* Card header */}
      <div className={`${SPACING.card.padding} pb-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`truncate ${TYPOGRAPHY.cardTitle} text-[var(--text-primary)] dark:text-[var(--text-primary)]`}>{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
              {project.description || <span className="italic text-[var(--text-subtle)] dark:text-[var(--text-soft)]">No description</span>}
            </p>
          </div>
          <span className={`shrink-0 ${BORDER_RADIUS.tag} px-2.5 py-1 ${TYPOGRAPHY.caption} font-medium ${statusStyles[project.status]}`}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>

        <div className={`mt-3 flex items-center justify-between ${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
          <span className={`font-medium text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>{PROJECT_TYPE_LABELS[project.type]}</span>
          <span>Updated {formatRelativeDate(project.updatedAt)}</span>
        </div>
      </div>

      {/* Last analysis summary */}
      {lastAnalysis && risk ? (
        <div className={`mx-3 sm:mx-6 mb-3 sm:mb-4 ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-[var(--bg-section)] ${SPACING.card.compactPadding} dark:border-[var(--border-secondary)] dark:bg-[var(--bg-section)]`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`${TYPOGRAPHY.caption} font-semibold text-[var(--text-soft)] uppercase tracking-wide dark:text-[var(--text-subtle)]`}>Last Analysis</p>
            <span className={`${BORDER_RADIUS.tag} px-2 py-0.5 ${TYPOGRAPHY.caption} font-semibold ${risk.badge}`}>
              {lastAnalysis.riskLevel} Risk
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-white border border-[var(--border-primary)] px-2 py-2 text-center dark:bg-[var(--bg-section)] dark:border-[var(--border-secondary)]">
              <p className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">Scope</p>
              <p className="mt-0.5 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-primary-light)]">{lastAnalysis.scopeIncreasePercent}%</p>
            </div>
            <div className="rounded-lg bg-white border border-[var(--border-primary)] px-2 py-2 text-center dark:bg-[var(--bg-section)] dark:border-[var(--border-secondary)]">
              <p className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">Hours</p>
              <p className="mt-0.5 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-primary-light)]">{lastAnalysis.additionalHours}h</p>
            </div>
            <div className="rounded-lg bg-white border border-[var(--border-primary)] px-2 py-2 text-center dark:bg-[var(--bg-section)] dark:border-[var(--border-secondary)]">
              <p className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">Delay</p>
              <p className="mt-0.5 text-sm font-bold text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]">{lastAnalysis.delayWeeks}w</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">
            Run {formatRelativeDate(lastAnalysis.createdAt)}
          </p>
        </div>
      ) : (
        <div className="mx-3 sm:mx-6 mb-3 sm:mb-4 rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-section)]/50 px-3 sm:px-4 py-2 sm:py-3 text-center dark:border-[var(--border-secondary)] dark:bg-[var(--bg-section)]/50">
          <p className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">No analysis run yet</p>
        </div>
      )}

      {/* Action buttons */}
      <div className={`mt-auto flex gap-2 border-t border-[var(--border-primary)] ${SPACING.card.compactPadding} dark:border-gray-700`}>
        <button
          onClick={handleRun}
          className={`flex flex-1 items-center justify-center gap-2 ${BORDER_RADIUS.button} bg-[var(--color-primary)] py-2.5 ${TYPOGRAPHY.body} font-semibold text-white ${SHADOW.card} ${TRANSITION} hover:bg-[var(--color-primary-hover)] active:scale-[0.98]`}
        >
          <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {lastAnalysis ? 'Re-run Analysis' : 'Run AI Analysis'}
        </button>

        {lastAnalysis && (
          <Link
            to={`/reports/${project.id}`}
            className={`flex items-center justify-center gap-1.5 ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-semibold text-[var(--text-secondary)] ${SHADOW.card} ${TRANSITION} hover:bg-[var(--bg-section)] active:scale-[0.98] dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)] dark:text-gray-200 dark:hover:bg-[var(--bg-hover)]`}
            title="View full report"
          >
            <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col dark:bg-gray-900">
  <div className={`w-full ${SPACING.page.padding} pt-6 sm:pt-10 pb-4 overflow-x-hidden`}>

<div className="sticky top-0 z-30 bg-[var(--bg-page)] py-3 sm:py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 border-b border-[var(--border-primary)] dark:bg-gray-900 dark:border-gray-700 -mx-4 sm:mx-0 px-4 sm:px-0">
  
  {/* LEFT SIDE */}
  <div>
    <h1 className={`${TYPOGRAPHY.pageTitle} text-[var(--text-primary)] dark:text-gray-100`}>
      AI Impact Analysis
    </h1>
    <p className="mt-1 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
      {projects.length === 0
        ? 'Create a project to get started'
        : analyzedCount > 0
          ? `${analyzedCount} of ${projects.length} project${projects.length === 1 ? '' : 's'} analysed`
          : `${projects.length} project${projects.length === 1 ? '' : 's'} — no analysis run yet`}
    </p>
  </div>

  {/* RIGHT SIDE — SAME FILTER UI */}
  <div className="flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">

    {/* SEARCH (slightly wider + left spacing fix) */}
    <div className="relative w-full sm:flex-none sm:w-[200px] md:w-[240px]">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)] dark:text-[var(--text-soft)]"
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
        className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-white py-2.5 pl-9 pr-4 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] ${SHADOW.card} focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-[var(--border-secondary)] dark:bg-[var(--bg-input)] dark:text-white dark:placeholder-[var(--text-subtle)]`}
      />
    </div>

    {/* STATUS */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value as any)}
      className={`w-full sm:w-auto ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-white px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] ${SHADOW.card} focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-[var(--border-secondary)] dark:bg-[var(--bg-input)] dark:text-gray-200`}
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
      className={`w-full sm:w-auto ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-white px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] ${SHADOW.card} focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-[var(--border-secondary)] dark:bg-[var(--bg-input)] dark:text-gray-200`}
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
        className={`w-full sm:w-auto ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-soft)] ${SHADOW.card} ${TRANSITION} hover:bg-[var(--bg-section)] hover:text-[var(--text-secondary)] dark:border-gray-600 dark:bg-gray-700 dark:text-[var(--text-subtle)] dark:hover:bg-gray-600 dark:hover:text-gray-200`}
      >
        Clear
      </button>
    )}
  </div>
</div>
          
        {/* How it works */}
       <div
  className={`${SPACING.section.marginTop} ${BORDER_RADIUS.card}
  border border-[var(--border-primary)]
  bg-[var(--bg-card)]
  p-4 sm:p-6
  dark:border-gray-700
  dark:bg-gray-800`}
>
 <p
  className={`mb-3 sm:mb-5 ${TYPOGRAPHY.caption}
  font-semibold uppercase tracking-wide
  text-[var(--color-primary)]
  dark:text-[var(--color-primary)]`}
>
    How it works
  </p>

  <div className={`grid gap-3 sm:gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
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
        <div className={SPACING.section.marginTop}>

          {/* Loading skeletons */}
          {loading && (
            <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* No projects */}
          {!loading && projects.length === 0 && (
            <EmptyState
              title="No projects to analyse yet"
              description="Create a project, add features in the Scope Builder, then come back here to run an AI analysis."
              action={{
                label: 'Create a Project',
                onClick: () => navigate('/projects/new'),
              }}
              size="lg"
            />
          )}

          {/* Projects grid */}
          {!loading && projects.length > 0 && (
            <>
              <p className={`mb-3 sm:mb-4 ${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
                {analyzedCount > 0
                  ? `${analyzedCount} project${analyzedCount === 1 ? '' : 's'} with past results — hover "Report" to revisit, or re-run the analysis`
                  : 'Click "Run AI Analysis" on any project to get started'}
              </p>
              <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
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
