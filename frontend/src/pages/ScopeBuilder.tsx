import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
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

  const handleSave = async () => {
    if (!title.trim()) return
    await onSave({ title: title.trim(), description: description.trim() })
  }

  const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

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
            onChange={(e) => setTitle(e.target.value)}
            placeholder={tabType === 'new' ? 'e.g. Multi-language support' : 'e.g. User Registration'}
            className={inputCls}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this feature"
            className={inputCls}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
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
      <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
        <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${tabType === 'new' ? 'bg-emerald-50 text-emerald-400' : 'bg-indigo-50 text-indigo-400'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-600">No features yet</p>
        <p className="mt-1 text-xs text-gray-400">
          {tabType === 'new'
            ? 'Add features the client requested after the original scope was agreed'
            : 'Add the features that are included in the original agreed scope'}
        </p>
      </div>
    )
  }



  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      {features.map((feature, index) => (
        <div
          key={feature.id}
          onDragOver={(e) => { e.preventDefault(); setDragOverId(feature.id) }}
          onDrop={() => handleDrop(feature.id)}
          onDragLeave={() => setDragOverId(null)}
          className={`transition-colors ${dragOverId === feature.id && dragId !== feature.id ? 'bg-indigo-50 border-l-2 border-l-indigo-400' : ''}`}
        >
          {editingId === feature.id ? (
            <div className="p-4">
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
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition ${dragId === feature.id ? 'opacity-40' : ''}`}
            >
              {/* Drag handle */}
              <div className="cursor-grab text-gray-300 hover:text-gray-400 shrink-0 active:cursor-grabbing">
                <GripIcon />
              </div>

              {/* Number badge */}
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                tabType === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {index + 1}
              </div>

              {/* Title + description */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{feature.title}</p>
                {feature.description && (
                  <p className="mt-0.5 truncate text-xs text-gray-500">{feature.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => onEdit(feature.id)}
                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  title="Edit"
                >
                  <PencilIcon />
                </button>
                <button
  onClick={() => onRequestDelete(feature.id)}
  disabled={deletingId === feature.id}
  className="rounded-md p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
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

  const {
    projects,
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

  const handleAdd = async (data: FeatureFormData) => {
    if (!projectId) return
    setSavingAdd(true)
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
    } catch (err: any) {
      setAddError(err.message ?? 'Failed to save feature. Please try again.')
    } finally {
      setSavingAdd(false)
    }
  }

  const handleEdit = async (feature: Feature, data: FeatureFormData) => {
    setSavingEdit(true)
    try {
      await updateFeature(feature.id, { title: data.title, description: data.description })
      setEditingId(null)
    } catch {
      // silently keep form open
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteFeature(id)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm max-w-md w-full">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No project selected</h2>
          <p className="mt-2 text-sm text-gray-500">
            Open a project from the dashboard or projects page to start building its scope.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Dashboard
            </Link>
            <Link to="/projects" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
              View Projects
            </Link>
          </div>
          {projects.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="mb-3 text-xs font-medium text-gray-500">Or jump to a project:</p>
              <div className="space-y-2">
                {projects.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={`/scope-builder?project=${p.id}`}
                    className="block rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Scope Builder</h1>
            {project && (
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{project.name}</span> — define original scope and client additions
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/analyzing?project=${projectId}`)}
            disabled={originalFeatures.length === 0}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Run Analysis
          </button>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => handleTabSwitch('original')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'original'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Original Scope
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === 'original' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {originalFeatures.length}
            </span>
          </button>
          <button
            onClick={() => handleTabSwitch('new')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'new'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New Client Additions
            {newFeatures.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === 'new' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {newFeatures.length}
              </span>
            )}
          </button>
        </div>

        {/* Context hint */}
        {activeTab === 'new' && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <svg className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-emerald-800">
              <span className="font-semibold">Scope Creep Analysis:</span> Features added here represent what the client requested <em>after</em> the original scope was agreed. Running the analysis will calculate the exact hours, delay weeks, and risk these additions introduce.
            </p>
          </div>
        )}

        {/* Main card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Card header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {activeTab === 'original' ? 'Original Scope Features' : 'Client-Requested Additions'}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {activeTab === 'original'
                  ? 'Features agreed in the initial project contract'
                  : 'New features added after original scope was locked'}
              </p>
            </div>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); setAddError('') }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                activeTab === 'new' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Feature
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

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
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
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
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <h2 className="text-lg font-semibold text-gray-900">
        Delete Feature?
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setConfirmDeleteId(null)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await handleDelete(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
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
