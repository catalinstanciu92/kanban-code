import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { Column } from '../Column/Column'
import type { ColumnConfig, Task, TasksByColumn, KanbanConfig } from '../../types'
import { Wifi, WifiOff, Settings } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfigEditDialog } from '../ConfigEditDialog/ConfigEditDialog'

interface KanbanBoardProps {
  columns: ColumnConfig[]
  config: KanbanConfig
  tasks: TasksByColumn
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void
  onTaskCreate: (columnId: string, title: string, description: string, priority: Task['priority'], tags: string[]) => void
  onTaskDelete: (taskId: string, columnId: string) => void
  onTaskUpdate?: (taskId: string, columnId: string, updates: Partial<Task>) => void
  onConfigSave?: (config: KanbanConfig) => void
  isConnected?: boolean
}

export function KanbanBoard({
  columns,
  config,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskDelete,
  onTaskUpdate,
  onConfigSave,
  isConnected = false,
}: KanbanBoardProps) {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return
    
    const taskId = active.id as string
    const fromColumn = active.data.current?.columnId as string
    
    // Determine target column: if dropping on a task, use its columnId; otherwise over.id is the column
    const toColumn = over.data.current?.columnId ?? over.id as string
    
    if (fromColumn && toColumn && fromColumn !== toColumn) {
      onTaskMove(taskId, fromColumn, toColumn)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-sm bg-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              KanbanCode
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {onConfigSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfigDialogOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings size={16} className="mr-2" />
                Config
              </Button>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
              data-testid="connection-status"
            >
              {isConnected ? (
                <>
                  <Wifi size={14} />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Columns Container */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-6 h-full min-w-max">
            {sortedColumns.map((column) => (
              <Column
                key={column.id}
                config={column}
                tasks={tasks[column.id] ?? []}
                allColumns={sortedColumns}
                onTaskCreate={(title, description, priority, tags) => onTaskCreate(column.id, title, description, priority, tags)}
                onTaskDelete={(taskId) => onTaskDelete(taskId, column.id)}
                onTaskUpdate={(taskId, updates) => onTaskUpdate?.(taskId, column.id, updates)}
                onTaskMove={(taskId, toColumnId) => onTaskMove(taskId, column.id, toColumnId)}
              />
            ))}
          </div>
        </div>
      </DndContext>
      
      {onConfigSave && (
        <ConfigEditDialog
          config={config}
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
          onSave={onConfigSave}
        />
      )}
    </div>
  )
}

export default KanbanBoard
