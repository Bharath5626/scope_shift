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
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3  pr-10 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer transition'

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
const SKILLS = [
  'React',
  'React Native',
  'Node.js',
  'Express',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Django',
  'FastAPI',
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'AWS',
  'Docker',
  'Kubernetes',
]

const PROJECT_TYPES = [
  'Web App',
  'Mobile App',
  'SaaS',
  'E-commerce',
  'Chatbot',
  'Landing Page',
  'API',
]
const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}

    <svg
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
)


type Step = 'form' | 'generating'

export function CreateProjectPage() {
  const [projectTypeOther, setProjectTypeOther] = useState('')
  const [isCustomProjectType, setIsCustomProjectType] = useState(false)
  const [methodologyOther, setMethodologyOther] = useState('')
  const [isCustomMethodology, setIsCustomMethodology] = useState(false)
  const [workingHoursOther, setWorkingHoursOther] = useState('')

  const [techStackInput, setTechStackInput] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const navigate = useNavigate()
  const { createProject } = useProjects()

  // 🧠 CORE
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // ⚙️ CONTEXT
  
  const [teamSize, setTeamSize] = useState('')
  const [deadline, setDeadline] = useState('')
  const [startDate, setStartDate] = useState('')

  // 🟡 OPTIONAL
  const [projectType, setProjectType] = useState('')
  const [methodology, setMethodology] = useState('')
  const [workingHours, setWorkingHours] = useState('')

  const [step, setStep] = useState<Step>('form')
  const [error, setError] = useState('')
  const [showOptional, setShowOptional] = useState(false)
const handleCreate = async () => {
  const payload = {
  name,
  description,
  type: TYPE_MAP[projectType] ?? "saas",
  startDate,
  deadline,
}


if (
  !name.trim() ||
  !teamSize ||
  !startDate ||
  !deadline ||
  selectedSkills.length === 0
) {
  setError("Please fill all required fields")
  return
}

  if (Number(teamSize) > 500) {
    setError("Team size cannot exceed 500")
    return
  }

  setStep('generating')
  setError('')

  try {
const project = await createProject({
  name,
  description: description.trim() || null,

  type: TYPE_MAP[projectType] ?? 'saas',

  startDate,
  deadline,

  teamSize: Number(teamSize),

  techStack: selectedSkills.join(', '),
  projectType: projectType || null,

  methodology: methodology.trim() || null,

  workingHours:
    workingHours
      ? Number(workingHours)
      : null,
})

    await api.post(`/projects/${project.id}/generate-features`, {
      core: {
        name,
        description,
      },
      context: {
       techStack: selectedSkills.join(', '),
        teamSize,
        startDate,
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
const filteredSkills = SKILLS.filter(
  (skill) =>
    skill.toLowerCase().includes(techStackInput.toLowerCase()) &&
    !selectedSkills.includes(skill)
)

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
  <label className={labelCls}>Tech Stack <span className="text-red-500">*</span></label>

  <div className="relative">
    <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 min-h-[52px]">
      
      {selectedSkills.map((skill) => (
        <span
          key={skill}
          className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
        >
          {skill}

          <button
            type="button"
            onClick={() =>
              setSelectedSkills(
                selectedSkills.filter((s) => s !== skill)
              )
            }
          >
            ×
          </button>
        </span>
      ))}

      <input
        value={techStackInput}
        onChange={(e) => setTechStackInput(e.target.value)}
        placeholder={
  selectedSkills.length
    ? ''
    : 'Search or type a skill...'}
        className="flex-1 min-w-[120px] outline-none"
        onKeyDown={(e) => {
  if (
    e.key === 'Enter' &&
    techStackInput.trim() &&
    !selectedSkills.includes(techStackInput.trim())
  ) {
    e.preventDefault()

    setSelectedSkills([
      ...selectedSkills,
      techStackInput.trim(),
    ])

    setTechStackInput('')
  }
}}
      />
    </div>

    {techStackInput && filteredSkills.length > 0 && (
      <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
        {filteredSkills.slice(0, 8).map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => {
              setSelectedSkills([...selectedSkills, skill])
              setTechStackInput('')
            }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            {skill}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

    <div>
      <label className={labelCls}>
        Team Size <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        min="1"
        max="500"
        className={inputCls}
        value={teamSize}
        onChange={(e) => {
          const value = Number(e.target.value)
          if (value <= 500 || e.target.value === '') {
            setTeamSize(e.target.value)
          }
        }}
        placeholder="Max 500"
      />
    </div>

    

    <div>
      <label className={labelCls}>
        Start Date <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        className={inputCls}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
      />
    </div>

    <div>
      <label className={labelCls}>
        Deadline <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        className={inputCls}
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        min={startDate || new Date().toISOString().split('T')[0]}
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

   
    {/* hidden until hover */}
    <div className="grid gap-5 sm:grid-cols-3 transition-all duration-300">

<div>
  <label className={labelCls}>Project Type</label>

  {isCustomProjectType ? (
    <div className="relative">
      <input
        className={`${inputCls} pr-10`}
        placeholder="Enter project type"
        value={projectType}
        onChange={(e) => setProjectType(e.target.value)}
      />

      <button
        type="button"
        onClick={() => {
          setProjectType('')
          setIsCustomProjectType(false)
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  ) : (
    <SelectWrapper>
      <select
        className={selectCls}
        value={projectType}
        onChange={(e) => {
          if (e.target.value === 'other') {
            setProjectType('')
            setIsCustomProjectType(true)
          } else {
            setProjectType(e.target.value)
          }
        }}
      >
        <option value="">Select</option>

        {PROJECT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}

        <option value="other">Other</option>
      </select>
    </SelectWrapper>
  )}
</div>

      <div>
  <label className={labelCls}>Methodology</label>

  {isCustomMethodology ? (
    <div className="relative">
      <input
        className={`${inputCls} pr-10`}
        placeholder="Enter methodology"
        value={methodology}
        onChange={(e) => setMethodology(e.target.value)}
      />

      <button
        type="button"
        onClick={() => {
          setMethodology('')
          setIsCustomMethodology(false)
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  ) : (
    <SelectWrapper>
      <select
        className={selectCls}
        value={methodology}
        onChange={(e) => {
          if (e.target.value === 'other') {
            setMethodology('')
            setIsCustomMethodology(true)
          } else {
            setMethodology(e.target.value)
          }
        }}
      >
        <option value="">Select</option>
        <option value="agile">Agile</option>
        <option value="scrum">Scrum</option>
        <option value="kanban">Kanban</option>
        <option value="waterfall">Waterfall</option>
        <option value="other">Other</option>
      </select>
    </SelectWrapper>
  )}
</div>

      <div>
        <label className={labelCls}>Working Hours / Day</label>
        <input
  type="number"
  min="1"
  max="24"
  className={inputCls}
  value={workingHours}
  onChange={(e) => {
    const value = Number(e.target.value)

    if (value <= 24 || e.target.value === '') {
      setWorkingHours(e.target.value)
    }
  }}
  placeholder="Hours per day"
/>
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
             disabled={
  !name.trim() ||
  !teamSize ||
  !startDate ||
  !deadline ||
  selectedSkills.length === 0
}
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