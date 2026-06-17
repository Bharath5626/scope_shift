import { BrowserRouter } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import { AppRouter } from './routes/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <AppRouter />
      </ProjectProvider>
    </BrowserRouter>
  )
}
