import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from '../TaskCard/TaskCard'
import type { ColumnConfig, Task } from '../../types'
import { Plus, ClipboardList } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskEditDialog } from '../TaskEditDialog/TaskEditDialog'

interface ColumnProps {
  config: ColumnConfig
  tasks: Task[]
  allColumns?: ColumnConfig[]
  onTaskCreate: (title: string, description: string, priority: Task['priority'], tags: string[]) => void
  onTaskDelete: (taskId: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskMove?: (taskId: string, toColumnId: string) => void
}

// Get color accent based on column name/type
function getColumnAccent(columnName: string): string {
  const name = columnName.toLowerCase()
  if (name.includes('todo') || name.includes('backlog')) return 'var(--info)'
  if (name.includes('progress') || name.includes('doing')) return 'oklch(0.75 0.15 75)'
  if (name.includes('test') || name.includes('review')) return 'oklch(0.7 0.18 300)'
  if (name.includes('done') || name.includes('complete')) return 'var(--success)'
  return 'var(--accent)'
}

export function Column({ config, tasks, allColumns, onTaskCreate, onTaskDelete, onTaskUpdate, onTaskMove }: ColumnProps) {
  const [isCreating, setIsCreating] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: config.id,
  })

  const accentColor = useMemo(() => getColumnAccent(config.name), [config.name])

  function handleCreateTask(updates: Partial<Task>) {
    onTaskCreate(
      updates.title || '',
      updates.description || '',
      updates.priority || 'medium',
      updates.tags || []
    )
  }

  return (
    <div
      className={`group flex flex-col w-full md:w-80 min-w-[280px] max-w-full rounded-2xl border backdrop-blur-xl transition-all duration-300 ease-out ${
        isOver
          ? 'ring-2 ring-primary/40 border-primary/40 bg-card/90 scale-[1.01]'
          : 'border-border/50 bg-card/60 hover:bg-card/80 hover:border-border/80'
      }`}
      data-testid={`column-${config.id}`}
    >
      {/* Column Header with Glassmorphism */}
      <div
        className="relative flex items-center justify-between px-4 py-4 border-b border-border/50 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 60%)`,
        }}
      >
        {/* Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}40` }}
        />

        {/* Left Accent Bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-60"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex items-center gap-3 pl-3">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            {config.name}
          </h2>
          <span
            className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-semibold rounded-full border transition-colors duration-200"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: `${accentColor}30`,
              color: accentColor,
            }}
          >
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground/80 hover:text-foreground hover:bg-white/5 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
          onClick={() => setIsCreating(true)}
          title="Add Task"
        >
          <Plus size={14} className="transition-transform duration-200" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Task List with Scroll */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-180px)]">
        <div
          ref={setNodeRef}
          className="p-3 min-h-[120px] smooth-height"
          style={{
            minHeight: tasks.length === 0 ? '120px' : `${tasks.length * 100 + 20}px`,
          }}
        >
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5 stagger-children">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnId={config.id}
                  columns={allColumns}
                  onDelete={() => onTaskDelete(task.id)}
                  onUpdate={(updates) => onTaskUpdate?.(task.id, updates)}
                  onStatusChange={(newColumnId) => onTaskMove?.(task.id, newColumnId)}
                />
              ))}
            </div>
          </SortableContext>

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-fade-in">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 hover:scale-110 hover:rotate-3"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}10 0%, ${accentColor}05 100%)`,
                  border: `1px solid ${accentColor}20`,
                }}
              >
                <ClipboardList size={20} style={{ color: accentColor, opacity: 0.6 }} className="transition-transform duration-300" />
              </div>
              <p className="text-sm font-medium text-muted-foreground/80 mb-1">
                No tasks yet
              </p>
              <p className="text-xs text-muted-foreground/50 mb-3">
                Drag tasks here or create a new one
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground/70 hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => setIsCreating(true)}
              >
                <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90" />
                Create task
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <TaskEditDialog
        task={null}
        open={isCreating}
        onOpenChange={setIsCreating}
        onSave={handleCreateTask}
      />
    </div>
  )
}

export default Column
