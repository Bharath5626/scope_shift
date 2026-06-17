import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  Analysis,
  AppState,
  CreateFeatureInput,
  CreateProjectInput,
  Feature,
  Project,
  UpdateFeatureInput,
} from '../types'

import { loadState, saveState, seedDemoData } from '../services/storage'
import { generateId } from '../utils/formatters'

interface ProjectContextValue extends AppState {
  createProject: (input: CreateProjectInput) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string | null) => Project | undefined
  getProjectFeatures: (projectId: string, type?: Feature['type']) => Feature[]
  addFeature: (projectId: string, input: CreateFeatureInput) => Feature
  updateFeature: (id: string, updates: UpdateFeatureInput) => void
  deleteFeature: (id: string) => void
  reorderFeatures: (projectId: string, orderedIds: string[]) => void
  getLatestAnalysis: (projectId: string) => Analysis | undefined
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState()
    if (loaded.projects.length === 0) {
      return seedDemoData()
    }
    return loaded
  })

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  // ✅ Sync URL → active project (IMPORTANT FIX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get('project')

    if (projectId) {
      setActiveProjectId(projectId)
    }
  }, [])

  // ✅ Persist state
  useEffect(() => {
    saveState(state)
  }, [state])

  const createProject = useCallback((input: CreateProjectInput): Project => {
    const now = new Date().toISOString()

    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description,
      type: input.type,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }

    setState((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
    }))

    return project
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
    }))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setState((prev) => ({
      projects: prev.projects.filter((p) => p.id !== id),
      features: prev.features.filter((f) => f.projectId !== id),
      analyses: prev.analyses.filter((a) => a.projectId !== id),
    }))
  }, [])

  // ✅ SAFE GET PROJECT
  const getProject = useCallback(
    (id: string | null) => {
      if (!id) return undefined
      return state.projects.find((p) => p.id === id)
    },
    [state.projects]
  )

  const getProjectFeatures = useCallback(
    (projectId: string, type?: Feature['type']) => {
      return state.features
        .filter((f) => f.projectId === projectId && (type ? f.type === type : true))
        .sort((a, b) => a.order - b.order)
    },
    [state.features]
  )

  const addFeature = useCallback(
    (projectId: string, input: CreateFeatureInput): Feature => {
      const existing = state.features.filter((f) => f.projectId === projectId)

      const feature: Feature = {
        id: generateId(),
        projectId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        order: existing.length,
        type: input.type ?? 'original',
      }

      setState((prev) => ({
        ...prev,
        features: [...prev.features, feature],
        projects: prev.projects.map((p) =>
          p.id === projectId
            ? { ...p, updatedAt: new Date().toISOString() }
            : p
        ),
      }))

      return feature
    },
    [state.features]
  )

  const updateFeature = useCallback((id: string, updates: UpdateFeatureInput) => {
    setState((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }))
  }, [])

  const deleteFeature = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }))
  }, [])

  const reorderFeatures = useCallback(
    (projectId: string, orderedIds: string[]) => {
      setState((prev) => ({
        ...prev,
        features: prev.features.map((f) => {
          if (f.projectId !== projectId) return f
          const newOrder = orderedIds.indexOf(f.id)
          return newOrder >= 0 ? { ...f, order: newOrder } : f
        }),
      }))
    },
    []
  )

  const getLatestAnalysis = useCallback(
    (projectId: string) => {
      return state.analyses
        .filter((a) => a.projectId === projectId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )[0]
    },
    [state.analyses]
  )

  const value = useMemo<ProjectContextValue>(
    () => ({
      ...state,
      createProject,
      updateProject,
      deleteProject,
      getProject,
      getProjectFeatures,
      addFeature,
      updateFeature,
      deleteFeature,
      reorderFeatures,
      getLatestAnalysis,
      activeProjectId,
      setActiveProjectId,
    }),
    [
      state,
      createProject,
      updateProject,
      deleteProject,
      getProject,
      getProjectFeatures,
      addFeature,
      updateFeature,
      deleteFeature,
      reorderFeatures,
      getLatestAnalysis,
      activeProjectId,
    ]
  )

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider')
  }
  return context
}