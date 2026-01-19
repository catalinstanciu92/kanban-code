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
