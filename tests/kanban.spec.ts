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
