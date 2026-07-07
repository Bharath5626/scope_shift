import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { useProjects } from '../context/ProjectContext'

const MESSAGES = [
  'Analyzing features, complexity, dependencies…',
  'Calculating effort breakdown…',
  'Estimating timeline and risks…',
  'Generating risk factors…',
  'Finalizing analysis…',
]

function BrainIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
      <circle cx="40" cy="40" r="38" stroke="#ede9fe" strokeWidth="2" fill="#f5f3ff" />
      {/* brain shape */}
      <path
        d="M40 22c-3 0-5.5 1.2-7.2 3.1-1.4-.7-3-.9-4.5-.4-3.1 1-5 4.2-4.3 7.4-.1.4-.2.9-.2 1.4 0 2.3 1 4.3 2.6 5.7-.1.5-.1 1-.1 1.5 0 3.8 2.6 7 6.2 7.7V54h14.5v-5.7c3.3-.8 5.8-3.8 5.8-7.4 0-.4 0-.8-.1-1.2 1.7-1.4 2.8-3.5 2.8-5.9 0-4.2-3.4-7.6-7.6-7.6-.5 0-1 .1-1.5.2C45.8 23.4 43.1 22 40 22z"
        fill="#8b5cf6"
        opacity="0.15"
      />
      <path
        d="M40 23c-2.8 0-5.2 1.1-7 2.9-1.5-.8-3.2-1-4.8-.4-3.3 1.1-5.3 4.5-4.5 7.9-.1.5-.2 1-.2 1.5 0 2.4 1.1 4.5 2.8 5.9-.1.5-.1 1-.1 1.5 0 4.1 2.8 7.6 6.8 8.3V55h16v-6.3c3.7-.9 6.4-4.2 6.4-8.1 0-.4 0-.8-.1-1.2 1.8-1.5 2.9-3.7 2.9-6.1 0-4.4-3.6-8-8-8-.6 0-1.1.1-1.7.2C46.5 24.3 43.5 23 40 23z"
        stroke="#7c3aed"
        strokeWidth="1.5"
        fill="none"
      />
      {/* vertical line */}
      <line x1="40" y1="27" x2="40" y2="55" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* horizontal curves */}
      <path d="M33 32 Q36 35 33 38" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M47 32 Q44 35 47 38" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="45" r="2.5" fill="#a78bfa" opacity="0.5" />
      <circle cx="47" cy="45" r="2.5" fill="#a78bfa" opacity="0.5" />
    </svg>
  )
}

export function AnalyzingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project') ?? ''
  const { projects } = useProjects()

  const project = projects.find(p => p.id === projectId)

  const [countdown, setCountdown] = useState(5)
  const [analysisStarted, setAnalysisStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)

  const startAnalysis = () => {
    setAnalysisStarted(true)
    if (countdownRef.current) clearInterval(countdownRef.current)

    // Animate progress bar to ~88% while waiting for API
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 88) return p
        return p + (88 - p) * 0.06 + 0.4
      })
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 600)

    api
      .post<any>(`/projects/${projectId}/analyze`, {})
      .then((result) => {
        if (doneRef.current) return
        doneRef.current = true
        if (intervalRef.current) clearInterval(intervalRef.current)
        setProgress(100)
        setTimeout(() => {
          navigate(`/analysis-results?project=${projectId}`, { state: { result } })
        }, 600)
      })
      .catch((err) => {
        if (doneRef.current) return
        doneRef.current = true
        if (intervalRef.current) clearInterval(intervalRef.current)
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to analyze scope'
        setError(errorMessage)
      })
  }

  const handleCancel = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    navigate(`/scope-builder?project=${projectId}`)
  }

  useEffect(() => {
    if (!projectId) {
      navigate('/')
      return
    }

    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          startAnalysis()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [projectId])

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4 sm:p-8">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] shadow-lg w-full max-w-md px-6 sm:px-10 py-8 sm:py-12 text-center dark:border-[var(--border-secondary)]">

        {/* Decorative left accent */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-400 to-violet-600 rounded-l-2xl" />

        {!analysisStarted ? (
          <>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">Ready to Analyze</h2>
            <p className="mt-1.5 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
              Review project details before starting analysis
            </p>

            {/* Project Details */}
            {project && (
              <div className="mt-6 rounded-xl bg-[var(--bg-section)] p-4 text-left dark:bg-[var(--bg-section)]">
                <h3 className="font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{project.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-soft)] line-clamp-2 dark:text-[var(--text-subtle)]">
                  {project.description || 'No description provided'}
                </p>
                <div className="mt-3 flex gap-2 text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">
                  <span>{project.type}</span>
                  {project.deadline && (
                    <span>• Due {new Date(project.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            <div className="mt-6">
              <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                Auto-analyzing in <span className="font-semibold text-indigo-600 dark:text-indigo-400">{countdown}s</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-[var(--border-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] dark:border-[var(--border-secondary)] dark:bg-[var(--bg-surface)] dark:text-gray-200 dark:hover:bg-[var(--bg-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={startAnalysis}
                className="flex-1 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                Analyze Now
              </button>
            </div>
          </>
        ) : error ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">Analysis Failed</h2>
            <p className="mt-1.5 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
              {error}
            </p>
            <button
              onClick={handleCancel}
              className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              Go Back
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">Analyzing Scope</h2>
            <p className="mt-1.5 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
              Please wait while our AI analyzes the impact…
            </p>

            {/* Brain icon */}
            <div className="mx-auto my-8 h-28 w-28">
              <BrainIcon />
            </div>

            {/* Progress bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--bg-section)] dark:bg-[var(--bg-section)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>

            {/* Status line */}
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-subtle)] dark:text-[var(--text-soft)]">
              <span className="truncate">{MESSAGES[msgIndex]}</span>
              <span className="ml-3 shrink-0 font-medium text-indigo-500 dark:text-indigo-400">
                {Math.round(Math.min(100, progress))}%
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
