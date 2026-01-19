import KanbanBoard from './components/KanbanBoard/KanbanBoard'
import { useTasks } from './hooks/useTasks'
import { useWebSocket } from './hooks/useWebSocket'
import type { Task } from './types'

function App() {
  const {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    moveTask,
    deleteTask,
    updateTask,
    refresh,
  } = useTasks()

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'FILE_CHANGE') {
        refresh()
      }
    },
  })

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

  return (
    <KanbanBoard
      columns={columns}
      tasks={tasks}
      onTaskCreate={(columnId, title) => addTask({ columnId, title })}
      onTaskMove={moveTask}
      onTaskDelete={deleteTask}
      onTaskUpdate={handleTaskUpdate}
      isConnected={isConnected}
    />
  )
}

export default App
