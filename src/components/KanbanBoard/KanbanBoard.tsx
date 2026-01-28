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
      <header className="flex-shrink-0 px-3 py-3 bg-card border-b border-border sm:px-6 sm:py-4">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center sm:w-8 sm:h-8">
              <div className="w-3 h-3 rounded-sm bg-primary sm:w-4 sm:h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              KanbanCode
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {onConfigSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfigDialogOpen(true)}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm p-2 sm:p-3"
              >
                <Settings size={14} className="mr-1 sm:mr-2 sm:size-16" />
                Config
              </Button>
            )}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors sm:text-xs sm:gap-2 sm:px-3 sm:py-1.5 ${
                isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
              data-testid="connection-status"
            >
              {isConnected ? (
                <>
                  <Wifi size={12} className="sm:size-14" />
                  <span className="hidden sm:inline">Live</span>
                  <span className="sm:hidden">L</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="sm:size-14" />
                  <span className="hidden sm:inline">Offline</span>
                  <span className="sm:hidden">O</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Columns Container */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden touch-pan-x">
          <div className="flex gap-3 p-3 h-full min-w-max sm:p-6">
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
