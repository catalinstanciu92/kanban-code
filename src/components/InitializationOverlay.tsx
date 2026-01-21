import { useState, useEffect } from 'react'

interface InitStatus {
  initialized: boolean
  dbPath: string
  pwd: string
  error: string | null
}

function InitializationOverlay({ onInitialized }: { onInitialized: () => void }) {
  const [status, setStatus] = useState<InitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/init-status')
      .then(res => res.json())
      .then(data => {
        setStatus(data)
        if (data.initialized) {
          onInitialized()
        }
      })
      .catch(err => {
        console.error('Failed to fetch init status:', err)
        setError('Failed to connect to the server')
      })
      .finally(() => setLoading(false))
  }, [onInitialized])

  const handleInitialize = async () => {
    setInitializing(true)
    setError(null)
    try {
      const res = await fetch('/api/initialize', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        onInitialized()
      } else {
        setError(data.error || 'Failed to initialize')
      }
    } catch {
      setError('Connection lost while initializing')
    } finally {
      setInitializing(false)
    }
  }

  if (loading || (status && status.initialized)) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-xl shadow-2xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Setup Kanban</h1>
            <p className="text-muted-foreground">
              The configuration directory <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-sm">{status?.dbPath}</code> is missing.
            </p>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Security Check:</strong> Are you sure you allow Kanban to create its data files in this directory?
            <div className="mt-2 font-mono break-all opacity-80">{status?.pwd}</div>
          </div>

          {error && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex w-full gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInitialize}
              disabled={initializing}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {initializing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Initializing...
                </>
              ) : (
                'Yes, create it'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InitializationOverlay
