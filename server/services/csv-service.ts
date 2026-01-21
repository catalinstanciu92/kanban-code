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

  async updateTask(filename: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
    const tasks = await this.readTasks(filename)
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex === -1) {
      return null
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    tasks[taskIndex] = updatedTask
    await this.writeTasks(filename, tasks)
    
    return updatedTask
  }
}
