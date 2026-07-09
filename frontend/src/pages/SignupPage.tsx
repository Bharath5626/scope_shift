import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION } from '../utils/designSystem'

export function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      {/* Left panel - Brand & Marketing */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="ScopeAI" className={`h-12 w-12 ${BORDER_RADIUS.card} object-contain`} />
            <div>
              <p className={`font-bold text-white text-lg`}>ScopeAI</p>
              <p className={`${TYPOGRAPHY.caption} text-slate-400`}>Enterprise Scope Management</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold leading-tight text-white mb-6">
            Project Scope<br />
            <span className="text-[var(--color-primary-light)]">Management Platform</span>
          </h1>
          <p className={`text-slate-300 ${TYPOGRAPHY.body} leading-relaxed text-lg max-w-md`}>
            Streamline your project planning with intelligent scope analysis and team collaboration tools.
          </p>
        </div>

        <p className={`relative z-10 ${TYPOGRAPHY.caption} text-slate-500`}>© 2026 ScopeAI. All rights reserved.</p>
      </div>

      {/* Right panel - Signup Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className={`mb-8 flex items-center gap-3 lg:hidden`}>
            <img src="/logo.jpg" alt="ScopeAI" className={`h-10 w-10 ${BORDER_RADIUS.card} object-contain`} />
            <span className={`font-bold text-[var(--text-primary)] text-lg`}>ScopeAI</span>
          </div>

          <div className={`${BORDER_RADIUS.modal} border border-[var(--border-primary)] bg-[var(--bg-surface)] p-8 ${SHADOW.modal}`}>
            <div className="mb-8">
              <h2 className={`text-2xl font-bold text-[var(--text-primary)]`}>Create an account</h2>
              <p className={`mt-2 ${TYPOGRAPHY.body} text-[var(--text-muted)]`}>Get started with ScopeAI for free</p>
            </div>

            {error && (
              <div className={`mb-6 ${BORDER_RADIUS.card} bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 px-4 py-3 ${TYPOGRAPHY.body} text-[var(--color-danger)] flex items-start gap-3`}>
                <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] mb-2`}>
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-input)] px-4 py-3 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${TRANSITION}`}
                />
              </div>

              <div>
                <label className={`block ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] mb-2`}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-input)] px-4 py-3 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${TRANSITION}`}
                />
              </div>

              <div>
                <label className={`block ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] mb-2`}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-input)] px-4 py-3 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${TRANSITION}`}
                />
              </div>

              <div>
                <label className={`block ${TYPOGRAPHY.body} font-medium text-[var(--text-secondary)] mb-2`}>
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${BORDER_RADIUS.input} border border-[var(--border-primary)] bg-[var(--bg-input)] px-4 py-3 ${TYPOGRAPHY.body} text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 ${TRANSITION}`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${BORDER_RADIUS.button} bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] py-3.5 ${TYPOGRAPHY.body} font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 ${TRANSITION}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
              <p className={`text-center ${TYPOGRAPHY.body} text-[var(--text-muted)]`}>
                Already have an account?{' '}
                <Link to="/login" className={`font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] ${TRANSITION}`}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
