import { useState, useEffect } from 'react'
import { FolderKanban, Shield, Sparkles, Loader2, CheckCircle2, FileStack } from 'lucide-react'

import { Button } from '@/components/ui/button'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl bg-background/40" />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Main card with glassmorphism */}
      <div className="relative w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-500">
        {/* Card glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-50" />
        
        <div className="relative bg-card/80 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          
          <div className="p-8">
            {/* Icon and title section */}
            <div className="flex flex-col items-center text-center">
              {/* Animated icon container */}
              <div className="relative mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                
                {/* Icon background */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                  <FolderKanban className="w-10 h-10 text-primary-foreground" />
                  
                  {/* Sparkle decoration */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Typography */}
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome to Kanban
              </h1>
              <p className="mt-2 text-muted-foreground text-base max-w-sm">
                Let's set up your workspace. We'll create everything you need to get started.
              </p>
            </div>
            
            {/* Divider */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            
            {/* Security check card */}
            <div className="relative overflow-hidden rounded-lg border border-border/50 bg-muted/50 p-4">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }} />
              </div>
              
              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">Security Check</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Kanban will create its data directory in the current location:
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <FileStack className="w-3.5 h-3.5 flex-shrink-0" />
                    <code className="font-mono bg-background/80 px-2 py-1 rounded border border-border/50 break-all">
                      {status?.dbPath}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 font-medium"
                onClick={() => window.location.reload()}
                disabled={initializing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                onClick={handleInitialize}
                disabled={initializing}
              >
                {initializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create Workspace</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Footer note */}
            <p className="mt-4 text-center text-xs text-muted-foreground/60">
              Current directory: <span className="font-mono">{status?.pwd}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InitializationOverlay
