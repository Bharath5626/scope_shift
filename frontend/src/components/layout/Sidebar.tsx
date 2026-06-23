import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'

const EXTRA_ACTIVE: Record<string, string[]> = {
  '/analysis': ['/analyzing', '/analysis-results'],
  '/reports': ['/reports/'],
  '/scope-builder': ['/scope-builder'],
}

function NavIcon({ icon }: { icon: string }) {
  const icons: Record<string, ReactNode> = {
    dashboard: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    plus: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    layers: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    edit: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    activity: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    file: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    clock: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }
  return <>{icons[icon] ?? icons.dashboard}</>
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  return (
    <aside
  className={`fixed left-0 top-0 z-20 flex h-screen flex-col bg-gradient-to-b from-indigo-600 to-violet-700 text-white transition-all duration-300 ${
    collapsed ? 'w-20' : 'w-64'
  }`}
>
     {/* Header */}
<div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
  <div className="flex items-center gap-3">
  {!collapsed && (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-bold text-white">
        S
      </div>

      <div>
        <p className="text-base font-semibold text-white">ScopeAI</p>
        <p className="text-xs text-indigo-100">Scope Creep Analyzer</p>
      </div>
    </>
  )}
</div>

  <button
    onClick={() => setCollapsed((prev) => !prev)}
    className="rounded-lg p-2 text-indigo-100 hover:bg-white/10 hover:text-white"
    title="Toggle sidebar"
  >
    <svg
  className="h-6 w-6"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={2}
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 6h18M3 12h18M3 18h18"
  />
</svg>
  </button>
</div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const extraPaths = EXTRA_ACTIVE[item.path] ?? []
          const isExtraActive = extraPaths.some((p) => pathname.startsWith(p))

          return (
<NavLink
  key={item.path}
  to={item.path}
  end={item.path === '/'}
  title={collapsed ? item.label : undefined}
  className={({ isActive }) => {
    const active = isActive || isExtraActive
    return `relative flex items-center ${
      collapsed ? 'justify-center' : 'gap-3'
    } rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-white text-indigo-700 shadow-lg'
        : 'text-indigo-100 hover:bg-white/10 hover:text-white'
    } group`
  }}
>
  <NavIcon icon={item.icon} />
  {!collapsed && item.label}

  {/* Tooltip (only when collapsed) */}
  {collapsed && (
    <div className="absolute left-full ml-3 hidden group-hover:block whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-lg">
      {item.label}
    </div>
  )}
</NavLink>
          )
        })}
      </nav>
      {/* User + Logout */}
{!collapsed && (
  <div className="border-t border-white/10 p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {user?.name ?? 'User'}
          </p>
          <p className="truncate text-xs text-indigo-300">
            {user?.email ?? ''}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="shrink-0 rounded-xl p-2.5 text-indigo-200 transition hover:bg-white/10 hover:text-white"
        title="Sign out"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </div>
)}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900">Sign out</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to sign out?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
