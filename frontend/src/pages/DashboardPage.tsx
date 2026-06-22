import { Link } from 'react-router-dom'
import { ProjectCard } from '../components/cards/ProjectCard'
import { StatsCard } from '../components/cards/StatsCard'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useProjects } from '../context/ProjectContext'

function FolderIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function ActiveIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DraftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

export function DashboardPage() {
  const { projects } = useProjects()

  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const draftProjects = projects.filter((p) => p.status === 'draft').length
  const completedProjects = projects.filter(
  (p) => p.status === "completed"
).length;

const sortedProjects = [...projects].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
)

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of all your projects and scope health"
      action={
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Projects" value={totalProjects} icon={<FolderIcon />} accent="primary" />
        <StatsCard label="Active Projects" value={activeProjects} icon={<ActiveIcon />} accent="success" />
        <StatsCard label="Draft Projects" value={draftProjects} icon={<DraftIcon />} accent="warning" />
        <StatsCard
label="Completed Projects"
  value={completedProjects}
  icon={<ActiveIcon />}
  accent="success"
/>
      </div>

      <section className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <span className="text-sm text-gray-500">
            {totalProjects} project{totalProjects !== 1 ? 's' : ''}
          </span>
        </div>

        {sortedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <FolderIcon />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first project to start building and analyzing scope.
            </p>
            <Link
              to="/projects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
