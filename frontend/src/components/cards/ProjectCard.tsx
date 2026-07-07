import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../../utils/constants'
import { useProjects } from '../../context/ProjectContext'

interface ProjectCardProps {
  project: Project
}

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-[var(--color-primary-50)] text-[var(--color-primary-dark)] dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)]',
  at_risk: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] dark:bg-[var(--color-danger)]/20 dark:text-[var(--color-danger-light)]',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { setActiveProjectId } = useProjects()

  return (
    <Link
      onClick={() => setActiveProjectId(project.id)}
      to={`/scope-builder?project=${project.id}`}
      className="group block rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)] dark:hover:border-[var(--color-primary-light)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-primary)] dark:text-[var(--text-primary)] dark:group-hover:text-[var(--color-primary-light)]">
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
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-primary)] pt-4 dark:border-[var(--border-secondary)]">
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