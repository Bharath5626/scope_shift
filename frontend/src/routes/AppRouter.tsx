import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ScopeBuilder } from '../pages/ScopeBuilder'
import { ProjectsPage } from '../pages/ProjectsPage'
import { CreateProjectPage } from '../pages/CreateProjectPage'

export function AppRouter() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/projects"
          element={<ProjectsPage />}
        />
        <Route path="/projects/new" element={<CreateProjectPage />} />
        <Route path="/scope-builder" element={<ScopeBuilder />} />
        <Route
          path="/new-scope"
          element={
            <PlaceholderPage
              title="New Scope Changes"
              subtitle="Add new features and compare against the original scope"
            />
          }
        />
        <Route
          path="/analysis"
          element={
            <PlaceholderPage
              title="Analysis"
              subtitle="Run AI impact analysis on scope changes"
            />
          }
        />
        <Route
          path="/reports"
          element={
            <PlaceholderPage
              title="Reports"
              subtitle="View detailed impact analysis reports"
            />
          }
        />
        <Route
          path="/history"
          element={
            <PlaceholderPage
              title="Project History"
              subtitle="Browse all projects and their analysis history"
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
