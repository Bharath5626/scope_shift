import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../../utils/constants'
import { useProjects } from '../../context/ProjectContext'

interface ProjectCardProps {
  project: Project
}

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-[var(--bg-section)] text-[var(--text-muted)] dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  at_risk: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { setActiveProjectId } = useProjects()

  return (
    <Link
      onClick={() => setActiveProjectId(project.id)}
      to={`/scope-builder?project=${project.id}`}
      className="group block rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:shadow-gray-900/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[var(--text-primary)] transition group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
            {project.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
            {project.description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-primary)] pt-4 dark:border-gray-700">
        <span className="text-xs font-medium text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
          {PROJECT_TYPE_LABELS[project.type]}
        </span>

        <span className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">
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