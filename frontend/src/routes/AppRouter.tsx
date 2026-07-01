import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { LoadingSkeleton } from '../components/LoadingSkeleton'

// Lazy load pages for better performance
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('../pages/SignupPage').then(m => ({ default: m.SignupPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ScopeBuilder = lazy(() => import('../pages/ScopeBuilder').then(m => ({ default: m.ScopeBuilder })))
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const CreateProjectPage = lazy(() => import('../pages/CreateProjectPage').then(m => ({ default: m.CreateProjectPage })))
const AnalyzingPage = lazy(() => import('../pages/AnalyzingPage').then(m => ({ default: m.AnalyzingPage })))
const AnalysisResultsPage = lazy(() => import('../pages/AnalysisResultsPage').then(m => ({ default: m.AnalysisResultsPage })))
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ReportDetailPage = lazy(() => import('../pages/ReportDetailPage').then(m => ({ default: m.ReportDetailPage })))
const ProjectHistoryPage = lazy(() => import('../pages/ProjectHistoryPage').then(m => ({ default: m.ProjectHistoryPage })))
const AnalysisPage = lazy(() => import('../pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })))
const UpcomingDeadlinesPage = lazy(() => import('../pages/UpcomingDeadlinesPage').then(m => ({ default: m.UpcomingDeadlinesPage })))

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSkeleton className="h-8 w-48" />
    </div>
  )
}

export function AppRouter() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/scope-builder" element={<ScopeBuilder />} />
          <Route path="/analyzing" element={<AnalyzingPage />} />
          <Route path="/analysis-results" element={<AnalysisResultsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:projectId" element={<ReportDetailPage />} />
          <Route path="/history" element={<ProjectHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
    path="/upcoming-deadlines"
    element={<UpcomingDeadlinesPage />}
/>
        </Routes>
      </Suspense>
    </AppLayout>
  )
}
