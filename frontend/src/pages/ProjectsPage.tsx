import { Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'

export function ProjectsPage() {
  const { projects } = useProjects()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Page container */}
      <div className="mx-auto max-w-6xl px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and analyze scope creep across your projects
            </p>
          </div>

          <Link
            to="/projects/new"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            New Project
          </Link>
        </div>

        {/* Content */}
        <div className="mt-10">

          {/* Empty state */}
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                📁
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                No projects yet
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Create your first project to start detecting scope creep
              </p>

              <Link
                to="/projects/new"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Create Project
              </Link>
            </div>
          ) : (
            /* Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/scope-builder?project=${project.id}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:shadow-gray-900/30"
                >

                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 transition group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {project.description}
                  </p>

                  {/* Footer hint */}
                  <div className="mt-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>Scope Builder</span>
                    <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Open →
                    </span>
                  </div>

                </Link>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}