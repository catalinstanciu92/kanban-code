import { test, expect } from '@playwright/test';

test.describe('Initialize Kanban App and Click Yes', () => {
  test('should start server and click yes on initialization prompt', async ({ page }) => {
    // Navigate to the app - using the configured port in playwright config
    await page.goto('/');
    
    // Wait for the initialization overlay to appear
    await expect(page.locator('text=Setup Kanban')).toBeVisible();
    
    // Take a screenshot of the initial state with the prompt
    await page.screenshot({ path: 'test-results/initialization-prompt.png', fullPage: true });
    console.log('Screenshot saved: initialization-prompt.png');
    
    // Verify the security check message is visible
    await expect(page.locator('text=Security Check:')).toBeVisible();
    
    // Click the "Yes, create it" button
    await page.click('button:has-text("Yes, create it")');
    
    // Take a screenshot after clicking yes
    await page.screenshot({ path: 'test-results/after-clicking-yes.png', fullPage: true });
    console.log('Screenshot saved: after-clicking-yes.png');
    
    // Wait for the initialization to complete and the overlay to disappear
    await expect(page.locator('text=Setup Kanban')).not.toBeVisible();
    
    // Verify we see the main app interface
    await expect(page.locator('text=Kanban')).toBeVisible();
    await expect(page.locator('text=Todo')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
    
    // Take a final screenshot showing the main app loaded
    await page.screenshot({ path: 'test-results/main-app-loaded.png', fullPage: true });
    console.log('Screenshot saved: main-app-loaded.png');
    
    console.log('Successfully completed initialization and clicked yes!');
  });
});