import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { api } from '../services/api'
import type { Project } from '../types'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION } from '../utils/designSystem'

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
    <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-[var(--bg-surface)] ${SPACING.card.padding} ${SHADOW.card} dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)]`}>
      <div className="mb-4">
        <h3 className={`${TYPOGRAPHY.body} font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]`}>{title}</h3>
        {description && <p className={`mt-1 ${TYPOGRAPHY.caption} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

const inputCls =
  `w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-surface)] px-4 py-3 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${TRANSITION} dark:border-[var(--border-secondary)] dark:bg-[var(--bg-input)] dark:text-white dark:placeholder-[var(--text-subtle)]`

const selectCls =
  `w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-surface)] px-4 py-3  pr-10 ${TYPOGRAPHY.body} text-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 appearance-none cursor-pointer ${TRANSITION} dark:border-[var(--border-secondary)] dark:bg-[var(--bg-input)] dark:text-gray-200`

const labelCls = `block ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] mb-1.5 dark:text-[var(--text-muted)]`

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
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)] dark:text-[var(--text-soft)]"
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
  const [searchParams] = useSearchParams()
  const editProjectId = searchParams.get('edit')
  const { createProject } = useProjects()
  const [isCustomProjectType, setIsCustomProjectType] = useState(false)
  const [isCustomMethodology, setIsCustomMethodology] = useState(false)

  const navigate = useNavigate()

  // Load draft data from localStorage for initialization (only for new projects)
  const getInitialFormData = () => {
    if (editProjectId) {
      return {
        name: '',
        description: '',
        teamSize: '',
        deadline: '',
        startDate: '',
        projectType: '',
        methodology: '',
        workingHours: '',
        selectedSkills: [] as string[],
        logoPreview: null as string | null,
        customProjectTypes: [] as string[],
        customMethodologies: [] as string[],
        teamMembers: [] as string[]
      }
    }
    
    try {
      const savedDraft = localStorage.getItem('createProjectDraft')
      if (savedDraft) {
        const formData = JSON.parse(savedDraft)
        return {
          name: formData.name || '',
          description: formData.description || '',
          teamSize: formData.teamSize || '',
          deadline: formData.deadline || '',
          startDate: formData.startDate || '',
          projectType: formData.projectType || '',
          methodology: formData.methodology || '',
          workingHours: formData.workingHours || '',
          selectedSkills: formData.selectedSkills || [],
          logoPreview: formData.logoPreview || null,
          customProjectTypes: formData.customProjectTypes || [],
          customMethodologies: formData.customMethodologies || [],
          teamMembers: formData.teamMembers || []
        }
      }
    } catch (err) {
      console.error('Failed to load draft data:', err)
      localStorage.removeItem('createProjectDraft')
    }
    
    return {
      name: '',
      description: '',
      teamSize: '',
      deadline: '',
      startDate: '',
      projectType: '',
      methodology: '',
      workingHours: '',
      selectedSkills: [] as string[],
      logoPreview: null as string | null,
      customProjectTypes: [] as string[],
      customMethodologies: [] as string[],
      teamMembers: [] as string[]
    }
  }

  const initialFormData = getInitialFormData()

  const [techStackInput, setTechStackInput] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialFormData.selectedSkills)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialFormData.logoPreview)

  // 🧠 CORE
  const [name, setName] = useState(initialFormData.name)
  const [description, setDescription] = useState(initialFormData.description)

  // ⚙️ CONTEXT
  const [teamSize, setTeamSize] = useState(initialFormData.teamSize)
  const [deadline, setDeadline] = useState(initialFormData.deadline)
  const [startDate, setStartDate] = useState(initialFormData.startDate)

  // 🟡 OPTIONAL
  const [projectType, setProjectType] = useState(initialFormData.projectType)
  const [methodology, setMethodology] = useState(initialFormData.methodology)
  const [workingHours, setWorkingHours] = useState(initialFormData.workingHours)

  const [step, setStep] = useState<Step>('form')
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(!!editProjectId === false && initialFormData.name !== '')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    techStack?: string
  }>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const techStackInputRef = useRef<HTMLInputElement>(null)

  // Custom values state (initialized from draft)
  const [customProjectTypes, setCustomProjectTypes] = useState<string[]>(initialFormData.customProjectTypes)
  const [customMethodologies, setCustomMethodologies] = useState<string[]>(initialFormData.customMethodologies)

  // Team members state
  const [teamMembers, setTeamMembers] = useState<string[]>(initialFormData.teamMembers || [])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch available users
  useEffect(() => {
    if (!editProjectId) {
      // Only fetch users for new projects
      api.get('/users')
        .then((response: any) => {
          const users = Array.isArray(response) ? response : (response.data?.data || response.data || [])
          setAvailableUsers(users)
        })
        .catch((err) => {
          console.error('Failed to fetch users:', err)
        })
    }
  }, [editProjectId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load project data if editing
  useEffect(() => {
    if (editProjectId) {
      // Fetch project directly from API to ensure we have the latest data
      api.get(`/projects/${editProjectId}`)
        .then((project: any) => {
          setName(project.name)
          setDescription(project.description || '')
          setTeamSize(project.teamSize?.toString() || '')
          setDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '')
          setStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '')
          setProjectType(project.projectType || '')
          setMethodology(project.methodology || '')
          setWorkingHours(project.workingHours?.toString() || '')
          setLogoPreview(project.logo || null)
          
          if (project.techStack) {
            const skills = project.techStack.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill)
            setSelectedSkills(skills)
          }
        })
        .catch((err) => {
          console.error('Failed to load project:', err)
          setError('Failed to load project data. Please try again.')
        })
    }
  }, [editProjectId])

  // Save form data to localStorage whenever it changes (only for new projects, not editing)
  useEffect(() => {
    if (editProjectId) return // Don't save draft when editing
    
    const formData = {
      name,
      description,
      teamSize,
      deadline,
      startDate,
      projectType,
      methodology,
      workingHours,
      selectedSkills,
      logoPreview,
      customProjectTypes,
      customMethodologies,
      teamMembers
    }
    localStorage.setItem('createProjectDraft', JSON.stringify(formData))
  }, [name, description, teamSize, deadline, startDate, projectType, methodology, workingHours, selectedSkills, logoPreview, customProjectTypes, customMethodologies, teamMembers, editProjectId])

  // Track unsaved changes
  const handleFieldChange = (field?: string) => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true)
    }
    if (field) {
      setTouchedFields(prev => new Set([...prev, field]))
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Real-time validation using useEffect (only after user interaction)
  useEffect(() => {
    const errors: { name?: string; techStack?: string } = {}

    // Validate project name (only if user has interacted with name field)
    if (touchedFields.has('name')) {
      if (name.trim() && name.trim().length < 3) {
        errors.name = 'Project name must be at least 3 characters'
      }
    }

    // Validate tech stack (only if user has interacted with tech stack field)
if (touchedFields.has('techStack')) {
  if (
    techStackInput.trim() &&
    selectedSkills.length === 0
  ) {
    errors.techStack = 'Please add at least one tech skill'
  }
}

    setFieldErrors(errors)
  }, [name, selectedSkills, touchedFields])

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true)
    } else {
      navigate('/projects')
    }
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    localStorage.removeItem('createProjectDraft')
    navigate('/projects')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit file size to 500KB (base64 encoding adds ~33% overhead)
      const maxSizeKB = 500
      const fileSizeKB = file.size / 1024
      console.log('File size:', fileSizeKB.toFixed(2), 'KB')
      if (fileSizeKB > maxSizeKB) {
        alert(`Logo file is too large (${fileSizeKB.toFixed(0)}KB). Please upload an image smaller than ${maxSizeKB}KB.`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        console.log('Base64 length:', (reader.result as string).length, 'characters')
      }
      reader.readAsDataURL(file)
      handleFieldChange()
    }
  }

  const handleLogoRemove = () => {
    setLogoPreview(null)
  }
const handleCreate = async () => {
  const errors: { name?: string; techStack?: string } = {}

  // Validate project name
  if (!name.trim()) {
    errors.name = 'Project name is required'
  } else if (name.trim().length < 3) {
    errors.name = 'Project name must be at least 3 characters'
  }

  // Validate tech stack
  if (selectedSkills.length === 0) {
    errors.techStack = 'Please add at least one tech skill'
  }

  // Validate other required fields
  if (!teamSize || !startDate || !deadline) {
    setError("Please fill all required fields")
    setFieldErrors(errors)
    return
  }

  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors)
    return
  }

  if (Number(teamSize) > 500) {
    setError("Team size cannot exceed 500")
    return
  }

  setStep('generating')
  setError('')
  setFieldErrors({})

  // Clear saved draft data
  localStorage.removeItem('createProjectDraft')

  try {
    console.log('Creating project with logo:', logoPreview ? 'Yes' : 'No', logoPreview?.substring(0, 50) + '...')
    
    let project: Project
    if (editProjectId) {
      // Update existing project
      project = await api.put<Project>(`/projects/${editProjectId}`, {
        name,
        description: description.trim() || null,
        type: TYPE_MAP[projectType] ?? 'saas',
        startDate,
        deadline,
        teamSize: Number(teamSize),
        techStack: selectedSkills.join(', '),
        projectType: projectType || null,
        methodology: methodology.trim() || null,
        workingHours: workingHours ? Number(workingHours) : null,
        logo: logoPreview,
        teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
      })
    } else {
      // Create new project
      project = await createProject({
        name,
        description: description.trim() || null,
        type: TYPE_MAP[projectType] ?? 'saas',
        startDate,
        deadline,
        teamSize: Number(teamSize),
        techStack: selectedSkills.join(', '),
        projectType: projectType || null,
        methodology: methodology.trim() || null,
        workingHours: workingHours ? Number(workingHours) : null,
        logo: logoPreview,
        teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
      })
    }

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
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to generate features. Please try again later.'
    setError(errorMessage)
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
      <div className={`min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4 sm:p-8`}>
        <div className={`${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white p-8 sm:p-14 text-center ${SHADOW.card} max-w-sm w-full dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)]`}>
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center ${BORDER_RADIUS.card} bg-[var(--bg-accent-subtle)] dark:bg-[var(--color-primary)]/10`}>
            <svg className={`h-8 w-8 animate-spin text-[var(--color-primary)] dark:text-[var(--color-primary)]`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>

          <h2 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>
            Generating features with AI
          </h2>
          <p className={`mt-2 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
            Analysing your project details and building the initial feature list…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] dark:bg-gray-900">
      <div className={`mx-auto max-w-5xl ${SPACING.page.padding} py-6 sm:py-8 lg:py-10`}>

        {/* Header */}
        <div className={`sticky top-0 z-10 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-[var(--bg-page)] py-4 dark:bg-gray-900`}>
          <div>
            <h1 className={`${TYPOGRAPHY.pageTitle} text-[var(--text-primary)] dark:text-[var(--text-primary)]`}>
              {editProjectId ? 'Edit Project Details' : 'Create New Project'}
            </h1>
            <p className={`mt-1 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
              {editProjectId 
                ? 'Update project details — AI will regenerate features based on your changes'
                : 'Fill in the details — AI will generate Requirements based on structured inputs'
              }
            </p>
          </div>
        </div>

        {error && (
          <div className={`mb-6 flex items-center gap-3 ${BORDER_RADIUS.card} border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800 dark:bg-red-900/30`}>
            <p className={`${TYPOGRAPHY.body} text-red-700 dark:text-red-400`}>{error}</p>
          </div>
        )}

        <div className={`space-y-5 ${SPACING.section.gap}`}>

          {/* CORE */}
          <SectionCard
            title="Project Identity"
            description="Core inputs drive AI Requirement generation quality."
          >
            <div className={`grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 ${SPACING.section.gap}`}>
              <div>
                <label className={labelCls}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    handleFieldChange('name')
                  }}
                  onBlur={() => handleFieldChange('name')}
                  placeholder="e.g. Customer Portal MVP"
                  className={`${inputCls} ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                />
                {fieldErrors.name && (
                  <p className={`mt-1.5 ${TYPOGRAPHY.caption} text-red-600 dark:text-red-400`}>{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    handleFieldChange()
                  }}
                  placeholder="Describe what this project does..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="mt-4 sm:mt-5">
              <label className={labelCls}>Project Logo (Optional)</label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {logoPreview ? (
                  <div className={`relative h-20 w-20 shrink-0 overflow-hidden ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700`}>
                    <img
                      src={logoPreview}
                      alt="Project logo preview"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center ${BORDER_RADIUS.tag} bg-[var(--color-danger)] text-white shadow-md ${TRANSITION} hover:bg-red-600`}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-xl border-2 border-dashed border-[var(--border-secondary)] bg-[var(--bg-section)] flex items-center justify-center dark:border-gray-600 dark:bg-gray-700">
                    <svg className="h-8 w-8 text-[var(--text-subtle)] dark:text-[var(--text-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex cursor-pointer items-center gap-2 ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] ${SHADOW.card} ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
                  >
                    <svg className={`h-4 w-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <p className={`mt-1.5 ${TYPOGRAPHY.caption} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
                    Upload a logo or image for your project reference. PNG, JPG, or SVG up to 500KB.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* CONTEXT */}
<SectionCard
  title="Team & Context"
  description="Helps AI understand constraints and complexity."
>
  <div className={`grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${SPACING.section.gap}`}>

   <div>
  <label className={labelCls}>Tech Stack <span className="text-red-500">*</span></label>

  <div className="relative">
    <div className={`flex flex-wrap gap-2 ${BORDER_RADIUS.input} border p-3 min-h-[52px] ${fieldErrors.techStack ? 'border-red-500 ' : 'border-[var(--border-primary)] dark:border-gray-600'}`}>
      
      {selectedSkills.map((skill) => (
        <span
          key={skill}
          className={`flex items-center gap-1 ${BORDER_RADIUS.tag} bg-[var(--color-primary-50)] px-3 py-1 ${TYPOGRAPHY.body} text-[var(--color-primary-dark)] dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)]`}
        >
          {skill}

          <button
            type="button"
            onClick={() => {
              setSelectedSkills(
                selectedSkills.filter((s) => s !== skill)
              )
              handleFieldChange('techStack')
            }}
          >
            ×
          </button>
        </span>
      ))}

      <input
        ref={techStackInputRef}
        value={techStackInput}
        onChange={(e) => {
          const value = e.target.value
          setTechStackInput(value)
          handleFieldChange('techStack')

          // Check if input contains comma (paste of comma-separated list)
          if (value.includes(',')) {
            const newSkills = value
              .split(',')
              .map(s => s.trim())
              .filter(s => s && !selectedSkills.includes(s))

            if (newSkills.length > 0) {
              setSelectedSkills([...selectedSkills, ...newSkills])
              setTechStackInput('')
            }
          }

          // Check if input contains multiple spaces (paste of space-separated list)
          // Only split if there are multiple words (more than 2 spaces or the input looks like a list)
          const spaceCount = (value.match(/ /g) || []).length
          if (spaceCount >= 2) {
            const newSkills = value
              .split(/\s+/)
              .map(s => s.trim())
              .filter(s => s && !selectedSkills.includes(s))

            if (newSkills.length > 0) {
              setSelectedSkills([...selectedSkills, ...newSkills])
              setTechStackInput('')
            }
          }
        }}
        placeholder={
  selectedSkills.length
    ? ''
    : 'Search or type a skill...'}
        className={`flex-1 min-w-[120px] outline-none ${TYPOGRAPHY.body}`}
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
    handleFieldChange('techStack')

    // Keep focus on input after adding skill
    setTimeout(() => {
      techStackInputRef.current?.focus()
    }, 0)
  }
}}
      />
    </div>
    {fieldErrors.techStack && (
      <p className={`mt-1.5 ${TYPOGRAPHY.caption} text-red-600 dark:text-red-400`}>{fieldErrors.techStack}</p>
    )}

    {techStackInput && filteredSkills.length > 0 && (
      <div className={`absolute z-10 mt-1 w-full ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:shadow-gray-900/30`}>
        {filteredSkills.slice(0, 8).map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => {
              setSelectedSkills([...selectedSkills, skill])
              setTechStackInput('')
              setTimeout(() => {
                techStackInputRef.current?.focus()
              }, 0)
            }}
            className={`block w-full px-4 py-2 text-left ${TYPOGRAPHY.body} hover:bg-[var(--bg-section)] dark:hover:bg-gray-700 dark:text-gray-200`}
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
            handleFieldChange()
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
        onChange={(e) => {
          setStartDate(e.target.value)
          handleFieldChange()
        }}
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
        onChange={(e) => {
          setDeadline(e.target.value)
          handleFieldChange()
        }}
        min={startDate || new Date().toISOString().split('T')[0]}
      />
    </div>

    <div className="lg:col-span-3">
      <label className={labelCls}>Team Members (Optional)</label>
      <div className="relative" ref={userDropdownRef}>
        <div className={`flex flex-wrap gap-2 ${BORDER_RADIUS.input} border p-3 min-h-[52px] border-[var(--border-primary)] dark:border-gray-600`}>
          {teamMembers.map((memberId) => {
            const user = availableUsers.find((u: any) => u.id === memberId)
            return (
              <span
                key={memberId}
                className={`flex items-center gap-2 ${BORDER_RADIUS.tag} bg-[var(--color-primary)]/10 px-3 py-1 ${TYPOGRAPHY.body} text-[var(--color-primary)] dark:bg-[var(--color-primary)]/10 dark:text-[var(--color-primary)]`}
              >
                {user?.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                {user?.name || 'Unknown'}
                <button
                  type="button"
                  onClick={() => {
                    setTeamMembers(teamMembers.filter((id) => id !== memberId))
                    handleFieldChange()
                  }}
                >
                  ×
                </button>
              </span>
            )
          })}
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => {
              setUserSearchQuery(e.target.value)
              setShowUserDropdown(true)
            }}
            onFocus={() => setShowUserDropdown(true)}
            placeholder={teamMembers.length ? '' : 'Search team members...'}
            className={`flex-1 min-w-[120px] outline-none ${TYPOGRAPHY.body}`}
          />
        </div>

        {showUserDropdown && (
          <div className={`absolute z-10 mt-1 w-full ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:shadow-gray-900/30 max-h-64 overflow-y-auto`}>
            {availableUsers
              .filter((user: any) => {
                const searchLower = userSearchQuery.toLowerCase()
                return (
                  !teamMembers.includes(user.id) &&
                  (user.name?.toLowerCase().includes(searchLower) ||
                   user.email?.toLowerCase().includes(searchLower))
                )
              })
              .slice(0, 10)
              .map((user: any) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setTeamMembers([...teamMembers, user.id])
                    setUserSearchQuery('')
                    setShowUserDropdown(false)
                    handleFieldChange()
                  }}
                  className={`block w-full px-4 py-3 text-left ${TYPOGRAPHY.body} hover:bg-[var(--bg-section)] dark:hover:bg-gray-700 dark:text-gray-200 flex items-center gap-3`}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name || 'Unknown'}</p>
                    <p className={`text-xs truncate text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>{user.email}</p>
                  </div>
                </button>
              ))}
            {availableUsers.filter((user: any) => {
              const searchLower = userSearchQuery.toLowerCase()
              return (
                !teamMembers.includes(user.id) &&
                (user.name?.toLowerCase().includes(searchLower) ||
                 user.email?.toLowerCase().includes(searchLower))
              )
            }).length === 0 && (
              <div className={`px-4 py-3 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
                No users found
              </div>
            )}
          </div>
        )}
      </div>
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
    <div className={`grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${TRANSITION} duration-300 ${SPACING.section.gap}`}>

<div>
  <label className={labelCls}>Project Type</label>

  {isCustomProjectType ? (
    <div className="relative">
      <input
        className={`${inputCls} pr-10`}
        placeholder="Enter project type"
        value={projectType}
        onChange={(e) => {
          setProjectType(e.target.value)
          handleFieldChange()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && projectType.trim()) {
            e.preventDefault()
            if (!customProjectTypes.includes(projectType.trim())) {
              setCustomProjectTypes([...customProjectTypes, projectType.trim()])
            }
            setIsCustomProjectType(false)
            handleFieldChange()
          }
        }}
        onBlur={() => {
          if (projectType.trim() && !customProjectTypes.includes(projectType.trim())) {
            setCustomProjectTypes([...customProjectTypes, projectType.trim()])
          }
        }}
      />

      <button
        type="button"
        onClick={() => {
          setProjectType('')
          setIsCustomProjectType(false)
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)] dark:text-[var(--text-soft)] dark:hover:text-gray-300"
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
            handleFieldChange()
          }
        }}
      >
        <option value="">Select</option>

        {PROJECT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}

        {customProjectTypes.map((t) => (
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
        onChange={(e) => {
          setMethodology(e.target.value)
          handleFieldChange()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && methodology.trim()) {
            e.preventDefault()
            if (!customMethodologies.includes(methodology.trim())) {
              setCustomMethodologies([...customMethodologies, methodology.trim()])
            }
            setIsCustomMethodology(false)
            handleFieldChange()
          }
        }}
        onBlur={() => {
          if (methodology.trim() && !customMethodologies.includes(methodology.trim())) {
            setCustomMethodologies([...customMethodologies, methodology.trim()])
          }
        }}
      />

      <button
        type="button"
        onClick={() => {
          setMethodology('')
          setIsCustomMethodology(false)
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)] dark:text-[var(--text-soft)] dark:hover:text-gray-300"
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
            handleFieldChange()
          }
        }}
      >
        <option value="">Select</option>
        <option value="agile">Agile</option>
        <option value="scrum">Scrum</option>
        <option value="kanban">Kanban</option>
        <option value="waterfall">Waterfall</option>

        {customMethodologies.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}

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
      handleFieldChange()
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
        <div className={`mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${BORDER_RADIUS.card} border border-[var(--border-primary)] bg-white px-4 sm:px-6 py-4 ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>
          <div className={`flex items-center gap-2 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)] text-center sm:text-left`}>
            AI will generate 6–10 Requirements based on your inputs
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {hasUnsavedChanges && (
              <button
                onClick={handleCancel}
                className={`${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white px-5 py-2.5 ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleCreate}
             disabled={
  !name.trim() ||
  !teamSize ||
  !startDate ||
  !deadline ||
  selectedSkills.length === 0
}
              className={`flex items-center gap-2 ${BORDER_RADIUS.button} bg-[var(--color-primary)] px-7 py-2.5 ${TYPOGRAPHY.body} font-semibold text-white ${SHADOW.card} ${TRANSITION} hover:bg-[var(--color-primary-hover)] disabled:opacity-50`}
            >
              {editProjectId ? 'Update & Regenerate Features' : 'Create Project & Generate Requirements'}
            </button>
          </div>
        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setShowCancelConfirm(false)}
          />
          {/* Dialog */}
          <div className={`relative w-full max-w-md mx-auto ${BORDER_RADIUS.modal} bg-white ${SHADOW.modal} ${SPACING.card.padding} text-center dark:bg-gray-800 dark:shadow-gray-900/30`}>
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center ${BORDER_RADIUS.tag} bg-amber-50 dark:bg-amber-900/30`}>
              <svg className={`h-7 w-7 text-[var(--color-warning)] dark:text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className={`${TYPOGRAPHY.sectionHeader} text-[var(--text-primary)] dark:text-gray-100`}>Unsaved Changes</h2>
            <p className={`mt-2 ${TYPOGRAPHY.body} text-[var(--text-soft)] dark:text-[var(--text-subtle)]`}>
              You have unsaved changes. Are you sure you want to cancel?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className={`flex-1 ${BORDER_RADIUS.button} border border-[var(--border-primary)] bg-white ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] ${TRANSITION} hover:bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className={`flex flex-1 items-center justify-center gap-2 ${BORDER_RADIUS.button} bg-[var(--color-danger)] ${SPACING.button.secondary} ${TYPOGRAPHY.body} font-semibold text-white ${TRANSITION} hover:bg-red-600`}
              >
                Cancel Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  )
}