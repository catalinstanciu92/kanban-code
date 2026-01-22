import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Agent, CreateAgentInput, UpdateAgentInput, AgentTools } from '@/types'

interface AgentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent?: Agent
  onSave: (input: CreateAgentInput | UpdateAgentInput) => Promise<void>
  onDelete?: () => Promise<void>
  isLoading?: boolean
}

const defaultTools: AgentTools = {
  read: true,
  write: true,
  edit: true,
  bash: true,
  grep: true,
  glob: true,
  lsp: true,
}

const defaultBody = `# Agent Name

You are an expert...

## Your Core Responsibilities

1. 

## Technical Expertise

### 

`

function AgentEditDialog({ 
  open, 
  onOpenChange, 
  agent, 
  onSave, 
  onDelete,
  isLoading = false 
}: AgentEditDialogProps) {
  const isEditing = !!agent

  const initialState = agent ? {
    name: agent.name,
    description: agent.description,
    mode: agent.mode,
    temperature: agent.temperature,
    model: agent.model,
    tools: agent.tools,
    body: agent.body,
  } : {
    name: '',
    description: '',
    mode: 'subagent' as const,
    temperature: 0.7,
    model: 'gpt-4',
    tools: { ...defaultTools },
    body: defaultBody,
  }

  const [name, setName] = useState(initialState.name)
  const [description, setDescription] = useState(initialState.description)
  const [mode, setMode] = useState<'subagent' | 'agent'>(initialState.mode)
  const [temperature, setTemperature] = useState(initialState.temperature)
  const [model, setModel] = useState(initialState.model)
  const [tools, setTools] = useState<AgentTools>(initialState.tools)
  const [body, setBody] = useState(initialState.body)

  const handleToolToggle = (tool: keyof AgentTools) => {
    setTools(prev => ({ ...prev, [tool]: !prev[tool] }))
  }

  const handleSave = async () => {
    const input = isEditing
      ? { description, mode, temperature, model, tools, body }
      : { name, description, mode, temperature, model, tools, body }
    await onSave(input)
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete()
      onOpenChange(false)
    }
  }

  return (
    <Dialog key={agent?.name ?? 'new'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., backend-architect"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the agent's role"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === 'subagent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('subagent')}
                  disabled={isLoading}
                >
                  Subagent
                </Button>
                <Button
                  type="button"
                  variant={mode === 'agent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('agent')}
                  disabled={isLoading}
                >
                  Agent
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., gpt-4, claude-3-opus"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Temperature: {temperature}</Label>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([value]) => setTemperature(value)}
              min={0}
              max={2}
              step={0.1}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Tools</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['read', 'write', 'edit', 'bash', 'grep', 'glob', 'lsp'] as const).map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Switch
                    id={`tool-${tool}`}
                    checked={tools[tool] ?? false}
                    onCheckedChange={() => handleToolToggle(tool)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`tool-${tool}`} className="capitalize">{tool}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Instructions (Markdown)</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Agent'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AgentEditDialog
