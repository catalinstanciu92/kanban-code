import { useState } from 'react'
import type { Task, ColumnConfig } from '../../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskEditDialog } from '../TaskEditDialog/TaskEditDialog'

interface TaskCardProps {
  task: Task
  columnId: string
  columns?: ColumnConfig[]
  onDelete: () => void
  onUpdate?: (updates: Partial<Task>) => void
  onStatusChange?: (newColumnId: string) => void
}

const PRIORITY_STYLES: Record<Task['priority'], { badge: string; border: string }> = {
  low: { 
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30',
    border: 'border-l-slate-500'
  },
  medium: { 
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30',
    border: 'border-l-amber-500'
  },
  high: { 
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30',
    border: 'border-l-orange-500'
  },
  critical: { 
    badge: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    border: 'border-l-red-500'
  },
}

function TaskCard({ task, columnId, columns, onDelete, onUpdate, onStatusChange }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  
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
  }

  const priorityStyle = PRIORITY_STYLES[task.priority]

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-background border border-border rounded-lg p-3 cursor-default transition-all duration-200 border-l-4 ${priorityStyle.border} ${
          isDragging 
            ? 'opacity-50 shadow-2xl ring-2 ring-primary/50 scale-105' 
            : 'hover:border-border/80 hover:shadow-lg hover:shadow-black/20'
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={14} />
        </div>

        {/* Header with Priority and Actions */}
        <div className="flex items-start justify-between gap-2 mb-2 pl-4">
          <Badge 
            variant="outline" 
            className={`text-[10px] uppercase font-semibold px-1.5 py-0 ${priorityStyle.badge}`}
          >
            {task.priority}
          </Badge>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditOpen(true)
              }}
              title="Edit task"
            >
              <Pencil size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              title="Delete task"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="text-sm font-medium text-foreground mb-1.5 pl-4 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => setIsEditOpen(true)}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 pl-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-4">
            {task.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <TaskEditDialog
        task={isEditOpen ? task : null}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={(updates) => onUpdate?.(updates)}
        onDelete={onDelete}
        columns={columns}
        currentColumnId={columnId}
        onStatusChange={onStatusChange}
      />
    </>
  )
}

export default TaskCard
