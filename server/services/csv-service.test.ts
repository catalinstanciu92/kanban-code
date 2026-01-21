import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CsvService } from './csv-service'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'

describe('CsvService', () => {
  const testDir = './test-db'
  let service: CsvService

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
    service = new CsvService(testDir)
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('readTasks', () => {
    it('should return empty array for non-existent file', async () => {
      const tasks = await service.readTasks('nonexistent.csv')
      expect(tasks).toEqual([])
    })

    it('should parse CSV file correctly', async () => {
      const csv = `id,title,description,priority,created_at,updated_at,tags
uuid-1,Test Task,Description,high,2025-01-19T10:00:00Z,2025-01-19T10:00:00Z,"tag1,tag2"`
      await writeFile(join(testDir, 'test.csv'), csv)
      
      const tasks = await service.readTasks('test.csv')
      
      expect(tasks).toHaveLength(1)
      expect(tasks[0]).toMatchObject({
        id: 'uuid-1',
        title: 'Test Task',
        priority: 'high',
        tags: ['tag1', 'tag2']
      })
    })
  })

  describe('writeTask', () => {
    it('should create file if not exists', async () => {
      const task = {
        id: 'uuid-1',
        title: 'New Task',
        description: '',
        priority: 'medium' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      }
      
      await service.writeTask('new.csv', task)
      const tasks = await service.readTasks('new.csv')
      
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('New Task')
    })
  })

  describe('moveTask', () => {
    it('should move task between files', async () => {
      // Setup source file with task
      const csv = `id,title,description,priority,created_at,updated_at,tags
uuid-1,Task to Move,Desc,low,2025-01-19T10:00:00Z,2025-01-19T10:00:00Z,""`
      await writeFile(join(testDir, 'source.csv'), csv)
      
      await service.moveTask('uuid-1', 'source.csv', 'target.csv')
      
      const sourceTasks = await service.readTasks('source.csv')
      const targetTasks = await service.readTasks('target.csv')
      
      expect(sourceTasks).toHaveLength(0)
      expect(targetTasks).toHaveLength(1)
      expect(targetTasks[0].id).toBe('uuid-1')
    })
  })
})
