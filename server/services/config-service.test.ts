import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ConfigService } from './config-service'
import { mkdir, rm, writeFile } from 'fs/promises'

describe('ConfigService', () => {
  const testDir = './test-db-config'
  let service: ConfigService

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
    service = new ConfigService(testDir)
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  it('should load column configuration from YAML', async () => {
    const yaml = `
columns:
  - id: todo
    name: Todo
    color: "#6366f1"
    file: todo.csv
    order: 1
`
    await writeFile(`${testDir}/config.yaml`, yaml)
    
    const config = await service.loadConfig()
    
    expect(config.columns).toHaveLength(1)
    expect(config.columns[0]).toMatchObject({
      id: 'todo',
      name: 'Todo',
      file: 'todo.csv'
    })
  })

  it('should return default config if file missing', async () => {
    const config = await service.loadConfig()
    
    expect(config.columns.length).toBeGreaterThan(0)
    expect(config.columns[0].id).toBe('todo')
  })

  it('should add a new column and save it', async () => {
    await service.addColumn({
      id: 'archived',
      name: 'Archived',
      color: '#94a3b8',
      file: 'archived.csv'
    })

    const config = await service.loadConfig()
    const archived = config.columns.find(c => c.id === 'archived')
    
    expect(archived).toBeDefined()
    expect(archived?.order).toBe(6) // Default has 5 columns, so 6th
    expect(archived?.name).toBe('Archived')
  })
})
