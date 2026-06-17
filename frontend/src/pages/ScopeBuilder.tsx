import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import type { Feature } from '../types'

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
}: {
  initial?: FeatureFormData
  onSave: (data: FeatureFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const handleSave = async () => {
    if (!title.trim()) return
    await onSave({ title: title.trim(), description: description.trim() })
  }

  const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
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
            placeholder="e.g. User Registration"
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
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : initial ? 'Update' : 'Add Feature'}
        </button>
      </div>
    </div>
  )
}

export function ScopeBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project') ?? ''

  const { getProject, getProjectFeatures, addFeature, updateFeature, deleteFeature } =
    useProjects()

  const project = getProject(projectId)
  const features = getProjectFeatures(projectId, 'original')

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingAdd, setSavingAdd] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdd = async (data: FeatureFormData) => {
    setSavingAdd(true)
    try {
      await addFeature(projectId, {
        title: data.title,
        description: data.description,
        category: 'general',
        priority: 'medium',
        type: 'original',
      })
      setShowAddForm(false)
    } finally {
      setSavingAdd(false)
    }
  }

  const handleEdit = async (feature: Feature, data: FeatureFormData) => {
    setSavingEdit(true)
    try {
      await updateFeature(feature.id, {
        title: data.title,
        description: data.description,
      })
      setEditingId(null)
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* Card header */}
          <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Enter Original Scope</h1>
              <p className="mt-1 text-sm text-gray-500">
                Add all the features that are included in the original scope
              </p>
            </div>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null) }}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Feature
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-4">

            {/* Inline add form */}
            {showAddForm && (
              <FeatureForm
                onSave={handleAdd}
                onCancel={() => setShowAddForm(false)}
                saving={savingAdd}
              />
            )}

            {/* Feature list */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Feature List (Original Scope)
              </p>

              {features.length === 0 && !showAddForm ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">No features yet</p>
                  <p className="mt-1 text-xs text-gray-400">Click "+ Add Feature" to define the original scope</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {features.map((feature, index) => (
                    <div key={feature.id}>
                      {editingId === feature.id ? (
                        <div className="p-4">
                          <FeatureForm
                            initial={{ title: feature.title, description: feature.description }}
                            onSave={(data) => handleEdit(feature, data)}
                            onCancel={() => setEditingId(null)}
                            saving={savingEdit}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50/60">
                          {/* Number badge */}
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {index + 1}
                          </div>

                          {/* Title + description */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {feature.title}
                            </p>
                            {feature.description && (
                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                {feature.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() => { setEditingId(feature.id); setShowAddForm(false) }}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                              title="Edit"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              onClick={() => handleDelete(feature.id)}
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
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-8 py-5">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate('/')}
              disabled={features.length === 0}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Save & Continue
            </button>
          </div>

        </div>

        {/* Project context hint */}
        {project && (
          <p className="mt-3 text-center text-xs text-gray-400">
            Project: <span className="font-medium text-gray-500">{project.name}</span>
          </p>
        )}

      </div>
    </div>
  )
}
