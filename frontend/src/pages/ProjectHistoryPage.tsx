import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../utils/constants'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton } from '../components/LoadingSkeleton'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION, ICON_SIZE } from '../utils/designSystem'
import { api } from '../services/api'
import type { Project, ProjectStatus, ProjectType } from '../types'

const ALL = 'all'

interface AuditLog {
  id: string
  projectId: string
  action: string
  description: string | null
  changes: Record<string, { from: any; to: any }> | null
  userId: string | null
  features: any[] | null
  createdAt: string
  user?: {
    id: string
    name: string
  }
}

const statusStyles: Record<Project['status'], string> = {
  draft:     'bg-gray-100 text-[var(--text-muted)] dark:bg-gray-700 dark:text-gray-300',
  active:    'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  at_risk:   'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function ProjectDetailsModal({
  project,
  onClose,
  onReanalyze,
}: {
  project: Project
  onClose: () => void
  onReanalyze: () => void
}) {
  const { user } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'logs'>('details')
  const [showFeaturesForLog, setShowFeaturesForLog] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const logs = await api.get<AuditLog[]>(`/projects/${project.id}/audit-logs`)
        setAuditLogs(logs)
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuditLogs()
  }, [project.id])

  const getUserName = (log: AuditLog) => {
    if (!log.user) return 'Unknown'
    if (user?.id === log.user.id) return 'You'
    return log.user.name
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Project Created'
      case 'updated':
        return 'Project Modified'
      case 'analysis_created':
        return 'Analysis Completed'
      case 'analysis_retrieved':
        return 'Analysis Retrieved'
      case 'feature_added':
        return 'Feature Added'
      case 'features_generated':
        return 'Features Generated'
      case 'features_modified':
        return 'Features Modified'
      default:
        return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800 dark:shadow-gray-900/30 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-primary)] p-6 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-gray-100">{project.name}</h2>
            <p className="mt-1 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">{PROJECT_TYPE_LABELS[project.type]}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-subtle)] hover:bg-section hover:text-[var(--text-muted)] dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)] dark:border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'details'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] dark:text-[var(--text-subtle)] dark:hover:text-gray-300'
            }`}
          >
            Project Details
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'logs'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] dark:text-[var(--text-subtle)] dark:hover:text-gray-300'
            }`}
          >
            Logs ({auditLogs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Project Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Project Name</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)] dark:text-gray-100">{project.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Description</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.description || 'No description provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Type</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{PROJECT_TYPE_LABELS[project.type]}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Status</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)] capitalize dark:text-gray-300">{project.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Technical Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Project Type</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.projectType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Team Size</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.teamSize ? `${project.teamSize} members` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Methodology</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.methodology || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Working Hours</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.workingHours ? `${project.workingHours} hrs/day` : 'Not specified'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Tech Stack</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.techStack || 'Not specified'}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Start Date</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Deadline</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">No logs available</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-[var(--border-primary)] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                    <div className="flex items-start justify-between p-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">
                          {getActionLabel(log.action)}
                        </p>
                        <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                          {new Date(log.createdAt).toLocaleString()} • By {getUserName(log)}
                        </p>
                        {log.description && (
                          <p className="mt-1 text-xs text-[var(--text-muted)] dark:text-[var(--text-subtle)]">{log.description}</p>
                        )}
                        {log.features && (
                          <div className="mt-3">
                            <button
                              onClick={() => setShowFeaturesForLog(log.id)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Show Features {log.features.length > 0 ? `(${log.features.length})` : ''}
                            </button>
                            {showFeaturesForLog === log.id && (
                              <div className="mt-2 space-y-2">
                                {!log.features || log.features.length === 0 ? (
                                  <p className="text-xs text-[var(--text-soft)]">No features available</p>
                                ) : (
                                  log.features.map((feature: any, idx: number) => (
                                    <div key={idx} className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                      <p className="text-xs font-medium text-[var(--text-primary)] dark:text-gray-100">{feature.title}</p>
                                      {feature.description && (
                                        <p className="mt-0.5 text-xs text-[var(--text-muted)] dark:text-[var(--text-subtle)]">{feature.description}</p>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[var(--border-primary)] p-6 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border-primary)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={onReanalyze}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
          >
            Re-analyze
          </button>
        </div>
      </div>
    </div>
  )
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
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 text-center dark:bg-gray-800 dark:shadow-gray-900/30">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
          <svg className="h-7 w-7 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">Delete Project?</h2>
        <p className="mt-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
          You're about to permanently delete{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">"{project.name}"</span>.
          This will remove all its features, analyses, and reports.
        </p>
        <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">This action cannot be undone.</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-[var(--border-primary)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
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
  onViewDetails,
}: {
  project: Project
  onDeleteClick: (project: Project) => void
  onViewDetails: (project: Project) => void
}) {
  const { user } = useAuth()

  const createdBy = project.createdBy && user?.id === project.createdBy.id ? 'you' : project.createdBy?.name || 'Unknown'

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[var(--border-primary)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:shadow-gray-900/30">

      {/* Delete button — appears on hover */}
      <button
  onClick={(e) => {
    e.stopPropagation()
    onDeleteClick(project)
  }}
  title="Delete project"
  className="
  absolute right-3 top-3 z-10
  flex h-8 w-8 items-center justify-center
  rounded-lg text-gray-300
  opacity-0 transition-all duration-150
  hover:bg-red-50 hover:text-red-500
  group-hover:opacity-100
  cursor-pointer
  dark:hover:bg-red-900/30 dark:hover:text-red-400
"
>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Clickable card body */}
      <button onClick={() => onViewDetails(project)} className="w-full p-6 text-left flex-1">
        <div className="flex items-start gap-4">
          {/* Project Logo */}
          {project.logo ? (
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700">
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4 pr-12">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-[var(--text-primary)] transition group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                  {project.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                  {project.description || <span className="italic text-gray-300 dark:text-[var(--text-soft)]">No description</span>}
                </p>
              </div>
              <span className={`shrink-0 ${BORDER_RADIUS.tag} px-2.5 py-1 ${TYPOGRAPHY.caption} font-medium ${statusStyles[project.status]}`}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>

            <div className={`mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700`}>
              <span className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
                {PROJECT_TYPE_LABELS[project.type]}
              </span>
             <span className={`${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
  Created{" "}
  {new Date(project.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
  {" • By "}
  {createdBy}
</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}

export function ProjectHistoryPage() {
  const navigate = useNavigate()
  const { projects, loading, deleteProject, setActiveProjectId } = useProjects()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | typeof ALL>(ALL)
  const [typeFilter, setTypeFilter] = useState<ProjectType | typeof ALL>(ALL)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [detailsTarget, setDetailsTarget] = useState<Project | null>(null)

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

  const handleReanalyze = (project: Project) => {
    setActiveProjectId(project.id)
    setDetailsTarget(null)
    navigate(`/scope-builder?project=${project.id}`)
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

      {detailsTarget && (
        <ProjectDetailsModal
          project={detailsTarget}
          onClose={() => setDetailsTarget(null)}
          onReanalyze={() => handleReanalyze(detailsTarget)}
        />
      )}

      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-900">
        <div className={`w-full ${SPACING.page.padding}`}>
          <div className={`${SPACING.page.headerPadding} border-b border-[var(--border-primary)] dark:border-gray-700`}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className={`${TYPOGRAPHY.pageTitle} text-[var(--text-primary)] dark:text-gray-100`}>Project History</h1>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
                  {projects.length === 0
                    ? 'No projects yet'
                    : `${projects.length} project${projects.length === 1 ? '' : 's'} total`}
                </p>
              </div>
              {/* <Link
                to="/projects/new"
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
              >
                + New Project
              </Link> */}
            </div>

            {/* Filters */}
            {projects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-subtle)] dark:text-[var(--text-soft)]"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-white py-2.5 pl-9 pr-4 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] ${SHADOW.card} focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-[var(--text-subtle)] dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | typeof ALL)}
                  className={`${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-white px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] ${SHADOW.card} focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
                >
                  <option value={ALL}>All Statuses</option>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ProjectType | typeof ALL)}
                  className={`${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-white px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] ${SHADOW.card} focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
                >
                  <option value={ALL}>All Types</option>
                  {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                {hasFilters && (
                  <button
                    onClick={() => { setSearch(''); setStatusFilter(ALL); setTypeFilter(ALL) }}
                    className={`${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white px-3 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-soft)] ${SHADOW.card} ${TRANSITION} hover:bg-gray-50 hover:text-[var(--text-secondary)] dark:border-gray-600 dark:bg-gray-700 dark:text-[var(--text-subtle)] dark:hover:bg-gray-600 dark:hover:text-gray-200`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`w-full ${SPACING.page.padding} bg-gray-50 pb-8 dark:bg-gray-900`}>
        <div className={SPACING.section.marginTop}>

          {loading && (
            <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <EmptyState
              title="No project history yet"
              description="Projects you create will appear here as clickable cards with full history tracking."
              action={{
                label: 'Create your first project',
                onClick: () => navigate('/projects/new'),
              }}
              size="lg"
            />
          )}

          {!loading && projects.length > 0 && filtered.length === 0 && (
            <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white p-12 text-center ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>
              <div className={`mx-auto mb-3 flex ${ICON_SIZE.card} items-center justify-center ${BORDER_RADIUS.button} bg-gray-100 dark:bg-gray-700`}>
                <svg className={`${ICON_SIZE.button} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <h3 className={`${TYPOGRAPHY.cardTitle} text-[var(--text-primary)] dark:text-gray-100`}>No projects match your filters</h3>
              <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>Try adjusting your search or filter criteria</p>
              <button
                onClick={() => { setSearch(''); setStatusFilter(ALL); setTypeFilter(ALL) }}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <p className={`mb-4 ${TYPOGRAPHY.caption} text-[var(--text-subtle)] dark:text-[var(--text-soft)]`}>
                Showing {filtered.length} of {projects.length} project{projects.length === 1 ? '' : 's'} — hover a card to delete it
              </p>
              <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDeleteClick={setDeleteTarget}
                    onViewDetails={setDetailsTarget}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
