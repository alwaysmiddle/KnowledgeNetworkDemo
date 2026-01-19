import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { features } from './router'

export default function Layout() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()

  const currentFeature = features.find(f => location.pathname.startsWith(f.path)) || features[0]

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <nav className="bg-zinc-800 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="font-semibold text-lg">
              KN Demo
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-700 transition-colors"
              >
                <span>{currentFeature?.name || 'Select Demo'}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50">
                  {features.map(feature => (
                    <Link
                      key={feature.id}
                      to={feature.path}
                      onClick={() => setDropdownOpen(false)}
                      className={`block px-4 py-3 hover:bg-zinc-700 transition-colors ${
                        location.pathname.startsWith(feature.path) ? 'bg-zinc-700' : ''
                      }`}
                    >
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-zinc-400">{feature.description}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </div>
  )
}
