export type ProjectType = 'landing_page' | 'chatbot' | 'saas' | 'ecommerce'

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'at_risk'

export type FeaturePriority = 'low' | 'medium' | 'high'

export type FeatureType = 'original' | 'new'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ComplexityLevel = 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  description: string
  type: ProjectType
  status: ProjectStatus
  createdAt: string
  updatedAt: string

  createdBy: {
    name: string
  }
}
export interface Feature {
  id: string
  projectId: string
  title: string
  description: string
  category: string
  priority: FeaturePriority
  order: number
  type: FeatureType
}

export interface Analysis {
  id: string
  projectId: string
  scopeIncreasePercent: number
  additionalHours: number
  delayWeeks: number
  riskLevel: RiskLevel
  complexity: ComplexityLevel
  createdAt: string
}

export interface AppState {
  projects: Project[]
  features: Feature[]
  analyses: Analysis[]
}

export interface CreateProjectInput {
  name: string
  description: string
  type: ProjectType
  deadline: string
}

export interface CreateFeatureInput {
  title: string
  description: string
  category: string
  priority: FeaturePriority
  type?: FeatureType
}

export interface UpdateFeatureInput extends Partial<CreateFeatureInput> {
  order?: number
}
