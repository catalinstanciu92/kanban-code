import KanbanBoard from './components/KanbanBoard/KanbanBoard'
import { useTasks } from './hooks/useTasks'
import { useWebSocket } from './hooks/useWebSocket'
import './App.css'

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
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading KanbanBoard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Failed to load board</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <KanbanBoard
      columns={columns}
      tasks={tasks}
      onTaskCreate={(columnId, title) => addTask({ columnId, title })}
      onTaskMove={moveTask}
      onTaskDelete={deleteTask}
      onTaskUpdate={(taskId, updates) => {
        // Find which column the task belongs to
        const columnId = Object.keys(tasks).find((key) =>
          tasks[key].some((t) => t.id === taskId)
        )
        if (columnId) {
          updateTask(taskId, columnId, updates)
        }
      }}
      isConnected={isConnected}
    />
  )
}

export default App
