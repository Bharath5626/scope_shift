import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { DashboardPage } from '../pages/DashboardPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ScopeBuilder } from '../pages/ScopeBuilder'
import { ProjectsPage } from '../pages/ProjectsPage'
import { CreateProjectPage } from '../pages/CreateProjectPage'
import { AnalyzingPage } from '../pages/AnalyzingPage'
import { AnalysisResultsPage } from '../pages/AnalysisResultsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { ReportDetailPage } from '../pages/ReportDetailPage'

export function AppRouter() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<CreateProjectPage />} />
        <Route path="/scope-builder" element={<ScopeBuilder />} />
        <Route path="/analyzing" element={<AnalyzingPage />} />
        <Route path="/analysis-results" element={<AnalysisResultsPage />} />
        <Route
          path="/analysis"
          element={<PlaceholderPage title="Analysis" subtitle="Run AI impact analysis on scope changes" />}
        />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:projectId" element={<ReportDetailPage />} />
        <Route
          path="/history"
          element={<PlaceholderPage title="Project History" subtitle="Browse all projects and their analysis history" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
