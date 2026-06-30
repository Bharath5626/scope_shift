import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { EmptyState } from '../components/EmptyState'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION, ICON_SIZE } from '../utils/designSystem'
import type { Feature } from '../types'

type ScopeTab = 'original' | 'new'

function GripIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

interface FeatureFormData {
  title: string
  description: string
}

function FeatureForm({
  initial,
  onSave,
  onCancel,
  saving,
  tabType,
}: {
  initial?: FeatureFormData
  onSave: (data: FeatureFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
  tabType: ScopeTab
}) {
  
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [titleError, setTitleError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  const validateForm = (): boolean => {
    let isValid = true
    
    if (!title.trim()) {
      setTitleError('Feature title is required')
      isValid = false
    } else if (title.length > 100) {
      setTitleError('Title must be less than 100 characters')
      isValid = false
    } else {
      setTitleError('')
    }
    
    if (description.length > 200) {
      setDescriptionError('Description must be less than 200 characters')
      isValid = false
    } else {
      setDescriptionError('')
    }
    
    return isValid
  }

  const handleSave = async () => {
    if (!validateForm()) return
    await onSave({ title: title.trim(), description: description.trim() })
  }

  const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500'

  const accentBg = tabType === 'new' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-indigo-50/40 border-indigo-200'

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${accentBg}`}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Feature Title <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (titleError) setTitleError('')
            }}
            placeholder={tabType === 'new' ? 'e.g. Multi-language support' : 'e.g. User Registration'}
            className={`${inputCls} ${titleError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            aria-invalid={!!titleError}
            aria-describedby={titleError ? 'title-error' : undefined}
          />
          {titleError && (
            <p id="title-error" className="mt-1 text-xs text-red-600">{titleError}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (descriptionError) setDescriptionError('')
            }}
            placeholder="Brief description of this feature"
            className={`${inputCls} ${descriptionError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            aria-invalid={!!descriptionError}
            aria-describedby={descriptionError ? 'description-error' : undefined}
          />
          {descriptionError && (
            <p id="description-error" className="mt-1 text-xs text-red-600">{descriptionError}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition disabled:opacity-50 ${
            tabType === 'new' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {saving ? 'Saving…' : initial ? 'Update' : 'Add Feature'}
        </button>
      </div>
    </div>
  )
}

interface FeatureListProps {
  features: Feature[]
  tabType: ScopeTab
  projectId: string
  onEdit: (id: string) => void
  onRequestDelete: (id: string) => void
  onReorder: (ids: string[]) => void
  editingId: string | null
  onSaveEdit: (feature: Feature, data: FeatureFormData) => Promise<void>
  onCancelEdit: () => void
  savingEdit: boolean
  deletingId: string | null
}

function FeatureList({
  features,
  tabType,
  onEdit,
  onRequestDelete,
  onReorder,
  editingId,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
  deletingId,
}: FeatureListProps) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const ids = features.map((f) => f.id)
    const fromIdx = ids.indexOf(dragId)
    const toIdx = ids.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) return
    const newIds = [...ids]
    newIds.splice(fromIdx, 1)
    newIds.splice(toIdx, 0, dragId)
    onReorder(newIds)
    setDragId(null)
    setDragOverId(null)
  }

  if (features.length === 0) {
    return (
      <EmptyState
        title="No features yet"
        description={
          tabType === 'new'
            ? 'Add features the client requested after the original scope was agreed'
            : 'Add the features that are included in the original agreed scope'
        }
        size="sm"
        className={`${BORDER_RADIUS.card} border border-dashed border-gray-200`}
      />
    )
  }



  return (
    <div className={`divide-y divide-gray-100 ${BORDER_RADIUS.card} border border-gray-200 overflow-hidden`}>
      {features.map((feature, index) => (
        <div
          key={feature.id}
          onDragOver={(e) => { e.preventDefault(); setDragOverId(feature.id) }}
          onDrop={() => handleDrop(feature.id)}
          onDragLeave={() => setDragOverId(null)}
          className={`transition-colors ${dragOverId === feature.id && dragId !== feature.id ? 'bg-indigo-50 border-l-2 border-l-indigo-400' : ''}`}
        >
          {editingId === feature.id ? (
            <div className={SPACING.card.compactPadding}>
              <FeatureForm
                initial={{ title: feature.title, description: feature.description }}
                onSave={(data) => onSaveEdit(feature, data)}
                onCancel={onCancelEdit}
                saving={savingEdit}
                tabType={tabType}
              />
            </div>
          ) : (
            <div
              draggable
              onDragStart={() => setDragId(feature.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null) }}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 ${TRANSITION} ${dragId === feature.id ? 'opacity-40' : ''}`}
            >
              {/* Drag handle */}
              <div className="cursor-grab text-gray-300 hover:text-gray-400 shrink-0 active:cursor-grabbing">
                <GripIcon />
              </div>

              {/* Number badge */}
              <div className={`flex ${ICON_SIZE.button} shrink-0 items-center justify-center ${BORDER_RADIUS.tag} ${TYPOGRAPHY.caption} font-semibold ${
                tabType === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {index + 1}
              </div>

              {/* Title + description */}
              <div className="min-w-0 flex-1">
                <p className={`truncate ${TYPOGRAPHY.body} font-semibold text-gray-900 dark:text-gray-100`}>{feature.title}</p>
                {feature.description && (
                  <p className={`mt-0.5 truncate ${TYPOGRAPHY.caption} text-gray-500 dark:text-gray-400`}>{feature.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => onEdit(feature.id)}
                  className={`${BORDER_RADIUS.small} p-1.5 text-gray-400 ${TRANSITION} hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300`}
                  title="Edit"
                >
                  <PencilIcon />
                </button>
                <button
  onClick={() => onRequestDelete(feature.id)}
  disabled={deletingId === feature.id}
  className="rounded-md p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/30 dark:hover:text-red-300"
  title="Delete"
>
  <TrashIcon />
</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function ScopeBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project') ?? ''
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const {
    getProject,
    getProjectFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
    reorderFeatures,
    setActiveProjectId,
  } = useProjects()

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId)
  }, [projectId, setActiveProjectId])

  const project = getProject(projectId)
  const originalFeatures = getProjectFeatures(projectId, 'original')
  const newFeatures = getProjectFeatures(projectId, 'new')

  const [activeTab, setActiveTab] = useState<ScopeTab>('original')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingAdd, setSavingAdd] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addError, setAddError] = useState('')

  const activeFeatures = activeTab === 'original' ? originalFeatures : newFeatures

  // Autosave indicator reset
  useEffect(() => {
    if (autosaveStatus === 'saved') {
      const timer = setTimeout(() => setAutosaveStatus('idle'), 2000)
      return () => clearTimeout(timer)
    }
  }, [autosaveStatus])

  const handleAdd = async (data: FeatureFormData) => {
    if (!projectId) return
    setSavingAdd(true)
    setAutosaveStatus('saving')
    setAddError('')
    try {
      await addFeature(projectId, {
        title: data.title,
        description: data.description,
        category: 'general',
        priority: 'medium',
        type: activeTab,
      })
      setShowAddForm(false)
      setAutosaveStatus('saved')
    } catch (err: any) {
      setAddError(err.message ?? 'Failed to save feature. Please try again.')
      setAutosaveStatus('error')
    } finally {
      setSavingAdd(false)
    }
  }

  const handleEdit = async (feature: Feature, data: FeatureFormData) => {
    setSavingEdit(true)
    setAutosaveStatus('saving')
    try {
      await updateFeature(feature.id, { title: data.title, description: data.description })
      setEditingId(null)
      setAutosaveStatus('saved')
    } catch {
      setAutosaveStatus('error')
      // silently keep form open
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setAutosaveStatus('saving')
    try {
      await deleteFeature(id)
      setAutosaveStatus('saved')
    } catch {
      setAutosaveStatus('error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleReorder = async (newIds: string[]) => {
    if (!projectId) return
    await reorderFeatures(projectId, newIds)
  }

  const handleTabSwitch = (tab: ScopeTab) => {
    setActiveTab(tab)
    setShowAddForm(false)
    setEditingId(null)
    setAddError('')
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 dark:bg-gray-900">
        <EmptyState
          title="No project selected"
          description="Open a project from the dashboard or projects page to start building its scope."
          action={{
            label: 'View Projects',
            onClick: () => navigate('/projects'),
          }}
          secondaryAction={{
            label: 'Dashboard',
            onClick: () => navigate('/'),
          }}
          size="md"
          className="max-w-md w-full"
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${SPACING.page.padding} dark:bg-gray-900`}>
      <div className="mx-auto max-w-3xl">

        {/* Page header */}
        <div className={`mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4`}>
          <div>
            <h1 className={`${TYPOGRAPHY.pageTitle} text-gray-900 dark:text-gray-100`}>Scope Builder</h1>
            {project && (
              <p className={`mt-1 ${TYPOGRAPHY.body} text-gray-500 dark:text-gray-400`}>
                <span className="font-medium text-gray-700 dark:text-gray-300">{project.name}</span> — define original scope and client additions
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Autosave indicator */}
            {autosaveStatus !== 'idle' && (
              <div className={`flex items-center gap-2 ${TYPOGRAPHY.caption}`}>
                {autosaveStatus === 'saving' && (
                  <>
                    <div className={`${ICON_SIZE.button} animate-spin rounded-full border-2 border-indigo-600 border-t-transparent`} />
                    <span className="text-gray-500 dark:text-gray-400">Saving...</span>
                  </>
                )}
                {autosaveStatus === 'saved' && (
                  <>
                    <svg className={`${ICON_SIZE.button} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600 dark:text-green-400">Saved</span>
                  </>
                )}
                {autosaveStatus === 'error' && (
                  <>
                    <svg className={`${ICON_SIZE.button} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-red-600 dark:text-red-400">Error saving</span>
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => navigate(`/analyzing?project=${projectId}`)}
              disabled={originalFeatures.length === 0}
              className={`flex items-center gap-2 ${BORDER_RADIUS.button} bg-indigo-600 ${SPACING.button.primary} ${TYPOGRAPHY.body} font-semibold text-white ${SHADOW.card} ${TRANSITION} hover:bg-indigo-700 disabled:opacity-40`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="hidden sm:inline">Run Analysis</span>
              <span className="sm:hidden">Analyze</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className={`mb-6 flex gap-1 ${BORDER_RADIUS.card} border border-gray-200 bg-white p-1 ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>
          <button
            onClick={() => handleTabSwitch('original')}
            className={`flex flex-1 items-center justify-center gap-2 ${BORDER_RADIUS.small} px-4 py-2.5 ${TYPOGRAPHY.body} font-semibold ${TRANSITION} ${
              activeTab === 'original'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-pressed={activeTab === 'original'}
            role="tab"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Original Scope
            <span className={`${BORDER_RADIUS.tag} px-2 py-0.5 ${TYPOGRAPHY.caption} font-bold ${
              activeTab === 'original' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
            }`}>
              {originalFeatures.length}
            </span>
          </button>
          <button
            onClick={() => handleTabSwitch('new')}
            className={`flex flex-1 items-center justify-center gap-2 ${BORDER_RADIUS.small} px-4 py-2.5 ${TYPOGRAPHY.body} font-semibold ${TRANSITION} ${
              activeTab === 'new'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-pressed={activeTab === 'new'}
            role="tab"
          >
            <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New Client Additions
            {newFeatures.length > 0 && (
              <span className={`${BORDER_RADIUS.tag} px-2 py-0.5 ${TYPOGRAPHY.caption} font-bold ${
                activeTab === 'new' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {newFeatures.length}
              </span>
            )}
          </button>
        </div>

        {/* Context hint */}
        {activeTab === 'new' && (
          <div className={`mb-4 flex items-start gap-3 ${BORDER_RADIUS.card} border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20`}>
            <svg className={`${ICON_SIZE.button} mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`${TYPOGRAPHY.caption} text-emerald-800 dark:text-emerald-200`}>
              <span className="font-semibold">Scope Creep Analysis:</span> Features added here represent what the client requested <em>after</em> the original scope was agreed. Running the analysis will calculate the exact hours, delay weeks, and risk these additions introduce.
            </p>
          </div>
        )}

        {/* Main card */}
        <div className={`${BORDER_RADIUS.card} border border-gray-200 bg-white ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>

          {/* Card header */}
          <div className={`flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700`}>
            <div>
              <h2 className={`${TYPOGRAPHY.body} font-semibold text-gray-900 dark:text-gray-100`}>
                {activeTab === 'original' ? 'Original Scope Features' : 'Client-Requested Additions'}
              </h2>
              <p className={`mt-0.5 ${TYPOGRAPHY.caption} text-gray-500 dark:text-gray-400`}>
                {activeTab === 'original'
                  ? 'Features agreed in the initial project contract'
                  : 'New features added after original scope was locked'}
              </p>
            </div>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); setAddError('') }}
              className={`flex items-center gap-2 ${BORDER_RADIUS.button} px-4 py-2 ${TYPOGRAPHY.body} font-semibold text-white ${SHADOW.card} ${TRANSITION} ${
                activeTab === 'new' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <svg className={ICON_SIZE.button} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Feature
            </button>
          </div>

          {/* Body */}
          <div className={`px-6 py-5 space-y-4 ${SPACING.section.gap}`}>

            {/* Inline add form */}
            {showAddForm && (
              <>
                <FeatureForm
                  onSave={handleAdd}
                  onCancel={() => { setShowAddForm(false); setAddError('') }}
                  saving={savingAdd}
                  tabType={activeTab}
                />
                {addError && (
                  <div className={`${BORDER_RADIUS.small} border border-red-200 bg-red-50 px-4 py-2.5 ${TYPOGRAPHY.body} text-red-600`}>
                    {addError}
                  </div>
                )}
              </>
            )}

            {/* Section label */}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {activeTab === 'original' ? 'Original Scope' : 'New Additions'} ({activeFeatures.length} feature{activeFeatures.length !== 1 ? 's' : ''})
            </p>

            {/* Feature list */}
            <FeatureList
              features={activeFeatures}
              tabType={activeTab}
              projectId={projectId}
              onEdit={(id) => { setEditingId(id); setShowAddForm(false) }}
              onRequestDelete={(id) => setConfirmDeleteId(id)}
              onReorder={handleReorder}
              editingId={editingId}
              onSaveEdit={handleEdit}
              onCancelEdit={() => setEditingId(null)}
              savingEdit={savingEdit}
              deletingId={deletingId}
            />

            {activeFeatures.length > 1 && (
              <p className="text-center text-xs text-gray-400">
                Drag the <span className="font-medium">⠿ grip</span> handle to reorder features
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              {newFeatures.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {newFeatures.length} new addition{newFeatures.length !== 1 ? 's' : ''} — scope creep analysis ready
                </span>
              )}
              <button
                onClick={() => navigate(`/analyzing?project=${projectId}`)}
                disabled={originalFeatures.length === 0}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {newFeatures.length > 0 ? 'Run Scope Creep Analysis →' : 'Run Analysis →'}
              </button>
            </div>
          </div>
        </div>

      </div>
      {confirmDeleteId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 dark:shadow-gray-900/20">

      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Delete Feature?
      </h2>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setConfirmDeleteId(null)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await handleDelete(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
    </div>
    
  )
}
