import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../../utils/constants'
import { formatRelativeDate } from '../../utils/formatters'
import { useProjects } from '../../context/ProjectContext'

interface ProjectCardProps {
  project: Project
}

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-50 text-green-600',
  completed: 'bg-indigo-50 text-indigo-600',
  at_risk: 'bg-red-50 text-red-600',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { setActiveProjectId } = useProjects()

  return (
    <Link
      onClick={() => setActiveProjectId(project.id)}
      to={`/scope-builder?project=${project.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 transition group-hover:text-indigo-600">
            {project.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
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
        </span>
      </div>
    </Link>
  )
}