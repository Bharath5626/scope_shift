import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectContext'
import { api } from '../services/api'
import type { Feature, Analysis } from '../types'

function BackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

export function SharedProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const { projects } = useProjects()
  
  // Find project from the projects list
  const project = projects.find((p) => p.id === projectId)
  
  const [features, setFeatures] = useState<Feature[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId || !project) return

      try {
        setLoading(true)
        
        // Fetch features
        const featuresData = await api.get<Feature[]>(`/projects/${projectId}/features`)
        setFeatures(featuresData)
        
        // Fetch analyses
        const analysesData = await api.get<Analysis[]>(`/projects/${projectId}/analyses`)
        const latestAnalysis = analysesData.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
        setAnalysis(latestAnalysis || null)
        
        // Fetch users for display names
        const users = await api.get<any[]>('/users')
        setAvailableUsers(Array.isArray(users) ? users : ((users as any).data?.data || (users as any).data || []))
        
      } catch (err: any) {
        console.error('Failed to fetch project details:', err)
        setError(err?.message || 'Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [projectId, project])

  const getUserName = (userId: string) => {
    // Try to get name from project's projectMembers if available
    if (project && (project as any).projectMembers) {
      const member = (project as any).projectMembers.find((m: any) => m.userId === userId)
      if (member?.user?.name) return member.user.name
    }
    // Fallback to availableUsers
    const foundUser = availableUsers.find((u: any) => u.id === userId)
    return foundUser?.name || 'Unknown User'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="mt-4 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">
            {error || 'Project not found'}
          </h3>
          <Link
            to="/shared-projects"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
          >
            <BackIcon />
            Back to Shared Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/shared-projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <BackIcon />
            Back to Shared Projects
          </Link>
        </div>

        {/* Project Header */}
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xl">
                  {project.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-gray-100">
                    {project.name}
                  </h1>
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                    Created by {getUserName(project.createdBy.id)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[var(--text-primary)] dark:text-gray-300">
                {project.description}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                project.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : project.status === 'at_risk'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {project.status === 'active' ? 'Active' : project.status === 'at_risk' ? 'At Risk' : 'Draft'}
              </span>
              {project.deadline && (
                <span className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100 mb-4">
                Project Information
              </h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Project Type</p>
                  <p className="font-medium text-[var(--text-primary)] dark:text-gray-100">{project.projectType || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Team Size</p>
                  <p className="font-medium text-[var(--text-primary)] dark:text-gray-100">{project.teamSize || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Start Date</p>
                  <p className="font-medium text-[var(--text-primary)] dark:text-gray-100">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Methodology</p>
                  <p className="font-medium text-[var(--text-primary)] dark:text-gray-100">{project.methodology || 'Not specified'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Tech Stack</p>
                  <p className="font-medium text-[var(--text-primary)] dark:text-gray-100">{project.techStack || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100 mb-4">
                Features ({features.length})
              </h2>
              {features.length === 0 ? (
                <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                  No features added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-800/30 dark:bg-indigo-900/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-[var(--text-primary)] dark:text-gray-100">
                            {feature.title}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                            {feature.description}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          feature.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : feature.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {feature.priority}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <span className="bg-indigo-100 px-2 py-0.5 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                          {feature.category}
                        </span>
                        <span className="bg-indigo-100 px-2 py-0.5 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                          {feature.type === 'original' ? 'Original' : 'New'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analysis/Logs */}
            {analysis && (
              <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100 mb-4">
                  Latest Analysis
                </h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Scope Increase</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {analysis.scopeIncreasePercent}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Additional Hours</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {analysis.additionalHours}
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Delay (Weeks)</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {analysis.delayWeeks}
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Risk Level</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                      {analysis.riskLevel}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                  Analysis completed on {new Date(analysis.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Team */}
          <div className="space-y-6">
            {/* Team Members */}
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100 mb-4">
                Team Members ({project.teamMembers?.length || 0})
              </h2>
              <div className="space-y-3">
                {/* Creator */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {getUserName(project.createdBy.id).split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">
                      {getUserName(project.createdBy.id)}
                    </p>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Project Creator</p>
                  </div>
                </div>
                
                {/* Team Members */}
                {project.teamMembers?.map((memberId) => {
                  if (memberId === project.createdBy.id) return null
                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-700/50"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-medium">
                        {getUserName(memberId).split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">
                          {getUserName(memberId)}
                        </p>
                        {memberId === user?.id && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">You</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to={`/scope-builder?project=${project.id}`}
                  className="flex items-center justify-between w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700"
                >
                  <span>Open in Scope Builder</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to={`/analysis?project=${project.id}`}
                  className="flex items-center justify-between w-full rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-700 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                >
                  <span>Run Analysis</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
