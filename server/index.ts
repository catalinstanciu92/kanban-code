import { watch } from 'fs'
import { CsvService } from './services/csv-service'
import { ConfigService } from './services/config-service'
import type { ServerWebSocket } from 'bun'

const DB_PATH = process.env.DB_PATH ?? './db'
const PORT = Number(process.env.PORT ?? 7895)

const csvService = new CsvService(DB_PATH)
const configService = new ConfigService(DB_PATH)

// Track WebSocket clients
const clients = new Set<ServerWebSocket<unknown>>()

// File watcher using native fs.watch
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
    
    console.log(`Broadcasting file change: ${filename}`)
    clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  }, 300)
})

// Bun.serve() - Native HTTP + WebSocket server
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
    
    try {
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
      
      // Update task
      if (url.pathname.match(/^\/api\/tasks\/[\w-]+$/) && req.method === 'PUT') {
        const taskId = url.pathname.split('/')[3]
        const body = await req.json()
        const columnId = body.columnId
        const config = await configService.loadConfig()
        const column = config.columns.find(c => c.id === columnId)
        
        if (!column) {
          return Response.json({ error: 'Column not found' }, { status: 404, headers })
        }
        
        const updatedTask = await csvService.updateTask(column.file, taskId, {
          title: body.title,
          description: body.description,
          priority: body.priority,
          tags: body.tags,
        })
        
        if (!updatedTask) {
          return Response.json({ error: 'Task not found' }, { status: 404, headers })
        }
        
        return Response.json(updatedTask, { headers })
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
      // Handle incoming messages if needed
      console.log('Received message:', message)
    },
  },
})

console.log(`Server running on http://localhost:${server.port}`)
console.log(`WebSocket available at ws://localhost:${server.port}/ws`)
