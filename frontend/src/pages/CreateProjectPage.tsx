import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { api } from '../services/api'

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

const selectCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer'

const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5'

const TYPE_MAP: Record<string, 'landing_page' | 'chatbot' | 'saas' | 'ecommerce'> = {
  'Web App': 'saas',
  'Mobile App': 'saas',
  SaaS: 'saas',
  API: 'saas',
  'E-commerce': 'ecommerce',
  Chatbot: 'chatbot',
  'Landing Page': 'landing_page',
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  )
}

type Step = 'form' | 'generating'

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
  const [deadline, setDeadline] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return
    setStep('generating')
    setError('')
    try {
      const project = await createProject({
        name,
        description,
        type: TYPE_MAP[projectType] ?? 'saas',
      })

      await api.post(`/projects/${project.id}/generate-features`, {
        techStack,
        teamSize,
        methodology,
        experienceLevel,
        deadline,
        workingHours,
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
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <svg className="h-7 w-7 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Generating features with AI</h2>
          <p className="mt-2 text-sm text-gray-500">
            Analysing your project details and building the initial feature list…
          </p>
          <div className="mt-5 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter project details — AI will generate an initial feature list for you
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

          <h2 className="mb-6 text-sm font-semibold text-gray-800">Project Metadata</h2>

          <div className="space-y-6">

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <SelectField
                label="Team Size"
                value={teamSize}
                onChange={setTeamSize}
                placeholder="Select size"
                options={['1–2', '3–5', '6–10', '10+']}
              />
              <SelectField
                label="Development Methodology"
                value={methodology}
                onChange={setMethodology}
                placeholder="Select methodology"
                options={['Agile', 'Scrum', 'Kanban', 'Waterfall']}
              />
              <div>
                <label className={labelCls}>Technology Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <SelectField
                label="Project Type"
                value={projectType}
                onChange={setProjectType}
                placeholder="Select type"
                options={['Web App', 'Mobile App', 'SaaS', 'E-commerce', 'Chatbot', 'Landing Page', 'API']}
              />
              <SelectField
                label="Team Experience Level"
                value={experienceLevel}
                onChange={setExperienceLevel}
                placeholder="Select level"
                options={['Junior', 'Mid-level', 'Senior', 'Mixed']}
              />
              <div>
                <label className={labelCls}>Project Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Working Hours / Day (per developer)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="Enter hours"
                  className={inputCls}
                />
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              onClick={() => navigate('/projects')}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Next →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
