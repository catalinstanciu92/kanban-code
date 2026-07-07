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

const PRIORITY_CONFIG: Record<Task['priority'], {
  badge: string
  border: string
  dot: string
  label: string
}> = {
  low: {
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20',
    border: 'border-l-slate-500/60',
    dot: 'bg-slate-400',
    label: 'Low',
  },
  medium: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
    border: 'border-l-amber-500/80',
    dot: 'bg-amber-400',
    label: 'Medium',
  },
  high: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25',
    border: 'border-l-orange-500/90',
    dot: 'bg-orange-400',
    label: 'High',
  },
  critical: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30',
    border: 'border-l-red-500',
    dot: 'bg-red-500 animate-pulse',
    label: 'Critical',
  },
}

const TAG_COLORS = [
  'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'bg-pink-500/15 text-pink-300 border-pink-500/20',
  'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
]

function getTagColor(index: number): string {
  return TAG_COLORS[index % TAG_COLORS.length]
}

function TaskCard({ task, columnId, columns, onDelete, onUpdate, onStatusChange }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
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
    transition: isExiting ? 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' : transition,
  }

  const priorityConfig = PRIORITY_CONFIG[task.priority]

  const handleDelete = () => {
    setIsExiting(true)
    // Wait for exit animation before calling onDelete
    setTimeout(() => {
      onDelete()
    }, 250)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 cursor-default transition-all duration-300 ease-out border-l-[3px] animate-card-enter ${priorityConfig.border} ${
          isDragging 
            ? 'opacity-60 shadow-2xl ring-2 ring-primary/30 scale-[1.02] rotate-1 drag-preview' 
            : 'hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 hover-lift'
        } ${isExiting ? 'animate-card-exit' : ''}`}
      >
        {/* Glassmorphism overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Drag Handle - Always visible on mobile, hover on desktop */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-all duration-200 rounded-md hover:bg-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 icon-transition"
        >
          <GripVertical size={18} className="sm:size-4" />
        </div>

        {/* Header with Priority and Actions */}
        <div className="flex items-start justify-between gap-2 mb-3 pl-6 sm:pl-7">
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full border ${priorityConfig.badge} transition-all duration-200 hover:scale-105`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${priorityConfig.dot}`} />
            {priorityConfig.label}
          </Badge>

          {/* Action Buttons - Appear on hover */}
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 translate-y-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditOpen(true)
              }}
              title="Edit task"
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              title="Delete task"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold text-white/90 mb-2 pl-6 sm:pl-7 line-clamp-2 cursor-pointer hover:text-white transition-all duration-200 leading-relaxed link-underline"
          onClick={() => setIsEditOpen(true)}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-white/50 mb-3 pl-6 sm:pl-7 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-6 sm:pl-7">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={tag} 
                variant="outline"
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getTagColor(index)} transition-all duration-200 hover:scale-105`}
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge 
                variant="outline"
                className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-white/5 text-white/40 border-white/10"
              >
                +{task.tags.length - 3}
              </Badge>
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
