import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'
import type { Project, ProjectStatus, ProjectType } from '../types'

const ALL = 'all'

const statusStyles: Record<Project['status'], string> = {
  draft:     'bg-gray-100 text-gray-600',
  active:    'bg-green-50 text-green-700',
  completed: 'bg-indigo-50 text-indigo-700',
  at_risk:   'bg-red-50 text-red-700',
}

function DeleteModal({
  project,
  onConfirm,
  onCancel,
  deleting,
}: {
  project: Project
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Delete Project?</h2>
        <p className="mt-2 text-sm text-gray-500">
          You're about to permanently delete{' '}
          <span className="font-semibold text-gray-800">"{project.name}"</span>.
          This will remove all its features, analyses, and reports.
        </p>
        <p className="mt-1 text-xs font-medium text-red-500">This action cannot be undone.</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {deleting ? 'Deleting…' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  onDeleteClick,
}: {
  project: Project
  onDeleteClick: (project: Project) => void
}) {
  const { setActiveProjectId } = useProjects()
  const navigate = useNavigate()

  const handleOpen = () => {
    setActiveProjectId(project.id)
    navigate(`/scope-builder?project=${project.id}`)
  }

  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">

      {/* Delete button — appears on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteClick(project) }}
        title="Delete project"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Clickable card body */}
      <button onClick={handleOpen} className="w-full p-6 text-left flex-1">
        <div className="flex items-start justify-between gap-4 pr-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-indigo-600">
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

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs font-medium text-gray-500">
            {PROJECT_TYPE_LABELS[project.type]}
          </span>
         <span className="text-xs text-gray-400">
  Created{" "}
  {new Date(project.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
  {" • By "}
  {project.createdBy.name}
</span>
        </div>
      </button>
    </div>
  )
}

export function ProjectHistoryPage() {
  const { projects, loading, deleteProject } = useProjects()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | typeof ALL>(ALL)
  const [typeFilter, setTypeFilter] = useState<ProjectType | typeof ALL>(ALL)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        search.trim() === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === ALL || p.status === statusFilter
      const matchesType = typeFilter === ALL || p.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [projects, search, statusFilter, typeFilter])

  const hasFilters = search !== '' || statusFilter !== ALL || typeFilter !== ALL

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <div className="sticky top-0 z-30">
    <div className="mx-auto max-w-6xl px-8 bg-gray-50">
       <div className="py-6 border-b border-gray-200">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Project History</h1>
              <p className="mt-1 text-sm text-gray-500">
                {projects.length === 0
                  ? 'No projects yet'
                  : `${projects.length} project${projects.length === 1 ? '' : 's'} total`}
              </p>
            </div>
            {/* <Link
              to="/projects/new"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + New Project
            </Link> */}
          </div>

          {/* Filters */}
          {projects.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | typeof ALL)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value={ALL}>All Statuses</option>
                {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ProjectType | typeof ALL)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value={ALL}>All Types</option>
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter(ALL); setTypeFilter(ALL) }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          
          )}
       </div>
        
        

          {/* Content */}
          <div className="mt-8">

            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded bg-gray-200" />
                        <div className="h-3 w-full rounded bg-gray-100" />
                        <div className="h-3 w-4/5 rounded bg-gray-100" />
                      </div>
                      <div className="h-6 w-16 rounded-full bg-gray-100" />
                    </div>
                    <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                      <div className="h-3 w-24 rounded bg-gray-100" />
                      <div className="h-3 w-20 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && projects.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No project history yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Projects you create will appear here as clickable cards
                </p>
                <Link
                  to="/projects/new"
                  className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Create your first project
                </Link>
              </div>
            )}

            {!loading && projects.length > 0 && filtered.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900">No projects match your filters</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => { setSearch(''); setStatusFilter(ALL); setTypeFilter(ALL) }}
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <>
                <p className="mb-4 text-xs text-gray-400">
                  Showing {filtered.length} of {projects.length} project{projects.length === 1 ? '' : 's'} — hover a card to delete it
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDeleteClick={setDeleteTarget}
                    />
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
