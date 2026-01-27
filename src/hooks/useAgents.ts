import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import type { Agent, CreateAgentInput, UpdateAgentInput } from '@/types'

interface UseAgentsReturn {
  agents: Agent[]
  isLoading: boolean
  error: Error | null
  isInitialized: boolean
  initializePath: string
  initialize: () => Promise<void>
  addAgent: (input: CreateAgentInput) => Promise<Agent>
  updateAgent: (name: string, updates: UpdateAgentInput) => Promise<Agent>
  deleteAgent: (name: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initializePath, setInitializePath] = useState('')

  const checkInitStatus = useCallback(async () => {
    try {
      const { initialized, path } = await api.checkAgentsInitStatus()
      setIsInitialized(initialized)
      setInitializePath(path)
    } catch {
      setIsInitialized(false)
      setInitializePath('.opencode/agents')
    }
  }, [])

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.fetchAgents()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch agents'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const initialize = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await api.initializeAgentsFolder()
      setIsInitialized(true)
      await fetchAgents()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize agents folder'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchAgents])

  const addAgent = useCallback(async (input: CreateAgentInput): Promise<Agent> => {
    setIsLoading(true)
    setError(null)
    try {
      const agent = await api.createAgent(input)
      setAgents(prev => [...prev, agent])
      return agent
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create agent'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAgent = useCallback(async (name: string, updates: UpdateAgentInput): Promise<Agent> => {
    setIsLoading(true)
    setError(null)
    try {
      const agent = await api.updateAgent(name, updates)
      setAgents(prev => prev.map(a => a.name === name ? agent : a))
      return agent
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update agent'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteAgent = useCallback(async (name: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await api.deleteAgent(name)
      setAgents(prev => prev.filter(a => a.name !== name))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete agent'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await checkInitStatus()
    if (isInitialized) {
      await fetchAgents()
    }
  }, [checkInitStatus, fetchAgents, isInitialized])

  return {
    agents,
    isLoading,
    error,
    isInitialized,
    initializePath,
    initialize,
    addAgent,
    updateAgent,
    deleteAgent,
    refresh,
  }
}
