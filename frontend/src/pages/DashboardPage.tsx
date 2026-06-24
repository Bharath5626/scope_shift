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
function getDaysLeft(deadline: string) {
  const today = new Date()
  const dueDate = new Date(deadline)

  const diffTime = dueDate.getTime() - today.getTime()

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
function RiskIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.5 20h15a2 2 0 001.71-3.14l-7.5-13a2 2 0 00-3.42 0z"
      />
    </svg>
  )
}

export function DashboardPage() {
  
  const { projects } = useProjects()
  const upcomingProjects = [...projects]
  .filter((p) => p.deadline && p.status !== "completed")
  .sort(
    (a, b) =>
      new Date(a.deadline!).getTime() -
      new Date(b.deadline!).getTime()
      
  )
  .slice(0, 3)
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const draftProjects = projects.filter((p) => p.status === 'draft').length
  const riskStats = {
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
}
  const completedProjects = projects.filter(
  (p) => p.status === "completed"
).length;
const atRiskProjects = projects.filter(
  (p) => p.status === "at_risk"
).length
const sortedProjects = [...projects]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  .slice(0, 3) // Only keep the latest 3 projects
  console.log(
  projects.filter((p) => p.deadline !== null)
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard label="Total Projects" value={totalProjects} icon={<FolderIcon />} accent="primary" />
        <StatsCard label="Active Projects" value={activeProjects} icon={<ActiveIcon />} accent="success" />
        <StatsCard label="Draft Projects" value={draftProjects} icon={<DraftIcon />} accent="warning" />
        <StatsCard
label="Completed Projects"
  value={completedProjects}
  icon={<ActiveIcon />}
  accent="success"
/>
<StatsCard
  label="At Risk Projects"
  value={atRiskProjects}
  icon={<RiskIcon />}
  accent="danger"
/>
      </div>

      <section className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Link
  to="/history"
  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
>
  Show All  →
</Link> 
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
     <section className="mt-8">
  <div className="mb-6 flex items-center justify-between">
    <h2 className="text-lg font-semibold text-gray-900">
      Scope Health Analytics
    </h2>

    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
      AI Insights
    </span>
  </div>

  <div className="grid gap-6 lg:grid-cols-2">
    {/* Health Score */}
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Scope Health Score</h3>

          <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
            Healthy
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-44 w-44 items-center justify-center rounded-full border-[16px] border-indigo-100">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900">78%</p>
                <p className="mt-2 text-sm text-gray-500">
                  Scope Stability
                </p>
              </div>
            </div>

            <div className="absolute -right-1 top-3 h-4 w-4 animate-pulse rounded-full bg-green-500" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500">Analyses</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-xs text-gray-500">Warnings</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>
        </div>
      </div>
    </div>

    {/* Risk Distribution */}
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
        <h3 className="font-semibold">Risk Distribution</h3>
      </div>

<div className="grid gap-4">
  {[
    {
      label: 'Low',
      value: 12,
      percentage: 60,
      color: 'from-green-400 to-green-600',
      // bg: 'bg-green-50',
      text: 'text-green-700',
    },
    {
      label: 'Medium',
      value: 5,
      percentage: 25,
      color: 'from-yellow-400 to-yellow-500',
      // bg: 'bg-yellow-50',
      text: 'text-yellow-700',
    },
    {
      label: 'High',
      value: 2,
      percentage: 10,
      color: 'from-orange-400 to-orange-600',
      // bg: 'bg-orange-50',
      text: 'text-orange-700',
    },
    {
      label: 'Critical',
      value: 1,
      percentage: 5,
      color: 'from-red-500 to-red-700',
      // bg: 'bg-red-50',
      text: 'text-red-700',
    },
  ].map((risk) => (
    <div
      key={risk.label}
      className={`rounded-2xl border border-gray-100 p-4 ${risk}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className={`font-semibold ${risk.text}`}>
            {risk.label} Risk
          </p>

          <p className="text-xs text-gray-500">
            {risk.percentage}% of projects
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {risk.value}
          </p>
        </div>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-white/80">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${risk.color} shadow-lg transition-all duration-1000`}
          style={{ width: `${risk.percentage}%` }}
        />

        <div
          className="absolute top-0 h-full w-8 animate-pulse bg-white/30 blur-sm"
          style={{
            left: `calc(${risk.percentage}% - 1rem)`,
          }}
        />
      </div>
    </div>
  ))}
</div>
    </div>
  </div>
</section>

<section className="mt-8">
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">
        Upcoming Deadlines
      </h2>

      <Link
  to="/upcoming-deadlines"
  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
>
  Show All →
</Link>
    </div>

    {upcomingProjects.length === 0 ? (
      <p className="text-sm text-gray-500">
        No upcoming deadlines.
      </p>
    ) : (
      <div className="space-y-4">
        {upcomingProjects.map((project) => {
          const daysLeft = getDaysLeft(project.deadline!)

          return (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  {project.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Due{" "}
                  {new Date(project.deadline!).toLocaleDateString()}
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  daysLeft <= 3
                    ? "bg-red-100 text-red-700"
                    : daysLeft <= 7
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {daysLeft} days left
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
</section>
    </DashboardLayout>
  )
}
