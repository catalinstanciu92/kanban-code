import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { Column } from '../Column/Column'
import type { ColumnConfig, Task, TasksByColumn } from '../../types'
import './KanbanBoard.css'

interface KanbanBoardProps {
  columns: ColumnConfig[]
  tasks: TasksByColumn
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void
  onTaskCreate: (columnId: string, title: string) => void
  onTaskDelete: (taskId: string, columnId: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  isConnected?: boolean
}

export function KanbanBoard({
  columns,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskDelete,
  onTaskUpdate,
  isConnected = false,
}: KanbanBoardProps) {
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return
    
    const taskId = active.id as string
    const fromColumn = active.data.current?.columnId as string
    const toColumn = over.id as string
    
    if (fromColumn !== toColumn) {
      onTaskMove(taskId, fromColumn, toColumn)
    }
  }

  return (
    <div className="kanban-board">
      <header className="kanban-header">
        <h1>KanbanCode</h1>
        <div
          className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
          data-testid="connection-status"
        >
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </header>
      
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {sortedColumns.map((column) => (
            <Column
              key={column.id}
              config={column}
              tasks={tasks[column.id] ?? []}
              onTaskCreate={(title) => onTaskCreate(column.id, title)}
              onTaskDelete={(taskId) => onTaskDelete(taskId, column.id)}
              onTaskUpdate={onTaskUpdate}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

export default KanbanBoard
