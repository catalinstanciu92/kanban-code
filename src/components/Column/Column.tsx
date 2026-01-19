import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from '../TaskCard/TaskCard'
import type { ColumnConfig, Task } from '../../types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import './Column.css'

interface ColumnProps {
  config: ColumnConfig
  tasks: Task[]
  onTaskCreate: (title: string) => void
  onTaskDelete: (taskId: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
}

export function Column({ config, tasks, onTaskCreate, onTaskDelete, onTaskUpdate }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const { setNodeRef } = useDroppable({
    id: config.id,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      onTaskCreate(newTaskTitle.trim())
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  return (
    <div className="kanban-column" data-testid={`column-${config.id}`}>
      <div className="column-header" style={{ borderTopColor: config.color }}>
        <h2 className="column-title">
          {config.name}
          <span className="task-count">{tasks.length}</span>
        </h2>
        <button className="add-task-button" onClick={() => setIsAdding(true)} title="Add Task">
          <Plus size={18} />
        </button>
      </div>

      <div ref={setNodeRef} className="column-content">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={config.id}
              onDelete={() => onTaskDelete(task.id)}
              onUpdate={(updates) => onTaskUpdate?.(task.id, updates)}
            />
          ))}
        </SortableContext>

        {isAdding && (
          <form className="add-task-form" onSubmit={handleSubmit}>
            <input
              autoFocus
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => {
                if (!newTaskTitle.trim()) setIsAdding(false)
              }}
            />
            <div className="form-actions">
              <button type="submit" className="submit-button">Create</button>
              <button type="button" className="cancel-button" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Column
