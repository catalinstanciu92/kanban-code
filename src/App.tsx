import { useState } from 'react'
import KanbanBoard from './components/KanbanBoard/KanbanBoard'
import InitializationOverlay from './components/InitializationOverlay'
import AgentsPage from './components/AgentsPage/AgentsPage'
import { useTasks } from './hooks/useTasks'
import { useWebSocket } from './hooks/useWebSocket'
import type { Task, KanbanConfig } from './types'

type Tab = 'board' | 'agents'

function App() {
  const [isReady, setIsReady] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('board')
  const {
    tasks,
    columns,
    config,
    isLoading,
    error,
    addTask,
    moveTask,
    deleteTask,
    updateTask,
    updateConfig,
    refresh,
  } = useTasks()

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'FILE_CHANGE') {
        refresh()
      }
    },
  })

  if (!isReady) {
    return <InitializationOverlay onInitialized={() => setIsReady(true)} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Failed to load board</h2>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const handleTaskUpdate = (taskId: string, columnId: string, updates: Partial<Task>) => {
    updateTask(taskId, columnId, updates)
  }

  const handleTaskCreate = (columnId: string, title: string, description: string, priority: Task['priority'], tags: string[]) => {
    addTask({ columnId, title, description, priority, tags })
  }

  const handleConfigSave = async (newConfig: KanbanConfig) => {
    await updateConfig(newConfig)
    refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Kanban</h1>
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('board')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'board'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'agents'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Agents
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        {activeTab === 'board' ? (
          <KanbanBoard
            columns={columns}
            config={config!}
            tasks={tasks}
            onTaskCreate={handleTaskCreate}
            onTaskMove={moveTask}
            onTaskDelete={deleteTask}
            onTaskUpdate={handleTaskUpdate}
            onConfigSave={handleConfigSave}
            isConnected={isConnected}
          />
        ) : (
          <AgentsPage />
        )}
      </main>
    </div>
  )
}

export default App
