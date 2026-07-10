import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { PROJECT_TYPE_LABELS } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type RiskLevel = 'Low' | 'Medium' | 'High'

interface EffortBreakdown {
  development: number
  testing: number
  integration: number
  documentation: number
}

interface Analysis {
  id: string
  scopeIncreasePercent: number
  additionalHours: number
  delayWeeks: number
  riskLevel: string | null
  complexityLevel: string | null
  complexityScore: number | null
  effortBreakdown: EffortBreakdown | null
  riskFactors: string[] | null
  recommendations: string[] | null
  createdAt: string
}

interface AuditLog {
  id: string
  projectId: string
  action: string
  description: string | null
  changes: Record<string, { from: any; to: any }> | null
  userId: string | null
  features: Feature[] | null
  createdAt: string
  user?: {
    id: string
    name: string
  }
}

interface Feature {
  id: string
  projectId: string
  title: string
  description: string | null
  category: string
  priority: string
  order: number
  type: string
}

interface Project {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  startDate: string | null
  deadline: string | null
  teamSize: number | null
  techStack: string | null
  projectType: string | null
  methodology: string | null
  workingHours: number | null
  teamMembers?: string[]
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

const RISK_COLORS: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  Low:    { bg: 'bg-green-50',  text: 'text-[var(--color-success)] dark:text-white',  badge: 'bg-green-100 text-[var(--color-success)] dark:bg-green-900/30 dark:text-green-400',  border: 'border-green-200 dark:border-green-800' },
  Medium: { bg: 'bg-amber-50',  text: 'text-[var(--color-warning)] dark:text-white',  badge: 'bg-amber-100 text-[var(--color-warning)] dark:bg-amber-900/30 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800' },
  High:   { bg: 'bg-red-50',    text: 'text-[var(--color-danger)] dark:text-white',    badge: 'bg-red-100 text-[var(--color-danger)] dark:bg-red-900/30 dark:text-red-400',      border: 'border-red-200 dark:border-red-800' },
}

const COMPLEXITY_STROKE: Record<string, string> = {
  Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444',
}

const TABS = ['Summary', 'Effort Breakdown', 'Risk Analysis', 'Recommendations', 'Project Details', 'Logs'] as const
type Tab = typeof TABS[number]

function DonutChart({ level, score }: { level: string; score: number }) {
  const r = 45
  const circ = 2 * Math.PI * r
  const filled = (Math.min(score, 100) / 100) * circ
  const color = COMPLEXITY_STROKE[level] ?? '#f59e0b'
  return (
    <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" className="dark:stroke-gray-700" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--text-primary)] dark:text-gray-100">{level}</p>
        <p className="text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">complexity</p>
      </div>
    </div>
  )
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4 text-[var(--color-warning)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)] dark:text-green-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-white px-5 py-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? 'text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">{sub}</p>}
    </div>
  )
}

function SummaryTab({ analysis }: { analysis: Analysis }) {
  const risk = (analysis.riskLevel || 'Medium') as RiskLevel
  const riskColors = RISK_COLORS[risk] ?? RISK_COLORS.Medium
  const complexity = (analysis.complexityLevel || 'Medium') as RiskLevel
  const score = analysis.complexityScore || Math.round(analysis.scopeIncreasePercent)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Scope Score" value={`${score}%`} />
        <StatCard label="Estimated Effort" value={`${analysis.additionalHours} hrs`} />
        <StatCard label="Timeline" value={`${analysis.delayWeeks} ${analysis.delayWeeks === 1 ? 'week' : 'weeks'}`} />
        <div className="rounded-xl border border-[var(--border-primary)] bg-white px-5 py-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Risk Level</p>
          <p className={`mt-1 text-2xl font-bold ${riskColors.text}`}>{risk}</p>
          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${riskColors.badge}`}>
            {risk} Risk
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-section)] p-6 shadow-sm dark:border-gray-700 dark:bg-gray-700/50 dark:shadow-gray-900/20">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <DonutChart level={complexity} score={score} />
          <div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Complexity Level</p>
            <p className={`mt-1 text-3xl font-bold ${riskColors.text}`}>{complexity}</p>
            <p className="mt-1 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
              Based on {analysis.additionalHours} hours of estimated effort across all categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EffortTab({ breakdown }: { breakdown: EffortBreakdown | null }) {
  if (!breakdown) {
    return <p className="text-sm text-[var(--text-subtle)] dark:text-[var(--text-soft)]">No effort breakdown available for this analysis.</p>
  }
  const rows = [
    { label: 'Development',   hours: breakdown.development,   pct: 60 },
    { label: 'Testing',       hours: breakdown.testing,       pct: 17 },
    { label: 'Integration',   hours: breakdown.integration,   pct: 13 },
    { label: 'Documentation', hours: breakdown.documentation, pct: 10 },
  ]
  const total = breakdown.development + breakdown.testing + breakdown.integration + breakdown.documentation
  const maxHours = Math.max(...rows.map((r) => r.hours), 1)

  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-white p-4 sm:p-6 shadow-sm space-y-5 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Hours by Category</h3>
      {rows.map(({ label, hours }) => {
        const pct = Math.round((hours / maxHours) * 100)
        return (
          <div key={label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[var(--text-muted)] dark:text-[var(--text-subtle)]">{label}</span>
              <span className="font-semibold text-[var(--text-primary)] dark:text-gray-100">{hours} hrs</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--bg-section)] dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-[var(--color-primary)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
      <div className="border-t border-[var(--border-primary)] pt-4 flex items-center justify-between text-sm font-bold dark:border-gray-700">
        <span className="text-gray-800 dark:text-black">Total</span>
        <span className="text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]">{total} hrs</span>
      </div>
    </div>
  )
}

function RiskTab({ riskLevel, riskFactors, complexity }: { riskLevel: string | null; riskFactors: string[] | null; complexity: string | null }) {
  const risk = (riskLevel || 'Medium') as RiskLevel
  const riskColors = RISK_COLORS[risk] ?? RISK_COLORS.Medium
  const factors = riskFactors ?? []

  return (
    <div className="space-y-4">
      <div data-risk-section="true" 
  className={`flex items-center gap-4 rounded-xl border border-[var(--border-primary)] bg-white p-5 dark:border-gray-700 dark:bg-gray-800`}
>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold ${riskColors.text}`} >
          {risk[0]}
        </div>
        <div>
         <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-gray-100">Overall Risk: {risk}</p>
          <p className="mt-0.5 text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Complexity level: {complexity || 'Unknown'}</p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${riskColors.badge}`}>
          {risk} Risk
        </span>
      </div>

      <div data-risk-section="true" className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Identified Risk Factors</h3>
        {factors.length === 0 ? (
          <p className="text-sm text-[var(--text-subtle)] dark:text-[var(--text-soft)]">No risk factors recorded for this analysis.</p>
        ) : (
          <div className="space-y-3">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border-l-4 border-red-500 bg-[var(--bg-section)] px-4 py-3 dark:bg-gray-700">
                <WarningIcon />
                <span className="text-sm text-[var(--text-secondary)] dark:text-gray-200">{factor}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationsTab({ recommendations }: { recommendations: string[] | null }) {
  const items = recommendations ?? []
  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-white p-4 sm:p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">AI Recommendations</h3>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-subtle)] dark:text-[var(--text-soft)]">No recommendations recorded for this analysis.</p>
      ) : (
        <div className="space-y-3">
          {items.map((rec, i) => (
           <div
  key={i}
  className="flex items-start gap-3 rounded-lg border-l-4 border-green-500 bg-[var(--bg-section)] px-4 py-3 dark:bg-gray-700"
>
  <CheckIcon />
  <span className="text-sm text-[var(--text-secondary)] dark:text-gray-200">
    {rec}
  </span>
</div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectDetailsTab({ project, users }: { project: Project; users: any[] }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
        <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Project Information</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-black">Project Name</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)] dark:text-gray-100">{project.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Description</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.description || 'No description provided'}</p>
          </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Type</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{PROJECT_TYPE_LABELS[project.type] ?? project.type}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Status</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)] capitalize dark:text-gray-300">{project.status.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
        <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Technical Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Project Type</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.projectType || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Team Size</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.teamSize ? `${project.teamSize} members` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Methodology</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.methodology || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Working Hours</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.workingHours ? `${project.workingHours} hrs/day` : 'Not specified'}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Tech Stack</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">{project.techStack || 'Not specified'}</p>
        </div>
      </div>

      {/* Team Members */}
      {project.teamMembers && project.teamMembers.length > 0 && (
        <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Team Members ({project.teamMembers.length})</h3>
          <div className="space-y-3">
            {project.teamMembers.map((memberId) => {
              const member = users.find((u: any) => u.id === memberId)
              const memberName = member?.name || 'Unknown User'
              const memberImage = member?.profileImage || null
              const initials = memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              
              return (
                <div key={memberId} className="flex items-center gap-3">
                  {memberImage ? (
                    <img
                      src={memberImage}
                      alt={memberName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">{memberName}</p>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">{member?.email || ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
        <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)] dark:text-gray-200">Timeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Start Date</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">
              {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Deadline</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)] dark:text-gray-300">
              {project.deadline ? new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogsTab({ auditLogs }: { auditLogs: AuditLog[] }) {
  const { user } = useAuth()
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const handleShowFeatures = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null)
      return
    }

    setExpandedLogId(logId)
  }

  const getUserName = (log: AuditLog) => {
    if (!log.user) return 'Unknown'
    if (user?.id === log.user.id) return 'You'
    return log.user.name
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <span className="text-[var(--color-info)] dark:text-[var(--color-info-light)]">C</span>
      case 'updated':
        return <span className="text-[var(--color-warning)] dark:text-amber-400">U</span>
      case 'analysis_created':
        return <span className="text-[var(--color-success)] dark:text-green-400">A</span>
      case 'analysis_retrieved':
        return <span className="text-blue-600 dark:text-blue-400">R</span>
      case 'feature_added':
        return <span className="text-[var(--color-accent)] dark:text-[var(--color-accent-light)]">F</span>
      default:
        return <span className="text-[var(--text-muted)] dark:text-[var(--text-subtle)]">{action.charAt(0).toUpperCase()}</span>
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Project Created'
      case 'updated':
        return 'Project Modified'
      case 'analysis_created':
        return 'Analysis Completed'
      case 'analysis_retrieved':
        return 'Analysis Retrieved'
      case 'feature_added':
        return 'Feature Added'
      default:
        return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  return (
    <div className="space-y-4">
      {auditLogs.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-primary)] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
          <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">No logs available</p>
        </div>
      ) : (
        auditLogs.map((log) => (
          <div key={log.id} className="rounded-xl border border-[var(--border-primary)] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  log.action === 'created' 
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)] dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)]'
                    : log.action === 'updated'
                    ? 'bg-amber-100 text-[var(--color-warning)] dark:bg-amber-900/30 dark:text-amber-400'
                    : log.action === 'analysis_created'
                    ? 'bg-green-100 text-[var(--color-success)] dark:bg-green-900/30 dark:text-green-400'
                    : log.action === 'feature_added'
                    ? 'bg-orange-100 text-[var(--color-accent)] dark:bg-orange-900/30 dark:text-[var(--color-accent-light)]'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {getActionIcon(log.action)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">
                    {getActionLabel(log.action)}
                  </p>
                  <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                    {new Date(log.createdAt).toLocaleString()} • By {getUserName(log)}
                  </p>
                  {log.description && (
                    <p className="mt-1 text-xs text-[var(--text-muted)] dark:text-[var(--text-subtle)]">{log.description}</p>
                  )}
                </div>
              </div>
              {expandedLogId === log.id ? (
                <button
                  onClick={() => handleShowFeatures(log.id)}
                  className="flex items-center gap-1 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary-50)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-100)] dark:border-[var(--color-primary)]/30 dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)] dark:hover:bg-[var(--color-primary-dark)]/30"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  Hide Features
                </button>
              ) : (
                <button
                  onClick={() => handleShowFeatures(log.id)}
                  className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary-50)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-100)] dark:border-[var(--color-primary)]/30 dark:bg-[var(--color-primary-dark)]/20 dark:text-[var(--color-primary-light)] dark:hover:bg-[var(--color-primary-dark)]/30"
                >
                  Features {log.features?.length ? `(${log.features.length})` : ''}
                </button>
              )}
            </div>
            
            {expandedLogId === log.id && (
              <div className="border-t border-[var(--border-primary)] bg-[var(--bg-section)] p-4 dark:border-gray-700 dark:bg-gray-700/50">
                {log.features && log.features.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 feature-list-scroll">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                      Features ({log.features.length})
                    </p>
                    {log.features.map((feature) => (
                      <div key={feature.id} className="rounded-lg border border-[var(--border-primary)] bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--text-primary)] dark:text-gray-100">{feature.title}</p>
                          {feature.description && (
                            <p className="mt-1 text-xs text-[var(--text-muted)] dark:text-[var(--text-subtle)]">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">No features available</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export function ReportDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Summary')
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = () => {
    if (!project || !analysis) return

    setExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let currentY = 80

      // Header
      doc.setFontSize(20)
      doc.setTextColor(79, 70, 229)
      doc.text('Scope Analysis Report', pageWidth / 2, 20, { align: 'center' })

      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(project.name, pageWidth / 2, 30, { align: 'center' })

      // Project info
      doc.setFontSize(10)
      doc.setTextColor(60)
      doc.text(`Type: ${PROJECT_TYPE_LABELS[project.type] ?? project.type}`, 20, 45)
      doc.text(`Status: ${project.status}`, 20, 52)
      doc.text(`Analysis Date: ${new Date(analysis.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 20, 59)

      // Summary stats
      doc.setFontSize(14)
      doc.setTextColor(79, 70, 229)
      doc.text('Summary', 20, 75)

      autoTable(doc, {
        startY: 80,
        head: [['Metric', 'Value']],
        body: [
          ['Scope Score', `${analysis.scopeIncreasePercent}%`],
          ['Estimated Effort', `${analysis.additionalHours} hours`],
          ['Timeline Impact', `${analysis.delayWeeks} weeks`],
          ['Risk Level', analysis.riskLevel || 'Medium'],
          ['Complexity', analysis.complexityLevel || 'Medium'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        didDrawPage: (data) => {
          if (data.cursor) {
            currentY = data.cursor.y
          }
        },
      })

      // Effort breakdown
      if (analysis.effortBreakdown) {
        const breakdown = analysis.effortBreakdown as EffortBreakdown
        autoTable(doc, {
          startY: currentY + 15,
          head: [['Category', 'Hours']],
          body: [
            ['Development', `${breakdown.development} hrs`],
            ['Testing', `${breakdown.testing} hrs`],
            ['Integration', `${breakdown.integration} hrs`],
            ['Documentation', `${breakdown.documentation} hrs`],
          ],
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
          didDrawPage: (data) => {
            if (data.cursor) {
              currentY = data.cursor.y
            }
          },
        })
      }

      // Risk factors
      if (analysis.riskFactors && analysis.riskFactors.length > 0) {
        autoTable(doc, {
          startY: currentY + 15,
          head: [['Risk Factors']],
          body: analysis.riskFactors.map((factor) => [factor]),
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68] },
          didDrawPage: (data) => {
            if (data.cursor) {
              currentY = data.cursor.y
            }
          },
        })
      }

      // Recommendations
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        autoTable(doc, {
          startY: currentY + 15,
          head: [['Recommendations']],
          body: analysis.recommendations.map((rec) => [rec]),
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
        })
      }

      // Footer
      const pageCount = doc.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Generated by ScopeAI - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }

      doc.save(`${project.name.replace(/\s+/g, '_')}_analysis_report.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    if (!projectId) return
    Promise.all([
      api.get<Project>(`/projects/${projectId}`),
      api.get<Analysis>(`/projects/${projectId}/analyses/latest`),
      api.get<AuditLog[]>(`/projects/${projectId}/audit-logs`),
      api.get<any[]>('/users'),
    ])
      .then(([proj, anal, logs, usersData]) => {
        setProject(proj)
        setAnalysis(anal)
        setAuditLogs(logs)
        setUsers(Array.isArray(usersData) ? usersData : ((usersData as any).data?.data || (usersData as any).data || []))
      })
      .catch(() => setError('Failed to load report data'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p className="mt-3 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Loading report…</p>
        </div>
      </div>
    )
  }

  if (error || !project || !analysis) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <p className="text-sm text-[var(--color-danger)] dark:text-red-400">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/reports')}
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            Back to Reports
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/reports')}
              className="mb-2 flex items-center gap-1.5 text-xs text-[var(--text-subtle)] hover:text-[var(--text-muted)] dark:hover:text-gray-300"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Reports
            </button>
            <h1 className="text-xl font-bold text-[var(--text-primary)] dark:text-gray-100">{project.name}</h1>
            <p className="mt-0.5 text-sm text-[var(--text-subtle)] dark:text-[var(--text-soft)]">
              {PROJECT_TYPE_LABELS[project.type] ?? project.type} · Detailed Analysis Report
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {exporting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
<div className="border-b border-[var(--border-primary)] dark:border-gray-700">
  
  {/* MOBILE: dropdown */}
  <div className="sm:hidden p-3">
    <select
      value={activeTab}
      onChange={(e) => setActiveTab(e.target.value as Tab)}
      className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    >
      {TABS.map((tab) => (
        <option key={tab} value={tab}>
          {tab}
        </option>
      ))}
    </select>
  </div>

  {/* DESKTOP: tabs */}
  <nav className="-mb-px hidden sm:flex gap-0 overflow-x-auto">
    {TABS.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
       className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition
  ${
   activeTab === tab
  ? 'border-[var(--color-primary)] text-[var(--color-primary)] dark:border-[var(--color-primary)] dark:text-white'
  : 'border-transparent text-[var(--text-soft)] hover:text-[var(--text-primary)]'
  }
`}
      >
        {tab}
      </button>
    ))}
  </nav>
</div>

        {/* Tab content */}
        <div>
          {activeTab === 'Summary' && <SummaryTab analysis={analysis} />}
          {activeTab === 'Effort Breakdown' && (
            <EffortTab breakdown={analysis.effortBreakdown as EffortBreakdown | null} />
          )}
          {activeTab === 'Risk Analysis' && (
            <RiskTab
              riskLevel={analysis.riskLevel}
              riskFactors={analysis.riskFactors as string[] | null}
              complexity={analysis.complexityLevel}
            />
          )}
          {activeTab === 'Recommendations' && (
            <RecommendationsTab recommendations={analysis.recommendations as string[] | null} />
          )}
          {activeTab === 'Project Details' && <ProjectDetailsTab project={project} users={users} />}
          {activeTab === 'Logs' && <LogsTab auditLogs={auditLogs} />}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const currentIndex = TABS.indexOf(activeTab)
              if (currentIndex > 0) {
                setActiveTab(TABS[currentIndex - 1])
              }
            }}
            disabled={TABS.indexOf(activeTab) === 0}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-section)] disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={() => {
              const currentIndex = TABS.indexOf(activeTab)
              if (currentIndex < TABS.length - 1) {
                setActiveTab(TABS[currentIndex + 1])
              }
            }}
            disabled={TABS.indexOf(activeTab) === TABS.length - 1}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
