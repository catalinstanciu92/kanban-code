import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { Column } from '../Column/Column'
import type { ColumnConfig, Task, TasksByColumn, KanbanConfig } from '../../types'
import { Wifi, WifiOff, Settings, Kanban } from 'lucide-react'
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
    <div className="flex flex-col h-screen bg-background animate-fade-in">
      {/* Header - Minimal: Title, Settings, and Connection Status */}
      <header className="flex-shrink-0 sticky top-0 z-50">
        {/* Glassmorphism background with subtle border */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />

        <div className="relative px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between max-w-full">
            {/* Left section: Logo and Title */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 sm:w-9 sm:h-9">
                <Kanban className="w-4 h-4 text-primary-foreground sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                KanbanCode
              </h1>
            </div>

            {/* Right section: Actions and Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Config Button - Modern ghost style with hover effect */}
              {onConfigSave && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfigDialogOpen(true)}
                  className="h-8 gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              )}

              {/* Connection Status - Modern pulse animation */}
              <div
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                  isConnected
                    ? 'bg-emerald-500/[0.08] text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/[0.12] dark:border-emerald-500/30'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
                data-testid="connection-status"
              >
                {isConnected ? (
                  <>
                    {/* Animated pulse dot */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Wifi className="w-3.5 h-3.5 hidden sm:block" />
                    <span className="hidden sm:inline">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Columns Container */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden touch-pan-x">
          <div className="flex gap-3 p-3 h-full min-w-max sm:p-6">
            {sortedColumns.map((column, index) => (
              <div
                key={column.id}
                className="animate-stagger-in"
                style={{ '--stagger-delay': `${index * 80}ms` } as React.CSSProperties}
              >
                <Column
                  config={column}
                  tasks={tasks[column.id] ?? []}
                  allColumns={sortedColumns}
                  onTaskCreate={(title, description, priority, tags) => onTaskCreate(column.id, title, description, priority, tags)}
                  onTaskDelete={(taskId) => onTaskDelete(taskId, column.id)}
                  onTaskUpdate={(taskId, updates) => onTaskUpdate?.(taskId, column.id, updates)}
                  onTaskMove={(taskId, toColumnId) => onTaskMove(taskId, column.id, toColumnId)}
                />
              </div>
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
