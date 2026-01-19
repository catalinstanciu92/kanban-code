import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTasks } from './useTasks'

describe('useTasks', () => {
  it('should load tasks on mount', async () => {
    const { result } = renderHook(() => useTasks())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.tasks).toBeDefined()
  })

  it('should add a new task', async () => {
    const { result } = renderHook(() => useTasks())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.addTask({
        title: 'New Task',
        columnId: 'todo',
      })
    })
    
    expect(result.current.tasks.todo).toContainEqual(
      expect.objectContaining({ title: 'New Task' })
    )
  })

  it('should move task between columns', async () => {
    const { result } = renderHook(() => useTasks())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // Add a task first
    await act(async () => {
      await result.current.addTask({
        title: 'Task to Move',
        columnId: 'todo',
      })
    })
    
    const taskId = result.current.tasks.todo[0].id
    
    // Move task
    await act(async () => {
      await result.current.moveTask(taskId, 'todo', 'in-progress')
    })
    
    expect(result.current.tasks.todo).not.toContainEqual(
      expect.objectContaining({ id: taskId })
    )
    expect(result.current.tasks['in-progress']).toContainEqual(
      expect.objectContaining({ id: taskId })
    )
  })

  it('should refresh on external file change', async () => {
    const { result } = renderHook(() => useTasks())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    // Simulate WebSocket message
    await act(async () => {
      result.current.refresh()
    })
    
    // Should re-fetch without error
    expect(result.current.error).toBeNull()
  })
})
