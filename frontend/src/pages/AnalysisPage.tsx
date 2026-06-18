import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'
import type { Project } from '../types'

const statusStyles: Record<Project['status'], string> = {
  draft:     'bg-gray-100 text-gray-600',
  active:    'bg-green-50 text-green-600',
  completed: 'bg-indigo-50 text-indigo-600',
  at_risk:   'bg-red-50 text-red-600',
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

function AnalysisProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { setActiveProjectId } = useProjects()

  const handleRun = () => {
    setActiveProjectId(project.id)
    navigate(`/analyzing?project=${project.id}`)
  }

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {project.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {project.description || <span className="italic text-gray-300">No description</span>}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
        <span className="font-medium text-gray-500">{PROJECT_TYPE_LABELS[project.type]}</span>
        <span>Updated {formatRelativeDate(project.updatedAt)}</span>
      </div>

      {/* CTA */}
      <button
        onClick={handleRun}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Run AI Analysis
      </button>
    </div>
  )
}

export function AnalysisPage() {
  const { projects, loading } = useProjects()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-8 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">AI Impact Analysis</h1>
            <p className="mt-1 text-sm text-gray-500">
              Select a project below to run an AI-powered scope analysis
            </p>
          </div>
          {projects.length > 0 && (
            <Link
              to="/projects/new"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              New Project
            </Link>
          )}
        </div>

        {/* How it works banner */}
        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-8 py-6">
          <p className="mb-5 text-sm font-semibold text-indigo-700 uppercase tracking-wide">How it works</p>
          <div className="grid gap-5 sm:grid-cols-3">
            <Step
              number={1}
              title="Define your scope"
              desc="Add original and new features to your project in the Scope Builder."
            />
            <Step
              number={2}
              title="Run AI analysis"
              desc="Gemini analyses effort, risk level, complexity, and timeline impact."
            />
            <Step
              number={3}
              title="Review results"
              desc="Get a breakdown of hours, delay, risk factors, and recommendations."
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-10">

          {/* Loading */}
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
                  <div className="h-px w-full bg-gray-100" />
                  <div className="h-9 w-full rounded-xl bg-gray-100" />
                </div>
              ))}
            </div>
          )}

          {/* No projects — empty state */}
          {!loading && projects.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No projects to analyse yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Create your first project, add features in the Scope Builder, then come back here to run an AI analysis.
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
                {projects.length} project{projects.length === 1 ? '' : 's'} available — click "Run AI Analysis" on any card
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <AnalysisProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
