import { Link } from 'react-router-dom'
import { ProjectCard } from '../components/cards/ProjectCard'
import { StatsCard } from '../components/cards/StatsCard'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useProjects } from '../context/ProjectContext'
import { useDashboard } from '../context/DashboardContext'
import { useAuth } from '../context/AuthContext'

function FolderIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}
function getDaysLeft(deadline: string | Date, startDate?: string | Date | null) {
  const today = new Date()
  const dueDate = new Date(deadline)

  // If project has started, calculate from today
  // If project hasn't started, calculate from start date
  const baseDate = startDate && new Date(startDate) > today ? new Date(startDate) : today

  const diffTime = dueDate.getTime() - baseDate.getTime()

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
function ActiveIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SharedIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
  const { dashboardStats } = useDashboard()
  const { user } = useAuth()
  const upcomingProjects = dashboardStats?.upcomingDeadlines ?? [...projects]
  .filter((p) => p.deadline && p.status !== "completed")
  .sort(
    (a, b) =>
      new Date(a.deadline!).getTime() -
      new Date(b.deadline!).getTime()

  )
  .slice(0, 3)
  const totalProjects = dashboardStats?.stats.totalProjects ?? projects.length
  const activeProjects = dashboardStats?.stats.activeProjects ?? projects.filter((p) => p.status === 'active').length
  const sharedProjects = projects.filter((p) => {
    const isTeamMember = p.teamMembers?.includes(user?.id || '')
    const isNotCreator = p.createdBy.id !== user?.id
    return isTeamMember && isNotCreator
  }).length
  const completedProjects = projects.filter(
  (p) => p.status === "completed"
).length
  const atRiskProjects = dashboardStats?.stats.atRiskProjects ?? projects.filter(
    (p) => p.status === "at_risk"
  ).length
const sortedProjects = dashboardStats?.recentProjects ?? [...projects]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  .slice(0, 3) // Only keep the latest 3 projects
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of all your projects and scope health"
      // action={
      //   <Link
      //     to="/projects/new"
      //     className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
      //   >
      //     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      //       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      //     </svg>
      //     New Project
      //   </Link>
      // }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard label="Total Projects" value={totalProjects} icon={<FolderIcon />} accent="primary" />
        <StatsCard label="Active Projects" value={activeProjects} icon={<ActiveIcon />} accent="success" />
        <StatsCard label="Shared with me" value={sharedProjects} icon={<SharedIcon />} accent="warning" />
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

      <section className="mt-6 sm:mt-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Projects</h2>
            <Link
  to="/history"
  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
>
  Show All  →
</Link> 
        </div>

        {sortedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-secondary)] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary)] dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)]">
              <FolderIcon />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">No projects yet</h3>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Create your first project to start building and analyzing scope.
            </p>
            <Link
              to="/projects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-md"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
     <section className="mt-6 sm:mt-8">
  <h2 className="mb-4 sm:mb-6 text-lg font-semibold text-[var(--text-primary)]">
    Scope Health Analytics
  </h2>

  <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
    {/* Health Score */}
    <div className="rounded-2xl border border-[var(--border-primary)] bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[var(--text-primary)]">Scope Health Score</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          (dashboardStats?.scopeHealth.healthScore ?? 78) >= 70
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
            : (dashboardStats?.scopeHealth.healthScore ?? 78) >= 40
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
            : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] dark:bg-[var(--color-danger)]/20 dark:text-[var(--color-danger-light)]'
        }`}>
          {(dashboardStats?.scopeHealth.healthScore ?? 78) >= 70 ? 'Healthy' : (dashboardStats?.scopeHealth.healthScore ?? 78) >= 40 ? 'Warning' : 'Critical'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4">
        <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center mx-auto sm:mx-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={`transition-all duration-500 ${
                (dashboardStats?.scopeHealth.healthScore ?? 78) >= 70
                  ? 'text-[var(--color-success)]'
                  : (dashboardStats?.scopeHealth.healthScore ?? 78) >= 40
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-danger)]'
              }`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${dashboardStats?.scopeHealth.healthScore ?? 78}, 100`}
            />
          </svg>
          <span className="absolute text-2xl font-bold text-[var(--text-primary)]">{dashboardStats?.scopeHealth.healthScore ?? 78}%</span>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-[var(--text-soft)]">Analyses</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{dashboardStats?.scopeHealth.totalAnalyses ?? 0}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-section)]">
              <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-[var(--text-soft)]">Warnings</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{dashboardStats?.scopeHealth.warnings ?? 0}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-section)]">
              <div className="h-full rounded-full bg-[var(--color-warning)] transition-all duration-500" style={{ width: `${dashboardStats?.scopeHealth.totalAnalyses ? (dashboardStats.scopeHealth.warnings / dashboardStats.scopeHealth.totalAnalyses) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-[var(--text-soft)]">Healthy</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{dashboardStats?.scopeHealth.healthy ?? 0}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-section)]">
              <div className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500" style={{ width: `${dashboardStats?.scopeHealth.totalAnalyses ? (dashboardStats.scopeHealth.healthy / dashboardStats.scopeHealth.totalAnalyses) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Risk Distribution */}
    <div className="rounded-2xl border border-[var(--border-primary)] bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 font-semibold text-[var(--text-primary)]">Risk Distribution</h3>

{!dashboardStats || dashboardStats.riskDistribution.total === 0 ? (
  <div className="flex h-40 items-center justify-center">
    <p className="text-sm text-[var(--text-soft)]">
      No analysis data available. Run scope analysis on your projects to see risk distribution.
    </p>
  </div>
) : (
<div className="space-y-3">
  {[
    {
      label: 'Low',
      value: dashboardStats.riskDistribution.low,
      percentage: Math.round((dashboardStats.riskDistribution.low / dashboardStats.riskDistribution.total) * 100),
      color: 'bg-[var(--color-success)]',
    },
    {
      label: 'Medium',
      value: dashboardStats.riskDistribution.medium,
      percentage: Math.round((dashboardStats.riskDistribution.medium / dashboardStats.riskDistribution.total) * 100),
      color: 'bg-[var(--color-warning)]',
    },
    {
      label: 'High',
      value: dashboardStats.riskDistribution.high,
      percentage: Math.round((dashboardStats.riskDistribution.high / dashboardStats.riskDistribution.total) * 100),
      color: 'bg-[var(--color-accent)]',
    },
    {
      label: 'Critical',
      value: dashboardStats.riskDistribution.critical,
      percentage: Math.round((dashboardStats.riskDistribution.critical / dashboardStats.riskDistribution.total) * 100),
      color: 'bg-[var(--color-danger)]',
    },
  ].map((risk) => (
    <div key={risk.label} className="flex items-center gap-3">
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-secondary)]">{risk.label} Risk</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{risk.value}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-section)]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${risk.color}`}
            style={{ width: `${risk.percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-[var(--text-soft)] w-12 text-right">{risk.percentage}%</span>
    </div>
  ))}
</div>
)}
    </div>
  </div>
</section>

<section className="mt-6 sm:mt-8">
  <div className="rounded-3xl border border-[var(--border-primary)] bg-white p-4 sm:p-6 shadow-sm">
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Upcoming Deadlines
      </h2>

      <Link
  to="/upcoming-deadlines"
  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
>
  Show All →
</Link>
    </div>

    {upcomingProjects.length === 0 ? (
      <p className="text-sm text-[var(--text-soft)]">
        No upcoming deadlines.
      </p>
    ) : (
      <div className="space-y-4">
        {upcomingProjects.map((project) => {
          const daysLeft = getDaysLeft(project.deadline!, project.startDate)
          const hasStarted = project.startDate ? new Date(project.startDate) <= new Date() : true

          return (
            <div
              key={project.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[var(--border-primary)] p-3 sm:p-4 transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--bg-hover)] hover:shadow-md"
            >
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {project.name}
                </h3>

                <p className="text-sm text-[var(--text-soft)]">
                  Due{" "}
                  {new Date(project.deadline!).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-end">
                {!hasStarted && project.startDate && (
                  <span className="text-xs text-[var(--text-soft)]">
                    Starts {new Date(project.startDate).toLocaleDateString()}
                  </span>
                )}
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    daysLeft <= 3
                      ? "bg-red-50 text-[var(--color-danger)] dark:bg-red-900/20 dark:text-red-400"
                      : daysLeft <= 7
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "bg-green-50 text-[var(--color-success)] dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {daysLeft} days left
              </div>
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
