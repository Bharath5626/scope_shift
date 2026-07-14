import type { AppState } from '../types'
import { STORAGE_KEY } from '../utils/constants'

const EMPTY_STATE: AppState = {
  projects: [],
  features: [],
  analyses: [],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_STATE }

    const parsed = JSON.parse(raw) as AppState
    return {
      projects: parsed.projects ?? [],
      features: parsed.features ?? [],
      analyses: parsed.analyses ?? [],
    }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function seedDemoData(): AppState {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString()

  const state: AppState = {
    projects: [
      {
  id: 'demo-1',
  name: 'Marketing Landing Page',
  description: 'High-converting landing page for product launch',
  type: 'landing_page',
  status: 'active',
  createdAt: twoDaysAgo,
  updatedAt: yesterday,
  deadline: null,        // add this
  createdBy: { id: 'demo-user', name: 'Demo User' }, // add this
},
{
  id: 'demo-2',
  name: 'Customer Support Chatbot',
  description: 'AI-powered chatbot for customer support',
  type: 'chatbot',
  status: 'draft',
  createdAt: yesterday,
  updatedAt: now,
  deadline: null,        // add this
  createdBy: { id: 'demo-user', name: 'Demo User' }, // add this
},
{
  id: 'demo-3',
  name: 'Analytics SaaS Platform',
  description: 'B2B analytics dashboard with billing',
  type: 'saas',
  status: 'at_risk',
  createdAt: twoDaysAgo,
  updatedAt: now,
  deadline: null,        // add this
  createdBy: { id: 'demo-user', name: 'Demo User' }, // add this
},
    ],
    features: [],
    analyses: [],
  }

  saveState(state)
  return state
}
