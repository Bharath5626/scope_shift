export const STORAGE_KEY = 'scopeai_app_state'

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  landing_page: 'Landing Page',
  chatbot: 'Chatbot',
  saas: 'SaaS Application',
  ecommerce: 'E-Commerce',
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  at_risk: 'At Risk',
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'New Project', path: '/projects/new', icon: 'plus' },
  { label: 'Scope Builder', path: '/scope-builder', icon: 'layers' },
  { label: 'Analysis', path: '/analysis', icon: 'activity' },
  { label: 'Reports', path: '/reports', icon: 'file' },
  { label: 'Project History', path: '/history', icon: 'clock' },
] as const
