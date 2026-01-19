import type { Task } from '../../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
  columnId: string
  onDelete: () => void
  onUpdate?: (updates: Partial<Task>) => void
}

function TaskCard({ task, columnId, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card priority-${task.priority}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-header">
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}
      {task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag) => (
            <span key={tag} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskCard
