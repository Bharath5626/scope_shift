import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import { DashboardProvider } from './context/DashboardContext'
import { AppRouter } from './routes/AppRouter'


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <DashboardProvider>
            <AppRouter />
          </DashboardProvider>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
