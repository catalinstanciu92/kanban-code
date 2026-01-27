export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
  tags: string[]
}

export interface ColumnConfig {
  id: string
  name: string
  color: string
  file: string
  order: number
}

export interface KanbanConfig {
  columns: ColumnConfig[]
  defaults: {
    priority_levels: string[]
    file_watch: {
      debounce_ms: number
      ignore_patterns: string[]
    }
  }
}

export type TasksByColumn = Record<string, Task[]>

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: Task['priority']
  columnId: string
  tags?: string[]
}

export interface AgentTools {
  read?: boolean
  write?: boolean
  edit?: boolean
  bash?: boolean
  grep?: boolean
  glob?: boolean
  lsp?: boolean
}

export interface Agent {
  name: string
  description: string
  mode: 'subagent' | 'agent'
  temperature: number
  model: string
  tools: AgentTools
  body: string
}

export interface CreateAgentInput extends Omit<Agent, 'name'> {
  name: string
}

export type UpdateAgentInput = Partial<Omit<Agent, 'name'>>
