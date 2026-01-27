import type { KanbanConfig, Task, TasksByColumn, CreateTaskInput, Agent, CreateAgentInput, UpdateAgentInput } from '../types'

const API_BASE = import.meta.env?.VITE_API_URL ?? 'http://localhost:7895/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  async fetchConfig(): Promise<KanbanConfig> {
    const response = await fetch(`${API_BASE}/config`)
    return handleResponse(response)
  },

  async fetchTasks(): Promise<TasksByColumn> {
    const response = await fetch(`${API_BASE}/tasks`)
    return handleResponse(response)
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return handleResponse(response)
  },

  async updateTask(id: string, columnId: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, columnId }),
    })
    return handleResponse(response)
  },

  async deleteTask(id: string, columnId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${id}?column=${columnId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`)
    }
  },

  async moveTask(taskId: string, fromColumn: string, toColumn: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromColumn, toColumn }),
    })
    if (!response.ok) {
      throw new Error(`Failed to move task: ${response.status}`)
    }
  },

  async updateConfig(config: KanbanConfig): Promise<void> {
    const response = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    return handleResponse(response)
  },

  async checkAgentsInitStatus(): Promise<{ initialized: boolean; path: string }> {
    const response = await fetch(`${API_BASE}/agents/init-status`)
    return handleResponse(response)
  },

  async initializeAgentsFolder(): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/agents/initialize`, {
      method: 'POST',
    })
    return handleResponse(response)
  },

  async fetchAgents(): Promise<Agent[]> {
    const response = await fetch(`${API_BASE}/agents`)
    return handleResponse(response)
  },

  async fetchAgent(name: string): Promise<Agent> {
    const response = await fetch(`${API_BASE}/agents/${name}`)
    return handleResponse(response)
  },

  async createAgent(input: CreateAgentInput): Promise<Agent> {
    const response = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return handleResponse(response)
  },

  async updateAgent(name: string, updates: UpdateAgentInput): Promise<Agent> {
    const response = await fetch(`${API_BASE}/agents/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return handleResponse(response)
  },

  async deleteAgent(name: string): Promise<void> {
    const response = await fetch(`${API_BASE}/agents/${name}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.status}`)
    }
  },
}
