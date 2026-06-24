import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { api } from '../services/api'

interface DashboardStats {
  stats: {
    totalProjects: number
    activeProjects: number
    draftProjects: number
    completedProjects: number
    atRiskProjects: number
  }
  scopeHealth: {
    healthScore: number
    totalAnalyses: number
    warnings: number
    healthy: number
  }
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
    total: number
  }
  recentProjects: any[]
  upcomingDeadlines: any[]
}

interface DashboardContextValue {
  dashboardStats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<DashboardStats>('/dashboard/stats/overall')
      setDashboardStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const value: DashboardContextValue = {
    dashboardStats,
    loading,
    error,
    refetch: fetchDashboardStats,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
