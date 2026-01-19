import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useWebSocket } from './useWebSocket'
import type { TasksByColumn, CreateTaskInput, Task, ColumnConfig } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<TasksByColumn>({})
  const [columns, setColumns] = useState<ColumnConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [config, taskData] = await Promise.all([
        api.fetchConfig(),
        api.fetchTasks(),
      ])
      setColumns(config.columns)
      setTasks(taskData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onWebSocketMessage = useCallback((message: { type: string; payload?: unknown }) => {
    if (message.type === 'FILE_CHANGE') {
      loadData()
    }
  }, [loadData])

  useWebSocket({ onMessage: onWebSocketMessage })

  const addTask = async (input: CreateTaskInput) => {
    try {
      const newTask = await api.createTask(input)
      setTasks(prev => ({
        ...prev,
        [input.columnId]: [...(prev[input.columnId] || []), newTask],
      }))
      return newTask
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add task'))
      throw err
    }
  }

  const moveTask = async (taskId: string, fromColumn: string, toColumn: string) => {
    // Optimistic update
    const taskToMove = tasks[fromColumn]?.find(t => t.id === taskId)
    if (!taskToMove) return

    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== taskId),
      [toColumn]: [...(prev[toColumn] || []), { ...taskToMove, updatedAt: new Date().toISOString() }],
    }))

    try {
      await api.moveTask(taskId, fromColumn, toColumn)
    } catch (err) {
      // Revert on error
      setError(err instanceof Error ? err : new Error('Failed to move task'))
      loadData()
      throw err
    }
  }

  const deleteTask = async (taskId: string, columnId: string) => {
    try {
      await api.deleteTask(taskId, columnId)
      setTasks(prev => ({
        ...prev,
        [columnId]: prev[columnId].filter(t => t.id !== taskId),
      }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'))
      throw err
    }
  }

  const updateTask = async (taskId: string, columnId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await api.updateTask(taskId, columnId, updates)
      setTasks(prev => ({
        ...prev,
        [columnId]: prev[columnId].map(t => t.id === taskId ? updatedTask : t),
      }))
      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'))
      throw err
    }
  }

  return {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    moveTask,
    deleteTask,
    updateTask,
    refresh: loadData,
  }
}
