import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../utils/constants'
import { EmptyState } from '../components/EmptyState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION, ICON_SIZE } from '../utils/designSystem'
import type { Project } from '../types'

const statusStyles: Record<Project['status'], string> = {
  draft: 'bg-[var(--bg-section)] text-[var(--text-muted)] dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-50 text-[var(--color-success)] dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-indigo-50 text-[var(--color-info)] dark:bg-indigo-900/30 dark:text-indigo-400',
  at_risk: 'bg-red-50 text-[var(--color-danger)] dark:bg-red-900/30 dark:text-red-400',
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getDaysLeft(deadline: string | null) {
  if (!deadline) return null
  const today = new Date()
  const dueDate = new Date(deadline)
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function ProjectDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project') ?? ''
  const { getProject, getProjectFeatures, getLatestAnalysis, deleteProject, loading } = useProjects()
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const project = getProject(projectId)
  const features = getProjectFeatures(projectId)
  const latestAnalysis = getLatestAnalysis(projectId)

  useEffect(() => {
    if (!projectId) {
      navigate('/history')
    }
  }, [projectId, navigate])

  const handleDelete = async () => {
    if (!projectId) return
    setDeleting(true)
    try {
      await deleteProject(projectId)
      navigate('/history')
    } catch (err) {
      console.error('Failed to delete project:', err)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] p-8 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton className="h-12 w-64 mb-6" />
          <LoadingSkeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-8 dark:bg-gray-900">
        <EmptyState
          title="Project not found"
          description="The project you're looking for doesn't exist or has been deleted."
          action={{
            label: 'Back to Projects',
            onClick: () => navigate('/history'),
          }}
          size="md"
        />
      </div>
    )
  }

  const daysLeft = getDaysLeft(project.deadline)
  const newFeatures = features.filter((f) => f.type === 'new')

  return (
    <div className={`min-h-screen bg-[var(--bg-page)] ${SPACING.page.padding} dark:bg-gray-900`}>
      <div className={`max-w-6xl mx-auto space-y-6 ${SPACING.section.gap}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/history')}
              className={`mb-4 flex items-center gap-2 ${TYPOGRAPHY.body} text-[var(--text-soft)] hover:text-[var(--text-secondary)] dark:text-[var(--text-subtle)] dark:hover:text-gray-200`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </button>
            <h1 className={`${TYPOGRAPHY.pageTitle} text-[var(--text-primary)] dark:text-gray-100`}>{project.name}</h1>
            <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>{project.description || 'No description'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/scope-builder?project=${project.id}`)}
              className={`inline-flex items-center gap-2 ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] ${SHADOW.card} ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Scope
            </button>
            <button
              onClick={() => navigate(`/analyzing?project=${project.id}`)}
              className={`inline-flex items-center gap-2 ${BORDER_RADIUS.button} bg-[var(--color-primary)] ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-white ${SHADOW.card} ${TRANSITION} hover:bg-[var(--color-primary-hover)]`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Run Analysis
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`inline-flex items-center gap-2 ${BORDER_RADIUS.button} border border-red-200 bg-red-50 ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-red-700 ${SHADOW.card} ${TRANSITION} hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${SPACING.section.gap}`}>
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
            <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Status</p>
            <p className={`mt-1 text-sm font-semibold ${statusStyles[project.status]}`}>
              {PROJECT_STATUS_LABELS[project.status]}
            </p>
          </div>
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
            <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Type</p>
            <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold text-[var(--text-primary)] dark:text-gray-100`}>
              {PROJECT_TYPE_LABELS[project.type]}
            </p>
          </div>
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
            <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Features</p>
            <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold text-[var(--text-primary)] dark:text-gray-100`}>
              {features.length} total ({newFeatures.length} new)
            </p>
          </div>
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
            <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Deadline</p>
            <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold text-[var(--text-primary)] dark:text-gray-100`}>
              {daysLeft !== null ? (
                <span className={daysLeft <= 7 ? 'text-[var(--color-danger)]' : daysLeft <= 14 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}>
                  {daysLeft} days left
                </span>
              ) : (
                'Not set'
              )}
            </p>
          </div>
        </div>

        {/* Project Details */}
        <div className={`grid gap-6 lg:grid-cols-2 ${SPACING.section.gap}`}>
          {/* Information */}
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
            <h2 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>Project Information</h2>
            <div className={`mt-4 space-y-4 ${SPACING.section.gap}`}>
              <div>
                <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Created</p>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-primary)] dark:text-gray-100`}>{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Start Date</p>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-primary)] dark:text-gray-100`}>{formatDate(null)}</p>
              </div>
              <div>
                <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Deadline</p>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-primary)] dark:text-gray-100`}>{formatDate(project.deadline)}</p>
              </div>
              <div>
                <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Created By</p>
                <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-primary)] dark:text-gray-100`}>{project.createdBy?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
            <h2 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>Latest Analysis</h2>
            {latestAnalysis ? (
              <div className={`mt-4 space-y-4 ${SPACING.section.gap}`}>
                <div className={`grid grid-cols-2 gap-4 ${SPACING.section.gap}`}>
                  <div>
                    <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Scope Increase</p>
                    <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold text-indigo-600`}>{latestAnalysis.scopeIncreasePercent}%</p>
                  </div>
                  <div>
                    <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Additional Hours</p>
                    <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold text-indigo-600`}>{latestAnalysis.additionalHours}h</p>
                  </div>
                  <div>
                    <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Delay</p>
                    <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold text-indigo-600`}>{latestAnalysis.delayWeeks}w</p>
                  </div>
                  <div>
                    <p className={`${TYPOGRAPHY.caption} font-medium text-[var(--text-soft)] uppercase tracking-wide`}>Risk Level</p>
                    <p className={`mt-1 ${TYPOGRAPHY.body} font-semibold ${
                      latestAnalysis.riskLevel === 'low' ? 'text-[var(--color-success)]' :
                      latestAnalysis.riskLevel === 'medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
                    }`}>
                      {latestAnalysis.riskLevel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/reports/${project.id}`)}
                  className={`w-full mt-2 ${BORDER_RADIUS.small} border border-indigo-200 bg-indigo-50 ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-indigo-700 ${TRANSITION} hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30`}
                >
                  View Full Report
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className={`${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>No analysis has been run yet.</p>
                <button
                  onClick={() => navigate(`/analyzing?project=${project.id}`)}
                  className={`mt-3 inline-flex items-center gap-2 ${BORDER_RADIUS.small} bg-[var(--color-primary)] ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-white hover:bg-[var(--color-primary-hover)]`}
                >
                  Run First Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800`}>
          <h2 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>Quick Actions</h2>
          <div className={`mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${SPACING.section.gap}`}>
            <button
              onClick={() => navigate(`/scope-builder?project=${project.id}`)}
              className={`flex items-center gap-3 ${BORDER_RADIUS.small} border border-[var(--border-primary)] bg-[var(--bg-section)] p-3 text-left ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600`}
            >
              <div className={`flex ${ICON_SIZE.card} items-center justify-center ${BORDER_RADIUS.small} bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400`}>
                <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">Edit Scope</p>
                <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Manage features</p>
              </div>
            </button>
            <button
              onClick={() => navigate(`/analyzing?project=${project.id}`)}
              className="flex items-center gap-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-section)] p-3 text-left transition hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className={`${TYPOGRAPHY.body} font-medium text-[var(--text-primary)] dark:text-gray-100`}>Run Analysis</p>
                <p className={`${TYPOGRAPHY.caption} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>AI scope analysis</p>
              </div>
            </button>
            {latestAnalysis && (
              <button
                onClick={() => navigate(`/reports/${project.id}`)}
                className={`flex items-center gap-3 ${BORDER_RADIUS.small} border border-[var(--border-primary)] bg-[var(--bg-section)] p-3 text-left ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600`}
              >
                <div className={`flex ${ICON_SIZE.card} items-center justify-center ${BORDER_RADIUS.small} bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400`}>
                  <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`${TYPOGRAPHY.body} font-medium text-[var(--text-primary)] dark:text-gray-100`}>View Report</p>
                  <p className={`${TYPOGRAPHY.caption} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>Analysis details</p>
                </div>
              </button>
            )}
            <button
              onClick={() => navigate(`/history`)}
              className={`flex items-center gap-3 ${BORDER_RADIUS.small} border border-[var(--border-primary)] bg-[var(--bg-section)] p-3 text-left ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600`}
            >
              <div className={`flex ${ICON_SIZE.card} items-center justify-center ${BORDER_RADIUS.small} bg-amber-100 text-[var(--color-warning)] dark:bg-amber-900/30 dark:text-amber-400`}>
                <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`${TYPOGRAPHY.body} font-medium text-[var(--text-primary)] dark:text-gray-100`}>All Projects</p>
                <p className={`${TYPOGRAPHY.caption} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>View history</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`${BORDER_RADIUS.modal} border border-[var(--border-primary)] bg-white ${SPACING.card.padding} shadow-lg dark:border-gray-700 dark:bg-gray-800 max-w-md w-full mx-auto`}>
            <h3 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>Delete Project</h3>
            <p className={`mt-2 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
              Are you sure you want to delete "{project.name}"? This action cannot be undone and will delete all associated features and analysis data.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className={`${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`${BORDER_RADIUS.button} bg-[var(--color-danger)] ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-white hover:bg-red-700 disabled:opacity-50`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
