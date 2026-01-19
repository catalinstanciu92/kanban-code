import { useState, useEffect } from 'react'
import type { KanbanConfig, ColumnConfig } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ConfigEditDialogProps {
  config: KanbanConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: KanbanConfig) => void
}

export function ConfigEditDialog({
  config,
  open,
  onOpenChange,
  onSave,
}: ConfigEditDialogProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setColumns([...config.columns])
    }
  }, [config])

  function handleAddColumn() {
    const newId = `column-${Date.now()}`
    const newOrder = Math.max(...columns.map(c => c.order), 0) + 1
    const newFile = `${newId}.csv`
    setColumns([...columns, {
      id: newId,
      name: 'New Column',
      color: '#6366f1',
      file: newFile,
      order: newOrder,
    }])
  }

  function handleRemoveColumn(index: number) {
    setColumns(columns.filter((_, i) => i !== index))
  }

  function handleColumnChange(index: number, field: 'name' | 'color', value: string) {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  function handleSave() {
    if (!config) return
    setIsSaving(true)
    try {
      const updatedConfig: KanbanConfig = {
        ...config,
        columns: columns.map((col, i) => ({ ...col, order: i + 1 })),
      }
      onSave(updatedConfig)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Board Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-3">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <GripVertical size={16} className="text-muted-foreground cursor-move" />
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor={`col-name-${index}`} className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        id={`col-name-${index}`}
                        value={column.name}
                        onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                        className="bg-background border-border h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`col-color-${index}`} className="text-xs text-muted-foreground">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`col-color-${index}`}
                          type="color"
                          value={column.color}
                          onChange={(e) => handleColumnChange(index, 'color', e.target.value)}
                          className="w-12 h-8 p-1 bg-background border-border cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{column.color}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveColumn(index)}
                    className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleAddColumn}
            className="w-full mb-4"
          >
            <Plus size={16} className="mr-2" />
            Add Column
          </Button>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || columns.length === 0}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfigEditDialog
