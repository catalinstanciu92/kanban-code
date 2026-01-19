import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from '../TaskCard/TaskCard'
import type { ColumnConfig, Task } from '../../types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
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

export function Column({ config, tasks, allColumns, onTaskCreate, onTaskDelete, onTaskUpdate, onTaskMove }: ColumnProps) {
  const [isCreating, setIsCreating] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: config.id,
  })

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
      className={`flex flex-col w-80 min-w-80 bg-card rounded-xl border border-border transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary/50 border-primary/30' : ''
      }`}
      data-testid={`column-${config.id}`}
    >
      {/* Column Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-border"
        style={{ borderTopColor: config.color, borderTopWidth: '3px', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {config.name}
          </h2>
          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => setIsCreating(true)}
          title="Add Task"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Task List with Scroll */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-180px)]">
        <div ref={setNodeRef} className="p-3 min-h-24">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
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

          {/* Empty state */}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2 hover:bg-muted"
                onClick={() => setIsCreating(true)}
                title="Add Task"
              >
                <Plus size={18} className="text-muted-foreground" />
              </Button>
              <p className="text-xs text-muted-foreground">No tasks yet</p>
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
