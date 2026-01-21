import { describe, it, expect } from 'vitest'
import { api } from './api'

describe('API Client', () => {
  describe('fetchConfig', () => {
    it('should fetch column configuration', async () => {
      const config = await api.fetchConfig()
      
      expect(config.columns).toBeDefined()
      expect(Array.isArray(config.columns)).toBe(true)
    })
  })

  describe('fetchTasks', () => {
    it('should fetch all tasks', async () => {
      const tasks = await api.fetchTasks()
      
      expect(tasks).toHaveProperty('todo')
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      const task = await api.createTask({
        title: 'New Task',
        columnId: 'todo',
      })
      
      expect(task.id).toBeDefined()
      expect(task.title).toBe('New Task')
    })
  })

  describe('moveTask', () => {
    it('should move task between columns', async () => {
      await expect(
        api.moveTask('task-1', 'todo', 'in-progress')
      ).resolves.not.toThrow()
    })
  })
})
