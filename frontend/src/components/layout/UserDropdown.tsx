import { TYPOGRAPHY, BORDER_RADIUS, TRANSITION, ICON_SIZE } from '../../utils/designSystem'

interface UserDropdownProps {
  onSettings: () => void
  onTheme: () => void
  onSignOut: () => void
  onClose: () => void
  positionClass?: string
}

export function UserDropdown({
  onSettings,
  onTheme,
  onSignOut,
  onClose,
  positionClass = 'absolute bottom-full left-0 mb-2'
}: UserDropdownProps) {
  return (
    <div
      className={`${positionClass} w-56 ${BORDER_RADIUS.modal} bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 overflow-hidden dark:bg-gray-800/95 dark:ring-gray-700`}
      role="menu"
      aria-label="User menu"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onClose()
            onSettings()
          }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] hover:bg-[var(--bg-section)] ${TRANSITION} dark:!text-black dark:hover:bg-gray-700`}
          role="menuitem"
        >
          <svg className={`${ICON_SIZE.button} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ color: 'var(--tw-dark-text, #000000)' }}>Settings</span>
        </button>

        <button
          role="menuitem"
          onClick={() => {
            onTheme()
            onClose()
          }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-[var(--text-secondary)] hover:bg-[var(--bg-section)] ${TRANSITION} dark:!text-black dark:hover:bg-gray-700`}
        >
          <svg className={`${ICON_SIZE.button} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span style={{ color: 'var(--tw-dark-text, #000000)' }}>Theme</span>
        </button>

        <div className="my-1 border-t border-[var(--border-primary)] dark:border-gray-700" />

        <button
          role="menuitem"
          onClick={onSignOut}
          className={`flex w-full items-center gap-3 px-4 py-2.5 ${TYPOGRAPHY.body} text-red-600 hover:bg-red-50 ${TRANSITION} dark:text-red-400 dark:hover:bg-red-900/30`}
        >
          <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}
