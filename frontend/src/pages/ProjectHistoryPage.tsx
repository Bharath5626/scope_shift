import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { ProjectCard } from '../components/cards/ProjectCard'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../utils/constants'
import type { ProjectStatus, ProjectType } from '../types'

const ALL = 'all'

export function ProjectHistoryPage() {
  const { projects, loading } = useProjects()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | typeof ALL>(ALL)
  const [typeFilter, setTypeFilter] = useState<ProjectType | typeof ALL>(ALL)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-8 py-10">

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
          <Link
            to="/projects/new"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            New Project
          </Link>
        </div>

        {/* Filters */}
        {projects.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Search */}
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
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | typeof ALL)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value={ALL}>All Statuses</option>
              {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ProjectType | typeof ALL)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value={ALL}>All Types</option>
              {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setStatusFilter(ALL); setTypeFilter(ALL) }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="mt-8">

          {/* Loading */}
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

          {/* Empty — no projects at all */}
          {!loading && projects.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                🕐
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No project history yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Projects you create will appear here as clickable cards
              </p>
              <Link
                to="/projects/new"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Create your first project
              </Link>
            </div>
          )}

          {/* Empty — filters returned nothing */}
          {!loading && projects.length > 0 && filtered.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl">
                🔍
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

          {/* Project grid */}
          {!loading && filtered.length > 0 && (
            <>
              <p className="mb-4 text-xs text-gray-400">
                Showing {filtered.length} of {projects.length} project{projects.length === 1 ? '' : 's'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
