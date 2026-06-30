import type { ReactNode } from 'react'
import { BUTTON_VARIANTS, SPACING, BORDER_RADIUS, TRANSITION } from '../../utils/designSystem'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'primary' | 'secondary' | 'small'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onClick?: () => void
}

export function Button({
  children,
  variant = 'primary',
  size = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  onClick,
}: ButtonProps) {
  const baseClasses = `
    ${BORDER_RADIUS.button}
    ${SPACING.button[size]}
    font-medium
    ${TRANSITION}
    ${BUTTON_VARIANTS[variant]}
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={baseClasses}
    >
      {children}
    </button>
  )
}
