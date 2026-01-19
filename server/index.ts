import { mkdir, access } from 'fs/promises'
import { CsvService } from './services/csv-service'
import { ConfigService, DEFAULT_CONFIG } from './services/config-service'
import { createFileWatcher } from './services/file-watcher'
import type { ServerWebSocket } from 'bun'

const DB_PATH = process.env.DB_PATH ?? './.kanban-code'
const PORT = Number(process.env.PORT ?? 7895)
const PWD = process.cwd()

async function dirExists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

// State to track if initialization is pending
let isInitialized = false
let initError: string | null = null

async function checkInitialization() {
  const configService = new ConfigService(DB_PATH)
  const hasDir = await dirExists(DB_PATH)
  const hasConfig = await configService.configExists()
  isInitialized = hasDir && hasConfig
}

const clients = new Set<ServerWebSocket<unknown>>()
const csvService = new CsvService(DB_PATH)
const configService = new ConfigService(DB_PATH)

// Initial check
checkInitialization()

let watcher: { close: () => void } | null = null
async function startWatcher() {
  if (watcher || !isInitialized) return
  
  try {
    const config = await configService.loadConfig()
    watcher = createFileWatcher(DB_PATH, {
      debounceMs: config.defaults.file_watch.debounce_ms,
      ignorePatterns: config.defaults.file_watch.ignore_patterns,
      onChange: ({ file, timestamp }: { file: string; timestamp: string }) => {
        const message = JSON.stringify({
          type: 'FILE_CHANGE',
          payload: { file, timestamp },
        })
        clients.forEach(client => {
          if (client.readyState === 1) client.send(message)
        })
      }
    })
    console.log(`Started watching ${DB_PATH}`)
  } catch (error) {
    console.error('Failed to start watcher:', error)
  }
}

// Try starting watcher on startup
startWatcher()

// Bun.serve()
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    
    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req)
      if (!upgraded) return new Response('WebSocket upgrade failed', { status: 400 })
      return undefined
    }
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }
    
    if (req.method === 'OPTIONS') return new Response(null, { headers })

    // Special initialization API
    if (url.pathname === '/api/init-status') {
      return Response.json({ 
        initialized: isInitialized, 
        dbPath: DB_PATH, 
        pwd: PWD,
        error: initError 
      }, { headers })
    }

    if (url.pathname === '/api/initialize' && req.method === 'POST') {
      try {
        if (!await dirExists(DB_PATH)) {
          await mkdir(DB_PATH, { recursive: true })
        }
        await configService.saveConfig(DEFAULT_CONFIG)
        isInitialized = true
        initError = null
        
        // Start watcher after initialization
        await startWatcher()
        
        return Response.json({ success: true }, { headers })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        initError = message
        return Response.json({ error: message }, { status: 500, headers })
      }
    }

    // Protect other API routes if not initialized
    if (url.pathname.startsWith('/api/') && !isInitialized) {
      return Response.json({ error: 'App not initialized' }, { status: 403, headers })
    }
    
    try {
      if (url.pathname === '/api/config') {
        if (req.method === 'GET') {
          const config = await configService.loadConfig()
          return Response.json(config, { headers })
        }
        if (req.method === 'POST') {
          const body = await req.json()
          await configService.saveConfig(body)
          return Response.json({ success: true }, { headers })
        }
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
        if (!column) return Response.json({ error: 'Column not found' }, { status: 404, headers })
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
        if (!fromColumn || !toColumn) return Response.json({ error: 'Column not found' }, { status: 404, headers })
        await csvService.moveTask(taskId, fromColumn.file, toColumn.file)
        return Response.json({ success: true }, { headers })
      }

      if (url.pathname.match(/^\/api\/tasks\/[\w-]+$/) && req.method === 'PUT') {
        const taskId = url.pathname.split('/')[3]
        const body = await req.json()
        const columnId = body.columnId
        const config = await configService.loadConfig()
        const column = config.columns.find(c => c.id === columnId)
        if (!column) return Response.json({ error: 'Column not found' }, { status: 404, headers })
        const updatedTask = await csvService.updateTask(column.file, taskId, {
          title: body.title,
          description: body.description,
          priority: body.priority,
          tags: body.tags,
        })
        if (!updatedTask) return Response.json({ error: 'Task not found' }, { status: 404, headers })
        return Response.json(updatedTask, { headers })
      }

      if (url.pathname.match(/^\/api\/tasks\/[\w-]+$/) && req.method === 'DELETE') {
        const taskId = url.pathname.split('/')[3]
        const columnId = url.searchParams.get('column')
        const config = await configService.loadConfig()
        const column = config.columns.find(c => c.id === columnId)
        if (!column) return Response.json({ error: 'Column not found' }, { status: 404, headers })
        await csvService.deleteTask(column.file, taskId)
        return new Response(null, { status: 204, headers })
      }

      // Serve static files
      const filePath = url.pathname === '/' ? '/index.html' : url.pathname
      const file = Bun.file(`./dist${filePath}`)
      if (await file.exists()) return new Response(file)
      return new Response(Bun.file('./dist/index.html'))
      
    } catch (error) {
      console.error('Server error:', error)
      return Response.json({ error: 'Internal Server Error' }, { status: 500, headers })
    }
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
      console.log('Received message:', message)
    },
  },
})

console.log(`Server running on http://localhost:${server.port}`)
