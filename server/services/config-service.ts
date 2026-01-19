import yaml from 'js-yaml'
import { readFile, access, writeFile } from 'fs/promises'
import { join } from 'path'
import type { KanbanConfig, ColumnConfig } from '../types'

export const DEFAULT_CONFIG: KanbanConfig = {
  columns: [
    { id: 'todo', name: 'Todo', color: '#6366f1', file: 'todo.csv', order: 1 },
    { id: 'in-progress', name: 'In Progress', color: '#f59e0b', file: 'in-progress.csv', order: 2 },
    { id: 'in-testing', name: 'In Testing', color: '#8b5cf6', file: 'in-testing.csv', order: 3 },
    { id: 'done', name: 'Done', color: '#10b981', file: 'done.csv', order: 4 },
    { id: 'deployed', name: 'Deployed', color: '#06b6d4', file: 'deployed.csv', order: 5 },
  ],
  defaults: {
    priority_levels: ['low', 'medium', 'high', 'critical'],
    file_watch: {
      debounce_ms: 300,
      ignore_patterns: ['*.tmp', '*.bak'],
    },
  },
}

export class ConfigService {
  private configPath: string

  constructor(private dbPath: string) {
    this.configPath = join(dbPath, 'config.yaml')
  }

  async loadConfig(): Promise<KanbanConfig> {
    try {
      await access(this.configPath)
    } catch {
      return DEFAULT_CONFIG
    }

    const content = await readFile(this.configPath, 'utf-8')
    const parsed = yaml.load(content) as Partial<KanbanConfig>
    
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      columns: parsed.columns ?? DEFAULT_CONFIG.columns,
      defaults: {
        ...DEFAULT_CONFIG.defaults,
        ...(parsed.defaults || {}),
        file_watch: {
          ...DEFAULT_CONFIG.defaults.file_watch,
          ...(parsed.defaults?.file_watch || {}),
        }
      }
    }
  }

  async ensureConfigExists(): Promise<void> {
    try {
      await access(this.configPath)
    } catch {
      await this.saveConfig(DEFAULT_CONFIG)
    }
  }

  async configExists(): Promise<boolean> {
    try {
      await access(this.configPath)
      return true
    } catch {
      return false
    }
  }

  async addColumn(column: Omit<ColumnConfig, 'order'>): Promise<void> {
    const config = await this.loadConfig()
    const maxOrder = Math.max(...config.columns.map(c => c.order), 0)
    
    config.columns.push({
      ...column,
      order: maxOrder + 1,
    })

    await this.saveConfig(config)
  }

  async saveConfig(config: KanbanConfig): Promise<void> {
    const content = yaml.dump(config, { indent: 2 })
    await writeFile(this.configPath, content, 'utf-8')
  }
}
