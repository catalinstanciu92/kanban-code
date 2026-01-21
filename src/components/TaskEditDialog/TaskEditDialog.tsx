import { useState, useEffect } from 'react'
import type { Task, ColumnConfig } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TaskEditDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Task>) => void
  onDelete?: () => void
  columns?: ColumnConfig[]
  currentColumnId?: string
  onStatusChange?: (newColumnId: string) => void
}

const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'critical']

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
  columns,
  currentColumnId,
  onStatusChange,
}: TaskEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [status, setStatus] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setTags([...task.tags])
      setStatus(currentColumnId || '')
    } else if (open) {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setTags([])
      setStatus(currentColumnId || '')
    }
  }, [task, open, currentColumnId])

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  async function handleSave() {
    if (!title.trim()) return
    
    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        tags,
      })
      // Handle status change after save if column changed
      if (task && status && currentColumnId && status !== currentColumnId) {
        onStatusChange?.(status)
      }
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  function handleDelete() {
    onDelete?.()
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Task title"
              className="bg-background border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="bg-background border-border resize-none"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-foreground">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as Task['priority'])}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        p === 'low' ? 'bg-slate-400' :
                        p === 'medium' ? 'bg-amber-400' :
                        p === 'high' ? 'bg-orange-400' :
                        'bg-red-400'
                      }`} />
                      {p}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status (Column) - only show when editing existing task */}
          {task && columns && columns.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: col.color }}
                        />
                        {col.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground">Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 px-2 py-0.5 bg-muted text-muted-foreground"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter"
              className="bg-background border-border"
            />
          </div>

          {/* Metadata */}
          {task && (
            <div className="pt-2 border-t border-border">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {task && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
            >
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
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
              disabled={!title.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskEditDialog
