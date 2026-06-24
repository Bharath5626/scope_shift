import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../utils/constants'
import type { Project } from '../types'

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-indigo-50 text-indigo-700',
  at_risk: 'bg-red-50 text-red-700',
}

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { setActiveProjectId } = useProjects()

  const handleOpen = () => {
    setActiveProjectId(project.id)
    navigate(`/scope-builder?project=${project.id}`)
  }

  const daysLeft = project.deadline
    ? Math.ceil(
        (new Date(project.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <button
      onClick={handleOpen}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-indigo-600">
            {project.name}
          </h3>

          {project.deadline && (
            <p className="mt-1 text-xs font-medium text-red-500">
              Deadline:{' '}
              {new Date(project.deadline).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}

          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {project.description || (
              <span className="italic text-gray-300">
                No description
              </span>
            )}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            statusStyles[project.status]
          }`}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs font-medium text-gray-500">
          {PROJECT_TYPE_LABELS[project.type]}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            daysLeft <= 3
              ? 'bg-red-100 text-red-700'
              : daysLeft <= 7
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {daysLeft} days left
        </span>
      </div>
    </button>
  )
}

export function UpcomingDeadlinesPage() {
  const { projects, loading } = useProjects()

  const upcomingProjects = useMemo(() => {
    return [...projects]
      .filter(
        (p) =>
          p.deadline &&
          p.status !== 'completed'
      )
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() -
          new Date(b.deadline!).getTime()
      )
  }, [projects])

  return (
    <div className="w-full px-8 bg-gray-50 min-h-screen">
      <div className="py-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">
          Upcoming Deadlines
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Projects sorted by nearest deadline
        </p>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                  <div className="h-3 w-full rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && upcomingProjects.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              No upcoming deadlines
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              All projects are completed or no deadlines have been assigned.
            </p>
          </div>
        )}

        {!loading && upcomingProjects.length > 0 && (
          <>
            <p className="mb-4 text-xs text-gray-400">
              Showing {upcomingProjects.length} upcoming projects
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}