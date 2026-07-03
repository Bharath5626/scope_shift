/**
 * Design System Constants
 * Centralized design tokens for consistent UI across the application
 */

// Border Radius
export const BORDER_RADIUS = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  input: 'rounded-xl',
  modal: 'rounded-2xl',
  tag: 'rounded-full',
  small: 'rounded-lg',
} as const

// Spacing
export const SPACING = {
  page: {
    padding: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
    headerPadding: 'px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6',
  },
  section: {
    gap: 'gap-4 sm:gap-6',
    marginTop: 'mt-6 sm:mt-8',
  },
  card: {
    padding: 'p-4 sm:p-5 lg:p-6',
    compactPadding: 'p-3 sm:p-4 lg:p-5',
  },
  button: {
    primary: 'px-4 py-2 sm:px-5 sm:py-2.5',
    secondary: 'px-3 py-2 sm:px-4 sm:py-2.5',
    small: 'px-2.5 py-1.5 sm:px-3 sm:py-2',
  },
} as const

// Typography
export const TYPOGRAPHY = {
  pageTitle: 'text-2xl font-semibold',
  sectionHeader: 'text-lg font-semibold',
  cardTitle: 'text-base font-semibold',
  body: 'text-sm',
  label: 'text-sm font-medium',
  caption: 'text-xs',
  heading: 'text-xl font-semibold',
} as const

// Shadows
export const SHADOW = {
  card: 'shadow-sm',
  cardHover: 'shadow-md',
  modal: 'shadow-2xl',
  button: 'shadow-sm',
} as const

// Icon Sizes
export const ICON_SIZE = {
  navigation: 'h-5 w-5',
  button: 'h-4 w-4',
  card: 'h-5 w-5',
  hero: 'h-6 w-6',
  large: 'h-8 w-8',
} as const

// Button Variants
export const BUTTON_VARIANTS = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white',
  secondary: 'border border-[var(--border-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-section)] disabled:opacity-50 text-[var(--text-secondary)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
  danger: 'bg-[var(--color-danger)] hover:bg-red-700 disabled:opacity-50 text-white',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:text-gray-200 dark:hover:bg-gray-700',
  success: 'bg-[var(--color-success)] hover:bg-green-700 disabled:opacity-50 text-white',
} as const

// Focus Ring
export const FOCUS_RING = 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400'

// Transition
export const TRANSITION = 'transition-all duration-200'
