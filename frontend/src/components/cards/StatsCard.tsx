import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: number | string
  icon: ReactNode
  accent?: 'primary' | 'success' | 'warning' | 'danger'
}

const accentStyles = {
  primary: 'bg-indigo-50 text-indigo-600',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-yellow-50 text-yellow-600',
  danger: 'bg-red-50 text-red-600',
}

export function StatsCard({
  label,
  value,
  icon,
  accent = 'primary',
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}