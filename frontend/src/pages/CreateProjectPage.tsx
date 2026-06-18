import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { api } from '../services/api'

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition'

const selectCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer transition'

const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

const TYPE_MAP: Record<string, 'landing_page' | 'chatbot' | 'saas' | 'ecommerce'> = {
  'Web App': 'saas',
  'Mobile App': 'saas',
  SaaS: 'saas',
  API: 'saas',
  'E-commerce': 'ecommerce',
  Chatbot: 'chatbot',
  'Landing Page': 'landing_page',
}

const PROJECT_TYPES = [
  'Web App',
  'Mobile App',
  'SaaS',
  'E-commerce',
  'Chatbot',
  'Landing Page',
  'API',
]

type Step = 'form' | 'generating'

export function CreateProjectPage() {
  const navigate = useNavigate()
  const { createProject } = useProjects()

  // 🧠 CORE
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // ⚙️ CONTEXT
  const [techStack, setTechStack] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [deadline, setDeadline] = useState('')

  // 🟡 OPTIONAL
  const [projectType, setProjectType] = useState('')
  const [methodology, setMethodology] = useState('')
  const [workingHours, setWorkingHours] = useState('')

  const [step, setStep] = useState<Step>('form')
  const [error, setError] = useState('')
  const [showOptional, setShowOptional] = useState(false)
  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) return

    setStep('generating')
    setError('')

    try {
      const project = await createProject({
        name,
        description,
        type: TYPE_MAP[projectType] ?? 'saas',
      })

      await api.post(`/projects/${project.id}/generate-features`, {
        core: {
          name,
          description,
        },
        context: {
          techStack,
          teamSize,
          experienceLevel,
          deadline,
        },
        optional: {
          projectType,
          methodology,
          workingHours,
        },
      })

      navigate(`/scope-builder?project=${project.id}`)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
      setStep('form')
    }
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm max-w-sm w-full">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Generating features with AI
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Analysing your project details and building the initial feature list…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-8 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Create New Project
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details — AI will generate features based on structured inputs
            </p>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-5">

          {/* CORE */}
          <SectionCard
            title="Project Identity"
            description="Core inputs drive AI feature generation quality."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Customer Portal MVP"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this project does..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </SectionCard>

          {/* CONTEXT */}
          <SectionCard
            title="Team & Context"
            description="Helps AI understand constraints and complexity."
          >
            <div className="grid gap-5 sm:grid-cols-3">

              <div>
                <label className={labelCls}>Tech Stack</label>
                <input
                  className={inputCls}
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="React, Node.js..."
                />
              </div>

              <div>
                <label className={labelCls}>Team Size</label>
                <select
                  className={selectCls}
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="1-2">1-2</option>
                  <option value="3-5">3-5</option>
                  <option value="6-10">6-10</option>
                  <option value="10+">10+</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Experience Level</label>
                <select
                  className={selectCls}
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Deadline</label>
                <input
                  type="date"
                  className={inputCls}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

            </div>
          </SectionCard>

          {/* OPTIONAL */}
         <SectionCard
  title="Optional Settings"
  description="Advanced configuration for project behavior."
>
  <div className="group relative">

    {/* hint (always visible) */}
    <p className="text-xs text-gray-400 mb-3">
      Hover to configure optional settings
    </p>

    {/* hidden until hover */}
    <div className="grid gap-5 sm:grid-cols-3 opacity-0 max-h-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:max-h-96">

      <div>
        <label className={labelCls}>Project Type</label>
        <select
          className={selectCls}
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
        >
          <option value="">Select</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Methodology</label>
        <select
          className={selectCls}
          value={methodology}
          onChange={(e) => setMethodology(e.target.value)}
        >
          <option value="">Select</option>
          <option value="agile">Agile</option>
          <option value="scrum">Scrum</option>
          <option value="kanban">Kanban</option>
          <option value="waterfall">Waterfall</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Working Hours / Day</label>
        <select
          className={selectCls}
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
        >
          <option value="">Select</option>
          <option value="2">2 hrs</option>
          <option value="4">4 hrs</option>
          <option value="6">6 hrs</option>
          <option value="8">8 hrs</option>
          <option value="10">10+ hrs</option>
        </select>
      </div>

    </div>
  </div>
</SectionCard>

        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            AI will generate 6–10 features based on your inputs
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Generate Features & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}