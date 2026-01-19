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
    const newTask = `\nexternal-task-1,External Task,Added by external app,high,${new Date().toISOString()},${new Date().toISOString()},\"external\"`
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
