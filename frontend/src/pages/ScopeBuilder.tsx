import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function ScopeBuilder() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')

  const [scope, setScope] = useState('')

  return (
    <div className="grid grid-cols-12 gap-6 p-8 bg-gray-50 min-h-screen">
      
      {/* LEFT PANEL - INPUT */}
      <div className="col-span-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          
          <h2 className="text-lg font-semibold text-gray-900">
            Scope Input
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Describe what you want to build
          </p>

          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Enter project requirements..."
            className="mt-4 h-64 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
          />

          <button className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Analyze Scope
          </button>
        </div>
      </div>

      {/* MIDDLE PANEL - ANALYSIS */}
      <div className="col-span-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          
          <h2 className="text-lg font-semibold text-gray-900">
            AI Analysis
          </h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                Detected Scope Items
              </p>
              <p className="text-xs text-gray-500">
                No analysis yet
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                Risk Level
              </p>
              <p className="text-xs text-gray-500">
                Pending analysis
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                Timeline Impact
              </p>
              <p className="text-xs text-gray-500">
                Not calculated yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - INSIGHTS */}
      <div className="col-span-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          
          <h2 className="text-lg font-semibold text-gray-900">
            Insights
          </h2>

          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>• Scope creep detection will appear here</p>
            <p>• AI suggestions will be listed here</p>
            <p>• Timeline warnings will show here</p>
          </div>
        </div>
      </div>

    </div>
  )
}