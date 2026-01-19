import { mkdir, writeFile, access } from 'fs/promises'
import { join } from 'path'
import yaml from 'js-yaml'

const DB_PATH = process.env.DB_PATH ?? './db'

const DEFAULT_CONFIG = {
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

const CSV_HEADER = 'id,title,description,priority,created_at,updated_at,tags\n'

async function initDatabase() {
  console.log('Initializing database...')
  
  // Create db directory
  await mkdir(DB_PATH, { recursive: true })
  console.log(`Created directory: ${DB_PATH}`)
  
  // Create config.yaml
  const configPath = join(DB_PATH, 'config.yaml')
  try {
    await access(configPath)
    console.log('config.yaml already exists, skipping')
  } catch {
    const configContent = yaml.dump(DEFAULT_CONFIG, { indent: 2 })
    await writeFile(configPath, configContent, 'utf-8')
    console.log('Created config.yaml')
  }
  
  // Create CSV files for each column
  for (const column of DEFAULT_CONFIG.columns) {
    const csvPath = join(DB_PATH, column.file)
    try {
      await access(csvPath)
      console.log(`${column.file} already exists, skipping`)
    } catch {
      await writeFile(csvPath, CSV_HEADER, 'utf-8')
      console.log(`Created ${column.file}`)
    }
  }
  
  console.log('Database initialization complete!')
}

initDatabase().catch(console.error)
