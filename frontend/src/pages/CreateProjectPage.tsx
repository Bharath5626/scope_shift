import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'

export function CreateProjectPage() {
  const navigate = useNavigate()
  const { createProject } = useProjects()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [methodology, setMethodology] = useState('')
  const [techStack, setTechStack] = useState('')
  const [projectType, setProjectType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [complexity, setComplexity] = useState('')
  const [priority, setPriority] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const TYPE_MAP: Record<string, 'landing_page' | 'chatbot' | 'saas' | 'ecommerce'> = {
    'Web App': 'saas',
    'Mobile App': 'saas',
    'SaaS': 'saas',
    'API': 'saas',
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const project = await createProject({
        name,
        description,
        type: TYPE_MAP[projectType] ?? 'saas',
      })
      navigate(`/scope-builder?project=${project.id}`)
    } catch (err: any) {
      setError(err.message ?? 'Failed to create project. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="w-full max-w-4xl space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Project</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter project metadata below to generate accurate impact analysis.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-6">Project Metadata</h2>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Team Size</label>
                <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500">
                  <option value="">Select</option>
                  <option>1-2</option>
                  <option>3-5</option>
                  <option>6-10</option>
                  <option>10+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Dev Methodology</label>
                <select value={methodology} onChange={(e) => setMethodology(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>Agile</option>
                  <option>Scrum</option>
                  <option>Kanban</option>
                  <option>Waterfall</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Technology Stack</label>
                <select value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>MERN</option>
                  <option>Next.js</option>
                  <option>Django</option>
                  <option>Spring Boot</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Type</label>
                <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>Web App</option>
                  <option>Mobile App</option>
                  <option>SaaS</option>
                  <option>API</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Experience Level</label>
                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>Junior</option>
                  <option>Mid</option>
                  <option>Senior</option>
                  <option>Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Complexity</label>
                <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10 pt-4">
            <button onClick={() => navigate('/projects')} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!name || loading} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? 'Creating…' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
