import type { InputHTMLAttributes } from 'react'
import { BORDER_RADIUS, SPACING, FOCUS_RING, TRANSITION } from '../../utils/designSystem'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export function Input({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) {
  const inputClasses = `
    ${BORDER_RADIUS.input}
    ${SPACING.card.padding}
    ${FOCUS_RING}
    ${TRANSITION}
    border border-gray-200 bg-white text-gray-900 placeholder-gray-400
    dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
