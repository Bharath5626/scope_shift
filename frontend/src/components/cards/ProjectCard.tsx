import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../../utils/constants'
import { useProjects } from '../../context/ProjectContext'

interface ProjectCardProps {
  project: Project
}

function getProgressColor(status: Project['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'active':
      return 'bg-indigo-500'
    case 'at_risk':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

function getProgressPercentage(project: Project): number {
  switch (project.status) {
    case 'completed':
      return 100
    case 'active':
      return 60
    case 'at_risk':
      return 40
    default:
      return 10
  }
}

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  at_risk: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { setActiveProjectId } = useProjects()
  const progress = getProgressPercentage(project)
  const progressColor = getProgressColor(project.status)

  return (
    <Link
      onClick={() => setActiveProjectId(project.id)}
      to={`/scope-builder?project=${project.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:shadow-gray-900/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
            {project.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className={`h-full rounded-full ${progressColor} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {PROJECT_TYPE_LABELS[project.type]}
        </span>

        <span className="text-xs text-gray-400 dark:text-gray-500">
         Created{" "}
  {new Date(project.createdAt).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}
        </span>
      </div>
    </Link>
  )
}