import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectContext'
import { api } from '../services/api'
import { BORDER_RADIUS, SHADOW, TRANSITION, ICON_SIZE } from '../utils/designSystem'
import type { Project } from '../types'

function SharedIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
interface User {
  id: string
  name: string
  profileImage?: string
}
export function SharedProjectsPage() {
  const { user } = useAuth()
  const { projects } = useProjects()
  const [activeTab, setActiveTab] = useState<'shared-with-me' | 'shared-by-me'>('shared-with-me')


const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<any>('/users')

        const userList =
          Array.isArray(response)
            ? response
            : response?.users ??
              response?.data?.data ??
              response?.data ??
              []

        setUsers(userList)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

const getInitials = (name?: string) => {
  if (!name) return 'U'

  let initials = ''

  for (const part of name.split(' ')) {
    if (part) initials += part[0]
  }

  return initials.toUpperCase()
}

  const getUserProfileImage = (userId: string) => {
    const foundUser = users.find((u: User) => u.id === userId)
    return foundUser?.profileImage || null
  }

  // Filter projects where current user is in teamMembers (but not the creator)
  const sharedWithMe = projects.filter((project: Project) => {
    const isTeamMember = project.teamMembers?.includes(user?.id || '')
    const isNotCreator = project.createdBy?.id !== user?.id
    return isTeamMember && isNotCreator
  })

  // Filter projects created by current user that have team members
  const sharedByMe = projects.filter((project: Project) => {
    const isCreator = project.createdBy?.id === user?.id
    const hasTeamMembers = project.teamMembers && project.teamMembers.length > 0
    return isCreator && hasTeamMembers
  })

  const getUserName = (userId: string) => {
    const foundUser = users.find((u: User) => u.id === userId)
    return foundUser?.name || 'Unknown User'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900">
      {/* Page container */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] dark:text-gray-100">
              Shared Projects
            </h1>
            <p className="mt-1 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
              Collaborate on projects shared with you by team members
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`mt-6 flex gap-1 ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white p-1 ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>
          <button
            onClick={() => setActiveTab('shared-with-me')}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 ${BORDER_RADIUS.small} px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold ${TRANSITION} ${
              activeTab === 'shared-with-me'
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:text-[var(--text-subtle)] dark:hover:text-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-pressed={activeTab === 'shared-with-me'}
            role="tab"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="truncate">Shared with me</span>
            <span className={`shrink-0 ${BORDER_RADIUS.tag} px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold ${
              activeTab === 'shared-with-me' ? 'bg-white/20 text-white' : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:bg-[var(--color-primary)]/30 dark:text-[var(--color-primary)]'
            }`}>
              {sharedWithMe.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('shared-by-me')}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 ${BORDER_RADIUS.small} px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold ${TRANSITION} ${
              activeTab === 'shared-by-me'
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:text-[var(--text-subtle)] dark:hover:text-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-pressed={activeTab === 'shared-by-me'}
            role="tab"
          >
            <svg className={`${ICON_SIZE.button} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="truncate">Shared by me</span>
            <span className={`shrink-0 ${BORDER_RADIUS.tag} px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold ${
              activeTab === 'shared-by-me' ? 'bg-white/20 text-white' : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:bg-[var(--color-primary)]/30 dark:text-[var(--color-primary)]'
            }`}>
              {sharedByMe.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 sm:mt-10">
          {activeTab === 'shared-with-me' ? (
            /* Shared with me tab */
            <>
              {sharedWithMe.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-8 sm:p-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-section)] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]">
                    <SharedIcon />
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">
                    No shared projects
                  </h3>

                  <p className="mt-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                    Projects shared with you will appear here
                  </p>
                </div>
              ) : (
                /* Grid */
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {sharedWithMe.map((project) => (
                    <div
                      key={project.id}
                      className="group rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[var(--color-primary)] dark:hover:shadow-gray-900/30"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        {/* Project Logo */}
                        <div className="shrink-0">
                          {project.logo ? (
                            <img
                              src={project.logo}
                              alt={project.name}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                              {getInitials(project.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--color-primary)] dark:text-gray-100 dark:group-hover:text-[var(--color-primary)]">
                            {project.name}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      {/* Shared by info */}
                      <div className="mt-4 flex items-center gap-2 text-xs">
                        {getUserProfileImage(project.createdBy?.id) ? (
                          <img
                            src={getUserProfileImage(project.createdBy?.id) ?? undefined}
                            alt={getUserName(project.createdBy?.id) ?? ''}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-white font-medium">
                            {getInitials(getUserName(project.createdBy?.id))}
                          </div>
                        )}
                        <span className="text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                          Shared by <span className="font-medium text-[var(--text-primary)] dark:text-gray-200">{getUserName(project.createdBy?.id)}</span>
                        </span>
                      </div>

                      {/* Status and deadline */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : project.status === 'at_risk'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {project.status === 'active' ? 'Active' : project.status === 'at_risk' ? 'At Risk' : 'Draft'}
                        </span>
                        {project.deadline && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            Due {new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-[var(--border-primary)] dark:border-gray-700">
                        <Link
                          to={`/shared-projects/${project.id}`}
                          className="flex items-center justify-between text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] dark:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-hover)]"
                        >
                          <span>View Details</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Shared by me tab */
            <>
              {sharedByMe.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-8 sm:p-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-section)] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]">
                    <SharedIcon />
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--text-primary)] dark:text-gray-100">
                    No projects shared
                  </h3>

                  <p className="mt-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                    Projects you share with team members will appear here
                  </p>
                </div>
              ) : (
                /* List view for shared by me */
                <div className="space-y-4">
                  {sharedByMe.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          
                          {/* Project Logo */}
                          <div className="shrink-0">
                            {project.logo ? (
                              <img
                                src={project.logo}
                                alt={project.name}
                                className="h-16 w-16 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                {getInitials(project.name)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-[var(--text-primary)] dark:text-gray-100">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)] line-clamp-2">
                              {project.description}
                            </p>
                          
                          {/* Team members list */}
                          <div className="mt-4">
                            <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)] mb-2">
                              Shared with {project.teamMembers?.length || 0} team member(s):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.teamMembers?.map((memberId) => (
                                <div
                                  key={memberId}
                                 className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-[var(--bg-section)]"
                                >
                                  {getUserProfileImage(memberId) ? (
                                    <img
                                      src={getUserProfileImage(memberId) ?? undefined}
                                      alt={getUserName(memberId)}
                                      className="h-5 w-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                      {getInitials(getUserName(memberId))}
                                    </div>
                                  )}
                                  <span className="text-xs text-[var(--text-primary)] dark:text-gray-200">
                                    {getUserName(memberId)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 sm:flex-col items-center sm:items-end gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            project.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : project.status === 'at_risk'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {project.status === 'active' ? 'Active' : project.status === 'at_risk' ? 'At Risk' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info banner */}
        <div className="mt-8 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/10">
              <svg className="h-5 w-5 text-[var(--color-primary)] dark:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-primary)] dark:text-white">
                <span className="font-medium text-[var(--text-primary)] dark:text-white">Shared Projects</span> allow you to collaborate with team members on scope analysis. Changes made by any collaborator are visible to all members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
