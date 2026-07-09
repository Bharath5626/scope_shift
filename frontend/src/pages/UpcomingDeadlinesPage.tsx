import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../utils/constants'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION } from '../utils/designSystem'
import type { Project } from '../types'

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-[var(--bg-section)] text-[var(--text-muted)] dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-50 text-[var(--color-success)] dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-[var(--color-primary)]/10 text-[var(--color-info)] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]',
  at_risk: 'bg-red-50 text-[var(--color-danger)] dark:bg-red-900/30 dark:text-red-400',
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
      className={`group w-full ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-[var(--bg-surface)] ${SPACING.card.padding} text-left ${SHADOW.card} ${TRANSITION} hover:-translate-y-0.5 hover:border-[var(--color-primary)] ${SHADOW.cardHover} dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[var(--color-primary)] dark:hover:shadow-gray-900/30`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate ${TYPOGRAPHY.cardTitle} text-[var(--text-primary)] transition group-hover:text-[var(--color-primary)] dark:text-gray-100 dark:group-hover:text-[var(--color-primary)]`}>
            {project.name}
          </h3>

          {project.deadline && (
            <p className="mt-1 text-xs font-medium text-[var(--color-danger)] dark:text-red-400">
              Deadline:{' '}
              {new Date(project.deadline).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}

          <p className="mt-2 line-clamp-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
            {project.description || (
              <span className="italic text-gray-300 dark:text-[var(--text-soft)]">
                No description
              </span>
            )}
          </p>
        </div>

        <span
          className={`shrink-0 ${BORDER_RADIUS.tag} px-2.5 py-1 ${TYPOGRAPHY.caption} font-medium ${
            statusStyles[project.status]
          }`}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>

      <div className={`mt-4 flex items-center justify-between border-t border-[var(--border-primary)] pt-4 dark:border-gray-700`}>
        <span className="text-xs font-medium text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
          {PROJECT_TYPE_LABELS[project.type]}
        </span>

        <span
          className={`${BORDER_RADIUS.tag} px-3 py-1 ${TYPOGRAPHY.caption} font-medium ${
            daysLeft <= 3
              ? 'bg-red-50 text-[var(--color-danger)] dark:bg-red-900/30 dark:text-red-400'
              : daysLeft <= 7
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
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
    <div className={`w-full ${SPACING.page.padding} bg-[var(--bg-page)] min-h-screen dark:bg-gray-900`}>
      <div className={`${SPACING.page.headerPadding} border-b border-[var(--border-primary)] dark:border-gray-700`}>
        <h1 className={`${TYPOGRAPHY.pageTitle} text-[var(--text-primary)] dark:text-gray-100`}>
          Upcoming Deadlines
        </h1>

        <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
          Projects sorted by nearest deadline
        </p>
      </div>

      <div className={SPACING.section.marginTop}>
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && upcomingProjects.length === 0 && (
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-[var(--bg-surface)] p-14 text-center ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>
            <h3 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>
              No upcoming deadlines
            </h3>

            <p className={`mt-2 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
              All projects are completed or no deadlines have been assigned.
            </p>
          </div>
        )}

        {!loading && upcomingProjects.length > 0 && (
          <>
            <p className={`mb-4 ${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
              Showing {upcomingProjects.length} upcoming projects
            </p>

            <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
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