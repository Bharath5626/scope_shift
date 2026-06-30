import type { ReactNode } from 'react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { UserProfileModal as SettingsModal } from '../UserProfileModal'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, TRANSITION, ICON_SIZE } from '../../utils/designSystem'

const EXTRA_ACTIVE: Record<string, string[]> = {
  '/analysis': ['/analyzing', '/analysis-results'],
  '/reports': ['/reports/'],
  '/scope-builder': ['/scope-builder'],
}

function NavIcon({ icon }: { icon: string }) {
  const icons: Record<string, ReactNode> = {
    dashboard: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    plus: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    layers: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    edit: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    activity: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    file: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    clock: (
      <svg className={ICON_SIZE.navigation} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }
  return <>{icons[icon] ?? icons.dashboard}</>
}

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (open: boolean) => void }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const { toggleTheme } = useTheme()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Use external state if provided, otherwise use internal state
  const isMobileOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen
  const handleSetMobileOpen = setMobileOpen || setInternalMobileOpen
  
  // Close mobile sidebar on route change
  useEffect(() => {
    handleSetMobileOpen(false)
  }, [pathname])
  
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  const handleSignOutClick = () => {
    setShowSettingsDropdown(false)
    setShowLogoutConfirm(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false)
      }
    }

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettingsDropdown])
  
  // Handle ESC key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSettingsDropdown) {
        setShowSettingsDropdown(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showSettingsDropdown])

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => handleSetMobileOpen(false)}
        />
      )}
      
      <aside
  className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-gradient-to-b from-indigo-600 to-violet-700 text-white transition-all duration-300 lg:z-20 ${
    collapsed ? 'w-20' : 'w-64'
  } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
>
     {/* Header */}
<div className={`flex items-center justify-between border-b border-white/10 px-4 py-5`}>
  <div className={`flex items-center gap-3`}>
  {!collapsed && (
    <>
      <div className={`flex h-10 w-10 items-center justify-center ${BORDER_RADIUS.card} bg-white/20 font-bold text-white`}>
        S
      </div>

      <div>
        <p className={`${TYPOGRAPHY.body} font-semibold text-white`}>ScopeAI</p>
        <p className={`${TYPOGRAPHY.caption} text-indigo-100`}>Scope Creep Analyzer</p>
      </div>
    </>
  )}
</div>

  <button
    onClick={() => setCollapsed((prev) => !prev)}
    className={`${BORDER_RADIUS.small} p-2 text-indigo-100 hover:bg-white/10 hover:text-white ${TRANSITION}`}
    title="Toggle sidebar"
    aria-label="Toggle sidebar collapse"
  >
    <svg
  className={ICON_SIZE.hero}
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
      <nav className={`flex-1 space-y-1 overflow-y-auto px-3 py-4 ${SPACING.section.gap}`}>
        {NAV_ITEMS.map((item) => {
          const extraPaths = EXTRA_ACTIVE[item.path] ?? []
          const isExtraActive = extraPaths.some((p) => pathname.startsWith(p))

          return (
<NavLink
  key={item.path}
  to={item.path}
  end={item.path === '/'}
  title={collapsed ? item.label : undefined}
  aria-label={item.label}
  className={({ isActive }) => {
    const active = isActive || isExtraActive
    return `relative flex items-center ${
      collapsed ? 'justify-center' : 'gap-3'
    } ${BORDER_RADIUS.card} px-3 py-2.5 ${TYPOGRAPHY.body} font-medium ${TRANSITION} duration-200 ${
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
    <div className={`absolute left-full ml-3 hidden group-hover:block whitespace-nowrap ${BORDER_RADIUS.small} bg-black/80 px-2 py-1 ${TYPOGRAPHY.caption} text-white shadow-lg`}>
      {item.label}
    </div>
  )}
</NavLink>
          )
        })}
      </nav>
      {/* User Profile Card */}
{!collapsed && (
  <div className={`border-t border-white/10 p-4 relative`}>
    <div 
      className="relative"
      ref={dropdownRef}
    >
      <button
        onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
        className={`w-full flex items-center gap-3 ${BORDER_RADIUS.card} px-3 py-2.5 ${TRANSITION} hover:bg-white/10 text-left`}
        aria-haspopup="true"
        aria-expanded={showSettingsDropdown}
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${BORDER_RADIUS.tag} bg-white/20 ${TYPOGRAPHY.body} font-semibold text-white`}>
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`truncate ${TYPOGRAPHY.body} font-medium text-white`}>
            {user?.name ?? 'User'}
          </p>
          <p className={`truncate ${TYPOGRAPHY.caption} text-indigo-300`}>
            {user?.email ?? ''}
          </p>
        </div>

        <svg className={`${ICON_SIZE.navigation} shrink-0 text-indigo-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* User Dropdown */}
      {showSettingsDropdown && (
        <div 
          className={`absolute bottom-full left-0 mb-2 w-56 ${BORDER_RADIUS.modal} bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 overflow-hidden dark:bg-gray-800/95 dark:ring-gray-700`}
          role="menu"
          aria-label="User menu"
        >
          <div className="py-1">
            <button
              onClick={() => {
                setShowSettingsDropdown(false)
                setShowProfileModal(true)
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-gray-700 hover:bg-gray-100 ${TRANSITION} dark:text-gray-200 dark:hover:bg-gray-700`}
              role="menuitem"
            >
              <svg className={`${ICON_SIZE.button} text-gray-500 dark:text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            
            <button
              role="menuitem"
              onClick={() => {
                toggleTheme()
                setShowSettingsDropdown(false)
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-gray-700 hover:bg-gray-100 ${TRANSITION} dark:text-gray-200 dark:hover:bg-gray-700`}
            >
              <svg className={`${ICON_SIZE.button} text-gray-500 dark:text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Theme
            </button>
            
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
            
            <button
              role="menuitem"
              onClick={handleSignOutClick}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-red-600 hover:bg-red-50 ${TRANSITION} dark:text-red-400 dark:hover:bg-red-900/30`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 -3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Collapsed Mode - Avatar Only */}
{collapsed && (
  <div className="border-t border-white/10 p-4 relative">
    <div 
      className="relative"
      ref={dropdownRef}
    >
      <button
        onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
        className={`flex h-10 w-10 items-center justify-center ${BORDER_RADIUS.tag} bg-white/20 ${TYPOGRAPHY.body} font-semibold text-white ${TRANSITION} hover:bg-white/30 mx-auto`}
        title={user?.name ?? 'User'}
      >
        {initials}
      </button>

      {/* User Dropdown */}
      {showSettingsDropdown && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 ${BORDER_RADIUS.modal} bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 overflow-hidden dark:bg-gray-800/95 dark:ring-gray-700`}>
          <div className="py-1">
            <button
              onClick={() => setShowSettingsDropdown(false)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-gray-700 hover:bg-gray-100 ${TRANSITION} dark:text-gray-200 dark:hover:bg-gray-700`}
            >
              <svg className={`${ICON_SIZE.button} text-gray-500 dark:text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
            
            <button
              onClick={() => setShowSettingsDropdown(false)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-gray-700 hover:bg-gray-100 ${TRANSITION} dark:text-gray-200 dark:hover:bg-gray-700`}
            >
              <svg className={`${ICON_SIZE.button} text-gray-500 dark:text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            
            <button
              role="menuitem"
              onClick={() => {
                toggleTheme()
                setShowSettingsDropdown(false)
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-gray-700 hover:bg-gray-100 ${TRANSITION} dark:text-gray-200 dark:hover:bg-gray-700`}
            >
              <svg className={`${ICON_SIZE.button} text-gray-500 dark:text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Theme
            </button>
            
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
            
            <button
              role="menuitem"
              onClick={handleSignOutClick}
              className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-red-600 hover:bg-red-50 ${TRANSITION} dark:text-red-400 dark:hover:bg-red-900/30`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 -3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className={`${BORDER_RADIUS.modal} bg-white ${SPACING.card.padding} shadow-xl max-w-sm w-full mx-4`}>
            <h3 className={`${TYPOGRAPHY.sectionHeader} font-semibold text-gray-900`}>Sign out</h3>
            <p className={`mt-2 ${TYPOGRAPHY.body} text-gray-500`}>Are you sure you want to sign out?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`${BORDER_RADIUS.button} px-4 py-2 ${TYPOGRAPHY.body} font-medium text-gray-700 ${TRANSITION} hover:bg-gray-100`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className={`${BORDER_RADIUS.button} bg-indigo-600 px-4 py-2 ${TYPOGRAPHY.body} font-medium text-white ${TRANSITION} hover:bg-indigo-700`}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Settings Modal */}
      <SettingsModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </aside>
    </>
  )
}
