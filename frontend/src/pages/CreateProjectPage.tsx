import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { api } from '../services/api'

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

const PROJECT_TYPES = ['Web App', 'Mobile App', 'SaaS', 'E-commerce', 'Chatbot', 'Landing Page', 'API']

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${selectCls} ${icon ? 'pl-9' : ''}`}
        >
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

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
      </div>
      {children}
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
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Generating features with AI</h2>
          <p className="mt-2 text-sm text-gray-500">
            Analysing your project details and building the initial feature list…
          </p>
          <div className="mt-6 flex justify-center gap-1.5">
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-8 py-10">

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details — Gemini AI will generate an initial feature list for the Scope Builder
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
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-5">

          {/* Section 1: Project Identity */}
          <SectionCard
            title="Project Identity"
            description="The name and description are used by AI to generate relevant features."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className={labelCls}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Customer Portal MVP"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div className="sm:col-span-1">
                <SelectField
                  label="Project Type"
                  value={projectType}
                  onChange={setProjectType}
                  placeholder="Select type"
                  options={PROJECT_TYPES}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this project does, who it's for, and any key requirements…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Team Configuration */}
          <SectionCard
            title="Team Configuration"
            description="Helps AI tailor the feature set to your team's capacity and approach."
          >
            <div className="grid gap-5 sm:grid-cols-3">
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
              <SelectField
                label="Team Experience Level"
                value={experienceLevel}
                onChange={setExperienceLevel}
                placeholder="Select level"
                options={['Junior', 'Mid-level', 'Senior', 'Mixed']}
              />
            </div>
          </SectionCard>

          {/* Section 3: Technical Details */}
          <SectionCard
            title="Technical Details"
            description="Technology context improves the accuracy of AI-generated features and effort estimates."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>Technology Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Working Hours / Dev / Day</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 7"
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 4: Timeline */}
          <SectionCard
            title="Timeline"
            description="Deadline information helps produce realistic estimates and flag any at-risk features."
          >
            <div className="grid gap-5 sm:grid-cols-3">
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
          </SectionCard>

        </div>

        {/* Action footer */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
