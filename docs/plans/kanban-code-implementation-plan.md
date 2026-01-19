# KanbanCode Implementation Plan

## Overview

**Project Name:** KanbanCode (kanban-code)  
**Type:** Kanban-style task management system  
**Stack:** React 19 + TypeScript + Vite + TailwindCSS  
**Storage:** File-based (CSV files in `db/` directory)  
**Testing:** Vitest (unit/integration) + Playwright (E2E)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ KanbanBoard │  │  TaskCard   │  │   Column    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                           │                                      │
│                    ┌──────┴──────┐                               │
│                    │  TaskStore  │ (State Management)            │
│                    └──────┬──────┘                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    Bun Server (Bun.serve)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  CSV Parser │  │File Watcher │  │ YAML Config │              │
│  │ (PapaParse) │  │ (fs.watch)  │  │  (js-yaml)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                           │                                      │
│                    ┌──────┴──────┐                               │
│                    │  WebSocket  │ (Real-time updates)           │
│                    └─────────────┘                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                      File System (db/)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ config.yaml  │  │   Todo.csv   │  │   Done.csv   │  ...      │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Read Flow:** API reads CSV files → PapaParse parses → Returns JSON to frontend
2. **Write Flow:** Frontend sends task → API writes to CSV → File watcher detects change → WebSocket notifies all clients
3. **External Change Detection:** fs.watch() watches `db/` → Detects external modifications → WebSocket broadcasts refresh signal

---

## Project Structure

```
kanban-code/
├── db/                              # Data storage directory
│   ├── config.yaml                  # Column configuration
│   ├── todo.csv                     # Tasks in "Todo" status
│   ├── in-progress.csv              # Tasks in "In Progress" status
│   ├── in-testing.csv               # Tasks in "In Testing" status
│   ├── done.csv                     # Tasks in "Done" status
│   └── deployed.csv                 # Tasks in "Deployed" status
├── server/                          # Backend API
│   ├── index.ts                     # Server entry point
│   ├── routes/
│   │   └── tasks.ts                 # Task CRUD endpoints
│   ├── services/
│   │   ├── csv-service.ts           # CSV parsing/writing
│   │   ├── config-service.ts        # YAML config management
│   │   └── file-watcher.ts          # Native fs.watch file watching
│   ├── types/
│   │   └── index.ts                 # Shared types
│   └── websocket/
│       └── index.ts                 # WebSocket server
├── src/                             # Frontend React app
│   ├── main.tsx                     # App entry point
│   ├── App.tsx                      # Root component
│   ├── components/
│   │   ├── KanbanBoard/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanBoard.test.tsx
│   │   │   └── KanbanBoard.css
│   │   ├── Column/
│   │   │   ├── Column.tsx
│   │   │   ├── Column.test.tsx
│   │   │   └── Column.css
│   │   ├── TaskCard/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskCard.test.tsx
│   │   │   └── TaskCard.css
│   │   ├── TaskForm/
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskForm.test.tsx
│   │   │   └── TaskForm.css
│   │   └── ui/                      # shadcn/ui components
│   ├── hooks/
│   │   ├── useTasks.ts              # Task state management
│   │   ├── useTasks.test.ts
│   │   ├── useWebSocket.ts          # WebSocket connection
│   │   └── useWebSocket.test.ts
│   ├── services/
│   │   ├── api.ts                   # API client
│   │   └── api.test.ts
│   ├── types/
│   │   └── index.ts                 # Shared types
│   └── utils/
│       └── index.ts                 # Utility functions
├── tests/                           # E2E tests (Playwright)
│   ├── kanban.spec.ts
│   ├── drag-drop.spec.ts
│   └── external-changes.spec.ts
├── docs/
│   └── plans/
│       └── kanban-code-implementation-plan.md
└── package.json
```

---

## Data Models

### Task Schema (CSV)

```csv
id,title,description,priority,created_at,updated_at,tags
uuid-1,Fix login bug,Users cannot login with email,high,2025-01-19T10:00:00Z,2025-01-19T10:00:00Z,"bug,auth"
uuid-2,Add dark mode,Implement dark theme toggle,medium,2025-01-19T11:00:00Z,2025-01-19T11:00:00Z,"feature,ui"
```

### Task TypeScript Interface

```typescript
interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
  tags: string[]
}
```

### Column Configuration (db/config.yaml)

```yaml
# KanbanCode Column Configuration
# Add, remove, or reorder columns dynamically

columns:
  - id: todo
    name: Todo
    color: "#6366f1"  # Indigo
    file: todo.csv
    order: 1
    
  - id: in-progress
    name: In Progress
    color: "#f59e0b"  # Amber
    file: in-progress.csv
    order: 2
    
  - id: in-testing
    name: In Testing
    color: "#8b5cf6"  # Violet
    file: in-testing.csv
    order: 3
    
  - id: done
    name: Done
    color: "#10b981"  # Emerald
    file: done.csv
    order: 4
    
  - id: deployed
    name: Deployed
    color: "#06b6d4"  # Cyan
    file: deployed.csv
    order: 5

# Default settings for new columns
defaults:
  priority_levels:
    - low
    - medium
    - high
    - critical
  
  # File watching settings
  file_watch:
    debounce_ms: 300
    ignore_patterns:
      - "*.tmp"
      - "*.bak"
```

---

## Technology Stack & Dependencies

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "lucide-react": "^0.562.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "class-variance-authority": "^0.7.1"
  }
}
```

### Backend Dependencies (Minimal - using Bun native APIs)

```json
{
  "dependencies": {
    "papaparse": "^5.5.0",
    "js-yaml": "^4.1.0"
  }
}
```

**Note:** No Express needed! Bun provides:
- `Bun.serve()` - Native HTTP/WebSocket server (faster than Express)
- `Bun.file()` - Native file I/O
- `fs.watch()` - Native file watching (no Chokidar needed)
- `crypto.randomUUID()` - Native UUID generation
```

### Dev Dependencies (Testing)

```json
{
  "devDependencies": {
    "vitest": "^3.2.0",
    "@vitest/coverage-v8": "^3.2.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^26.0.0",
    "msw": "^2.7.0",
    "@playwright/test": "^1.50.0",
    "tsx": "^4.0.0",
    "@types/express": "^5.0.0",
    "@types/ws": "^8.5.0",
    "@types/papaparse": "^5.3.0",
    "@types/js-yaml": "^4.0.0",
    "@types/uuid": "^10.0.0"
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation & Testing Setup (TDD)

#### 1.1 Configure Testing Infrastructure

**Vitest Configuration (`vitest.config.ts`):**

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '**/*.d.ts']
    }
  }
})
```

**Test Setup (`src/test/setup.ts`):**

```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Playwright Configuration (`playwright.config.ts`):**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev:all',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 1.2 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "tsx watch server/index.ts",
    "dev:all": "concurrently \"bun run dev\" \"bun run dev:server\"",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

### Phase 2: Backend Implementation

#### 2.1 CSV Service (TDD First)

**Test File (`server/services/csv-service.test.ts`):**

```typescript
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
        priority: 'medium',
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
```

**Implementation (`server/services/csv-service.ts`):**

```typescript
import Papa from 'papaparse'
import { readFile, writeFile, access } from 'fs/promises'
import { join } from 'path'
import type { Task } from '../types'

export class CsvService {
  constructor(private dbPath: string) {}

  async readTasks(filename: string): Promise<Task[]> {
    const filePath = join(this.dbPath, filename)
    
    try {
      await access(filePath)
    } catch {
      return []
    }

    const content = await readFile(filePath, 'utf-8')
    
    const result = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for consistency
    })

    return result.data.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      priority: row.priority as Task['priority'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    }))
  }

  async writeTasks(filename: string, tasks: Task[]): Promise<void> {
    const filePath = join(this.dbPath, filename)
    
    const csvData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      tags: task.tags.join(','),
    }))

    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ['id', 'title', 'description', 'priority', 'created_at', 'updated_at', 'tags'],
    })

    await writeFile(filePath, csv, 'utf-8')
  }

  async writeTask(filename: string, task: Task): Promise<void> {
    const tasks = await this.readTasks(filename)
    const existingIndex = tasks.findIndex(t => t.id === task.id)
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task
    } else {
      tasks.push(task)
    }

    await this.writeTasks(filename, tasks)
  }

  async deleteTask(filename: string, taskId: string): Promise<void> {
    const tasks = await this.readTasks(filename)
    const filtered = tasks.filter(t => t.id !== taskId)
    await this.writeTasks(filename, filtered)
  }

  async moveTask(taskId: string, sourceFile: string, targetFile: string): Promise<void> {
    const sourceTasks = await this.readTasks(sourceFile)
    const task = sourceTasks.find(t => t.id === taskId)
    
    if (!task) {
      throw new Error(`Task ${taskId} not found in ${sourceFile}`)
    }

    task.updatedAt = new Date().toISOString()
    
    await this.deleteTask(sourceFile, taskId)
    await this.writeTask(targetFile, task)
  }
}
```

#### 2.2 Config Service

**Test File (`server/services/config-service.test.ts`):**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ConfigService } from './config-service'
import { mkdir, rm, writeFile } from 'fs/promises'

describe('ConfigService', () => {
  const testDir = './test-db'
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
})
```

**Implementation (`server/services/config-service.ts`):**

```typescript
import yaml from 'js-yaml'
import { readFile, access } from 'fs/promises'
import { join } from 'path'
import type { KanbanConfig, ColumnConfig } from '../types'

const DEFAULT_CONFIG: KanbanConfig = {
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

  constructor(dbPath: string) {
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

  private async saveConfig(config: KanbanConfig): Promise<void> {
    const content = yaml.dump(config, { indent: 2 })
    const { writeFile } = await import('fs/promises')
    await writeFile(this.configPath, content, 'utf-8')
  }
}
```

#### 2.3 File Watcher (Native fs.watch - No Chokidar!)

**Note:** We use Node's native `fs.watch()` which Bun supports. No external dependency needed.

**Test File (`server/services/file-watcher.test.ts`):**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createFileWatcher } from './file-watcher'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'

describe('FileWatcher', () => {
  const testDir = './test-db'

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  it('should emit event on file change', async () => {
    const onChange = vi.fn()
    const watcher = createFileWatcher(testDir, {
      debounceMs: 50,
      onChange,
    })

    // Create a file to trigger change
    await writeFile(join(testDir, 'test.csv'), 'data')
    
    // Wait for debounced callback
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(onChange).toHaveBeenCalled()
    watcher.close()
  })

  it('should ignore specified patterns', async () => {
    const onChange = vi.fn()
    const watcher = createFileWatcher(testDir, {
      debounceMs: 50,
      ignorePatterns: ['.tmp'],
      onChange,
    })

    await writeFile(join(testDir, 'test.tmp'), 'data')
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(onChange).not.toHaveBeenCalled()
    watcher.close()
  })
})
```

**Implementation (`server/services/file-watcher.ts`) - Using Native fs.watch:**

```typescript
import { watch, type FSWatcher } from 'fs'

interface FileWatcherOptions {
  debounceMs?: number
  ignorePatterns?: string[]
  onChange: (event: { file: string; timestamp: string }) => void
}

export function createFileWatcher(dbPath: string, options: FileWatcherOptions) {
  const { debounceMs = 300, ignorePatterns = [], onChange } = options
  let debounceTimer: Timer | null = null
  
  const watcher: FSWatcher = watch(dbPath, { recursive: true }, (event, filename) => {
    if (!filename) return
    
    // Check ignore patterns
    const shouldIgnore = ignorePatterns.some(pattern => filename.endsWith(pattern))
    if (shouldIgnore) return
    
    // Debounce rapid changes
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      onChange({
        file: filename,
        timestamp: new Date().toISOString(),
      })
    }, debounceMs)
  })
  
  return {
    close: () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      watcher.close()
    },
  }
}
```

#### 2.4 Express API Server

**Test File (`server/routes/tasks.test.ts`):**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { mkdir, rm } from 'fs/promises'

describe('Tasks API', () => {
  const testDir = './test-db'
  let app: Express.Application

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
    app = createApp(testDir)
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('GET /api/config', () => {
    it('should return column configuration', async () => {
      const response = await request(app).get('/api/config')
      
      expect(response.status).toBe(200)
      expect(response.body.columns).toBeDefined()
      expect(Array.isArray(response.body.columns)).toBe(true)
    })
  })

  describe('GET /api/tasks', () => {
    it('should return all tasks grouped by column', async () => {
      const response = await request(app).get('/api/tasks')
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('todo')
    })
  })

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'New Task',
          description: 'Test description',
          priority: 'medium',
          columnId: 'todo',
        })
      
      expect(response.status).toBe(201)
      expect(response.body.id).toBeDefined()
      expect(response.body.title).toBe('New Task')
    })
  })

  describe('PUT /api/tasks/:id/move', () => {
    it('should move task to different column', async () => {
      // Create task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Move',
          columnId: 'todo',
        })
      
      const taskId = createResponse.body.id

      // Move task
      const moveResponse = await request(app)
        .put(`/api/tasks/${taskId}/move`)
        .send({
          fromColumn: 'todo',
          toColumn: 'in-progress',
        })
      
      expect(moveResponse.status).toBe(200)
    })
  })
})
```

**Server Implementation (`server/index.ts`) - Using Bun Native APIs:**

```typescript
import { watch } from 'fs'
import { CsvService } from './services/csv-service'
import { ConfigService } from './services/config-service'
import type { ServerWebSocket } from 'bun'

const DB_PATH = process.env.DB_PATH ?? './db'
const PORT = process.env.PORT ?? 3001

const csvService = new CsvService(DB_PATH)
const configService = new ConfigService(DB_PATH)

// Track WebSocket clients
const clients = new Set<ServerWebSocket<unknown>>()

// File watcher using native fs.watch (no Chokidar needed)
let debounceTimer: Timer | null = null
watch(DB_PATH, { recursive: true }, (event, filename) => {
  if (!filename || filename.endsWith('.tmp') || filename.endsWith('.bak')) return
  
  // Debounce rapid changes
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const message = JSON.stringify({
      type: 'FILE_CHANGE',
      payload: { file: filename, event, timestamp: new Date().toISOString() },
    })
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }, 300)
})

// Bun.serve() - Native HTTP + WebSocket server (no Express!)
const server = Bun.serve({
  port: PORT,
  
  async fetch(req) {
    const url = new URL(req.url)
    
    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req)
      if (!upgraded) {
        return new Response('WebSocket upgrade failed', { status: 400 })
      }
      return undefined
    }
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }
    
    // API Routes
    if (url.pathname === '/api/config') {
      const config = await configService.loadConfig()
      return Response.json(config, { headers })
    }
    
    if (url.pathname === '/api/tasks' && req.method === 'GET') {
      const config = await configService.loadConfig()
      const tasks: Record<string, unknown[]> = {}
      
      for (const column of config.columns) {
        tasks[column.id] = await csvService.readTasks(column.file)
      }
      
      return Response.json(tasks, { headers })
    }
    
    if (url.pathname === '/api/tasks' && req.method === 'POST') {
      const body = await req.json()
      const config = await configService.loadConfig()
      const column = config.columns.find(c => c.id === body.columnId)
      
      if (!column) {
        return Response.json({ error: 'Column not found' }, { status: 404, headers })
      }
      
      const task = {
        id: crypto.randomUUID(),
        title: body.title,
        description: body.description ?? '',
        priority: body.priority ?? 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: body.tags ?? [],
      }
      
      await csvService.writeTask(column.file, task)
      return Response.json(task, { status: 201, headers })
    }
    
    if (url.pathname.match(/^\/api\/tasks\/[\w-]+\/move$/) && req.method === 'PUT') {
      const taskId = url.pathname.split('/')[3]
      const body = await req.json()
      const config = await configService.loadConfig()
      
      const fromColumn = config.columns.find(c => c.id === body.fromColumn)
      const toColumn = config.columns.find(c => c.id === body.toColumn)
      
      if (!fromColumn || !toColumn) {
        return Response.json({ error: 'Column not found' }, { status: 404, headers })
      }
      
      await csvService.moveTask(taskId, fromColumn.file, toColumn.file)
      return Response.json({ success: true }, { headers })
    }
    
    if (url.pathname.match(/^\/api\/tasks\/[\w-]+$/) && req.method === 'DELETE') {
      const taskId = url.pathname.split('/')[3]
      const columnId = url.searchParams.get('column')
      const config = await configService.loadConfig()
      const column = config.columns.find(c => c.id === columnId)
      
      if (!column) {
        return Response.json({ error: 'Column not found' }, { status: 404, headers })
      }
      
      await csvService.deleteTask(column.file, taskId)
      return new Response(null, { status: 204, headers })
    }
    
    return Response.json({ error: 'Not Found' }, { status: 404, headers })
  },
  
  websocket: {
    open(ws) {
      clients.add(ws)
      console.log('Client connected')
    },
    close(ws) {
      clients.delete(ws)
      console.log('Client disconnected')
    },
    message(ws, message) {
      // Handle incoming messages if needed
    },
  },
})

console.log(`Server running on http://localhost:${PORT}`)
console.log(`WebSocket available at ws://localhost:${PORT}/ws`)
```

---

### Phase 3: Frontend Implementation

#### 3.1 API Client

**Test File (`src/services/api.test.ts`):**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { api } from './api'
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

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
```

**Implementation (`src/services/api.ts`):**

```typescript
import type { KanbanConfig, Task, TasksByColumn, CreateTaskInput } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

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

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
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
}
```

#### 3.2 WebSocket Hook

**Test File (`src/hooks/useWebSocket.test.ts`):**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'
import WS from 'jest-websocket-mock'

describe('useWebSocket', () => {
  let mockServer: WS

  beforeEach(() => {
    mockServer = new WS('ws://localhost:3001/ws')
  })

  afterEach(() => {
    WS.clean()
  })

  it('should connect to websocket server', async () => {
    renderHook(() => useWebSocket({ onMessage: vi.fn() }))
    
    await mockServer.connected
    expect(mockServer.server.clients()).toHaveLength(1)
  })

  it('should call onMessage when receiving message', async () => {
    const onMessage = vi.fn()
    renderHook(() => useWebSocket({ onMessage }))
    
    await mockServer.connected
    
    act(() => {
      mockServer.send(JSON.stringify({ type: 'FILE_CHANGE' }))
    })
    
    expect(onMessage).toHaveBeenCalledWith({ type: 'FILE_CHANGE' })
  })

  it('should reconnect on disconnect', async () => {
    const { result } = renderHook(() => useWebSocket({
      onMessage: vi.fn(),
      reconnectInterval: 100,
    }))
    
    await mockServer.connected
    mockServer.close()
    
    // Wait for reconnect
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(result.current.isConnected).toBe(false)
  })
})
```

**Implementation (`src/hooks/useWebSocket.ts`):**

```typescript
import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  payload?: unknown
}

interface UseWebSocketOptions {
  onMessage: (message: WebSocketMessage) => void
  reconnectInterval?: number
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { onMessage, reconnectInterval = 3000 } = options
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/ws'
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          onMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      wsRef.current.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected, reconnecting...')
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [onMessage, reconnectInterval])

  useEffect(() => {
    connect()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  return { isConnected }
}
```

#### 3.3 Task Store Hook

**Test File (`src/hooks/useTasks.test.ts`):**

```typescript
import { describe, it, expect, vi } from 'vitest'
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
```

#### 3.4 Kanban Board Component

**Test File (`src/components/KanbanBoard/KanbanBoard.test.tsx`):**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanBoard } from './KanbanBoard'

describe('KanbanBoard', () => {
  const mockColumns = [
    { id: 'todo', name: 'Todo', color: '#6366f1', file: 'todo.csv', order: 1 },
    { id: 'done', name: 'Done', color: '#10b981', file: 'done.csv', order: 2 },
  ]

  const mockTasks = {
    todo: [
      { id: '1', title: 'Task 1', description: '', priority: 'medium', createdAt: '', updatedAt: '', tags: [] },
    ],
    done: [],
  }

  it('should render all columns', () => {
    render(
      <KanbanBoard
        columns={mockColumns}
        tasks={mockTasks}
        onTaskMove={vi.fn()}
        onTaskCreate={vi.fn()}
        onTaskDelete={vi.fn()}
      />
    )
    
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should render tasks in correct columns', () => {
    render(
      <KanbanBoard
        columns={mockColumns}
        tasks={mockTasks}
        onTaskMove={vi.fn()}
        onTaskCreate={vi.fn()}
        onTaskDelete={vi.fn()}
      />
    )
    
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('should show connection status indicator', () => {
    render(
      <KanbanBoard
        columns={mockColumns}
        tasks={mockTasks}
        onTaskMove={vi.fn()}
        onTaskCreate={vi.fn()}
        onTaskDelete={vi.fn()}
        isConnected={true}
      />
    )
    
    expect(screen.getByTestId('connection-status')).toHaveClass('connected')
  })
})
```

**Implementation (`src/components/KanbanBoard/KanbanBoard.tsx`):**

```tsx
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { Column } from '../Column/Column'
import type { ColumnConfig, Task, TasksByColumn } from '../../types'
import './KanbanBoard.css'

interface KanbanBoardProps {
  columns: ColumnConfig[]
  tasks: TasksByColumn
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void
  onTaskCreate: (columnId: string, title: string) => void
  onTaskDelete: (taskId: string, columnId: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  isConnected?: boolean
}

function KanbanBoard({
  columns,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskDelete,
  onTaskUpdate,
  isConnected = false,
}: KanbanBoardProps) {
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return
    
    const taskId = active.id as string
    const fromColumn = active.data.current?.columnId as string
    const toColumn = over.id as string
    
    if (fromColumn !== toColumn) {
      onTaskMove(taskId, fromColumn, toColumn)
    }
  }

  return (
    <div className="kanban-board">
      <header className="kanban-header">
        <h1>KanbanCode</h1>
        <div
          className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
          data-testid="connection-status"
        >
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </header>
      
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {sortedColumns.map((column) => (
            <Column
              key={column.id}
              config={column}
              tasks={tasks[column.id] ?? []}
              onTaskCreate={(title) => onTaskCreate(column.id, title)}
              onTaskDelete={(taskId) => onTaskDelete(taskId, column.id)}
              onTaskUpdate={onTaskUpdate}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

export default KanbanBoard
```

---

### Phase 4: E2E Testing (Playwright)

#### 4.1 Basic E2E Tests

**Test File (`tests/kanban.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test'

test.describe('KanbanCode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display kanban board with columns', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'KanbanCode' })).toBeVisible()
    await expect(page.getByText('Todo')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('should create a new task', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).first().click()
    await page.getByPlaceholder('Task title').fill('New E2E Task')
    await page.getByRole('button', { name: 'Create' }).click()
    
    await expect(page.getByText('New E2E Task')).toBeVisible()
  })

  test('should show connection status', async ({ page }) => {
    const status = page.getByTestId('connection-status')
    await expect(status).toBeVisible()
    await expect(status).toHaveText('Live')
  })
})
```

#### 4.2 Drag and Drop Tests

**Test File (`tests/drag-drop.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Create a test task
    await page.getByRole('button', { name: 'Add Task' }).first().click()
    await page.getByPlaceholder('Task title').fill('Draggable Task')
    await page.getByRole('button', { name: 'Create' }).click()
  })

  test('should drag task from Todo to In Progress', async ({ page }) => {
    const task = page.getByText('Draggable Task')
    const inProgressColumn = page.getByTestId('column-in-progress')
    
    await task.dragTo(inProgressColumn)
    
    // Verify task is now in In Progress column
    await expect(inProgressColumn.getByText('Draggable Task')).toBeVisible()
  })

  test('should persist task position after drag', async ({ page }) => {
    const task = page.getByText('Draggable Task')
    const doneColumn = page.getByTestId('column-done')
    
    await task.dragTo(doneColumn)
    
    // Reload page
    await page.reload()
    
    // Task should still be in Done column
    await expect(doneColumn.getByText('Draggable Task')).toBeVisible()
  })
})
```

#### 4.3 External Change Detection Tests

**Test File (`tests/external-changes.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const DB_PATH = './db'

test.describe('External File Changes', () => {
  test('should detect and reload when CSV file is modified externally', async ({ page }) => {
    await page.goto('/')
    
    // Wait for initial load
    await expect(page.getByRole('heading', { name: 'KanbanCode' })).toBeVisible()
    
    // Read current todo.csv
    const todoPath = join(DB_PATH, 'todo.csv')
    const currentContent = await readFile(todoPath, 'utf-8')
    
    // Append a new task externally
    const newTask = `\nexternal-task-1,External Task,Added by external app,high,${new Date().toISOString()},${new Date().toISOString()},"external"`
    await writeFile(todoPath, currentContent + newTask, 'utf-8')
    
    // Wait for WebSocket notification and UI refresh
    await expect(page.getByText('External Task')).toBeVisible({ timeout: 5000 })
  })

  test('should detect config.yaml changes and add new column', async ({ page }) => {
    await page.goto('/')
    
    // Read current config
    const configPath = join(DB_PATH, 'config.yaml')
    const currentConfig = await readFile(configPath, 'utf-8')
    
    // Add a new column
    const newColumn = `
  - id: archived
    name: Archived
    color: "#94a3b8"
    file: archived.csv
    order: 6`
    
    await writeFile(configPath, currentConfig + newColumn, 'utf-8')
    
    // Wait for new column to appear
    await expect(page.getByText('Archived')).toBeVisible({ timeout: 5000 })
    
    // Restore original config
    await writeFile(configPath, currentConfig, 'utf-8')
  })
})
```

---

### Phase 5: Initialization & Database Setup

#### 5.1 Database Initialization Script

**(`scripts/init-db.ts`):**

```typescript
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
```

---

## Testing Strategy

### Unit Tests (Vitest)

| Component | Coverage Target | Focus Areas |
|-----------|-----------------|-------------|
| CsvService | 90%+ | Parsing, writing, edge cases |
| ConfigService | 90%+ | YAML parsing, defaults |
| FileWatcher | 80%+ | Events, debouncing |
| API Routes | 85%+ | CRUD operations, errors |
| useTasks hook | 85%+ | State management |
| useWebSocket hook | 80%+ | Connection, reconnection |
| Components | 75%+ | Rendering, interactions |

### E2E Tests (Playwright)

| Scenario | Priority |
|----------|----------|
| Board loads correctly | Critical |
| Create/Edit/Delete tasks | Critical |
| Drag and drop between columns | Critical |
| External file change detection | High |
| Config.yaml column updates | High |
| WebSocket reconnection | Medium |
| Error handling & recovery | Medium |

### Test Commands

```bash
# Unit tests
bun run test           # Watch mode
bun run test:run       # Single run
bun run test:coverage  # With coverage

# E2E tests
bun run test:e2e       # Headless
bun run test:e2e:ui    # Interactive UI
```

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Testing Setup | 1 day | Vitest, Playwright configured |
| Phase 2: Backend | 2-3 days | CSV/YAML services, API, WebSocket |
| Phase 3: Frontend | 2-3 days | Components, hooks, drag-drop |
| Phase 4: E2E Tests | 1 day | Full E2E coverage |
| Phase 5: Polish | 1 day | Init script, docs, error handling |

**Total Estimated Time: 7-9 days**

---

## Key Decisions

1. **PapaParse** for CSV parsing - fastest in-browser parser, RFC 4180 compliant
2. **Native fs.watch()** for file watching - zero deps, Bun-compatible
3. **js-yaml** for YAML config - fast, well-maintained
4. **@dnd-kit** for drag-and-drop - modern, accessible, React-native
5. **Bun.serve()** for API server - native HTTP/WebSocket, no Express needed
6. **crypto.randomUUID()** for IDs - native, no uuid package needed

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSV corruption from concurrent writes | High | File locking, atomic writes |
| WebSocket disconnection during operations | Medium | Optimistic updates + queue |
| Large CSV files performance | Medium | Streaming with PapaParse |
| External app writes incomplete data | Medium | Validation on read, error recovery |

---

## Next Steps

1. Run `bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test`
2. Run `bun add papaparse js-yaml @dnd-kit/core @dnd-kit/sortable`
3. Run `bun add -d @types/papaparse @types/js-yaml`
4. Create `scripts/init-db.ts` and run it
5. Follow TDD: write tests first, then implement
