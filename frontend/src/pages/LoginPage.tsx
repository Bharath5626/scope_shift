import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW, TRANSITION } from '../utils/designSystem'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center ${BORDER_RADIUS.card} bg-white/20 font-bold text-white`}>
            S
          </div>
          <div>
            <p className={`font-semibold text-white ${TYPOGRAPHY.body}`}>ScopeAI</p>
            <p className={`${TYPOGRAPHY.caption} text-indigo-200`}>Scope Creep Analyzer</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Detect scope creep<br />before it derails<br />your project.
          </h1>
          <p className={`mt-4 text-indigo-200 ${TYPOGRAPHY.body} leading-relaxed`}>
            AI-powered analysis that monitors your project scope in real time and flags risks early.
          </p>

          <ul className={`mt-10 space-y-4 ${SPACING.section.gap}`}>
            {[
              'AI-powered scope analysis',
              'Real-time risk detection',
              'Smart recommendations',
              'Full project history',
            ].map((item) => (
              <li key={item} className={`flex items-center gap-3 ${TYPOGRAPHY.body} text-indigo-100`}>
                <span className={`flex h-5 w-5 items-center justify-center ${BORDER_RADIUS.tag} bg-white/20 text-white`}>
                  <svg className={`h-3 w-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className={`${TYPOGRAPHY.caption} text-indigo-300`}>© 2026 ScopeAI. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className={`mb-8 flex items-center gap-3 lg:hidden`}>
            <div className={`flex h-9 w-9 items-center justify-center ${BORDER_RADIUS.card} bg-indigo-600 font-bold text-white`}>
              S
            </div>
            <span className={`font-semibold text-gray-900 dark:text-gray-100 ${TYPOGRAPHY.body}`}>ScopeAI</span>
          </div>

          <div className={`${BORDER_RADIUS.modal} border border-gray-200 bg-white ${SPACING.card.padding} ${SHADOW.card} dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20`}>
            <h2 className={`${TYPOGRAPHY.pageTitle} font-semibold text-gray-900 dark:text-gray-100`}>Welcome back</h2>
            <p className={`mt-1 ${TYPOGRAPHY.body} text-gray-500 dark:text-gray-400`}>Sign in to your account to continue</p>

            {error && (
              <div className={`mt-4 ${BORDER_RADIUS.card} bg-red-50 border border-red-200 px-4 py-3 ${TYPOGRAPHY.body} text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={`mt-6 space-y-5 ${SPACING.section.gap}`}>
              <div>
                <label className={`block ${TYPOGRAPHY.body} font-medium text-gray-700 mb-1.5 dark:text-gray-300`}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full ${BORDER_RADIUS.input} border border-gray-200 px-3.5 py-2.5 ${TYPOGRAPHY.body} text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
                />
              </div>

              <div>
                <label className={`block ${TYPOGRAPHY.body} font-medium text-gray-700 mb-1.5 dark:text-gray-300`}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${BORDER_RADIUS.input} border border-gray-200 px-3.5 py-2.5 ${TYPOGRAPHY.body} text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${BORDER_RADIUS.button} bg-indigo-600 py-2.5 ${TYPOGRAPHY.body} font-medium text-white ${SHADOW.card} ${TRANSITION} hover:bg-indigo-700 disabled:opacity-60`}
              >
                {loading ? 'Signing in…' : 'Login '}
              </button>
            </form>

            <p className={`mt-6 text-center ${TYPOGRAPHY.body} text-gray-500 dark:text-gray-400`}>
              Don't have an account?{' '}
              <Link to="/signup" className={`font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 ${TRANSITION}`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
