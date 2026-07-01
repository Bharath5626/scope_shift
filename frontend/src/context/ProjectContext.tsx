import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type {
  Analysis,
  CreateFeatureInput,
  CreateProjectInput,
  Feature,
  Project,
  UpdateFeatureInput,
} from '../types'

import { api } from '../services/api'

interface State {
  projects: Project[]
  features: Feature[]
  analyses: Analysis[]
  loading: boolean
}

interface ProjectContextValue extends State {
  createProject: (input: CreateProjectInput) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getProject: (id: string | null) => Project | undefined
  getProjectFeatures: (projectId: string, type?: Feature['type']) => Feature[]
  addFeature: (projectId: string, input: CreateFeatureInput) => Promise<Feature>
  updateFeature: (id: string, updates: UpdateFeatureInput) => Promise<void>
  deleteFeature: (id: string) => Promise<void>
  reorderFeatures: (projectId: string, orderedIds: string[]) => Promise<void>
  getLatestAnalysis: (projectId: string) => Analysis | undefined
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

const INITIAL: State = { projects: [], features: [], analyses: [], loading: false }

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const loadedFeatureProjects = useRef<Set<string>>(new Set())

  const setLoading = (loading: boolean) =>
    setState((prev) => ({ ...prev, loading }))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('project')
    if (pid) setActiveProjectId(pid)
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get<Project[]>('/projects')
      .then((projects) => setState((prev) => ({ ...prev, projects })))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeProjectId) return
    if (loadedFeatureProjects.current.has(activeProjectId)) return
    loadedFeatureProjects.current.add(activeProjectId)

    api.get<Feature[]>(`/projects/${activeProjectId}/features`)
      .then((features) =>
        setState((prev) => ({
          ...prev,
          features: [
            ...prev.features.filter((f) => f.projectId !== activeProjectId),
            ...features,
          ],
        }))
      )
      .catch(console.error)

    api.get<Analysis[]>(`/projects/${activeProjectId}/analyses`)
      .then((analyses) =>
        setState((prev) => ({
          ...prev,
          analyses: [
            ...prev.analyses.filter((a) => a.projectId !== activeProjectId),
            ...analyses,
          ],
        }))
      )
      .catch(console.error)
  }, [activeProjectId])

  const createProject = useCallback(async (input: CreateProjectInput): Promise<Project> => {
    const project = await api.post<Project>('/projects', { ...input, status: 'draft' })
    setState((prev) => ({ ...prev, projects: [project, ...prev.projects] }))
    return project
  }, [])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const project = await api.put<Project>(`/projects/${id}`, updates)
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? project : p)),
    }))
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    await api.delete(`/projects/${id}`)
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      features: prev.features.filter((f) => f.projectId !== id),
      analyses: prev.analyses.filter((a) => a.projectId !== id),
    }))
  }, [])

  const getProject = useCallback(
    (id: string | null) => (id ? state.projects.find((p) => p.id === id) : undefined),
    [state.projects]
  )

  const getProjectFeatures = useCallback(
    (projectId: string, type?: Feature['type']) =>
      state.features
        .filter((f) => f.projectId === projectId && (type ? f.type === type : true))
        .sort((a, b) => a.order - b.order),
    [state.features]
  )

  const addFeature = useCallback(
    async (projectId: string, input: CreateFeatureInput): Promise<Feature> => {
      const order = state.features.filter((f) => f.projectId === projectId).length
      const feature = await api.post<Feature>(`/projects/${projectId}/features`, {
        ...input,
        order,
        type: input.type ?? 'original',
      })
      setState((prev) => ({ ...prev, features: [...prev.features, feature] }))
      
      return feature
    },
    [state.features]
  )

  const updateFeature = useCallback(async (id: string, updates: UpdateFeatureInput) => {
    const feature = state.features.find((f) => f.id === id)
    if (!feature) return
    const updated = await api.put<Feature>(
      `/projects/${feature.projectId}/features/${id}`,
      updates
    )
    setState((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === id ? updated : f)),
    }))
  }, [state.features])

  const deleteFeature = useCallback(async (id: string) => {
    const feature = state.features.find((f) => f.id === id)
    if (!feature) return
    await api.delete(`/projects/${feature.projectId}/features/${id}`)
    setState((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }))
  }, [state.features])

  const reorderFeatures = useCallback(
    async (projectId: string, orderedIds: string[]) => {
      await api.put(`/projects/${projectId}/features/reorder`, { orderedIds })
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
    (projectId: string) =>
      state.analyses
        .filter((a) => a.projectId === projectId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0],
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

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider')
  return ctx
}
