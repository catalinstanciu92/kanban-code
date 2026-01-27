import { test, expect } from '@playwright/test';

test.describe('Full Kanban App Initialization Test', () => {
  test('should properly initialize the app and update UI after clicking Yes', async ({ page }) => {
    // Ensure we're starting with a clean state by deleting the config if it exists
    // (this simulates a first-time user experience)
    
    // Navigate to the app
    await page.goto('http://localhost:3001');
    
    // Wait for the initialization overlay to appear
    await expect(page.locator('text=Setup Kanban')).toBeVisible();
    console.log('✓ Initialization overlay is visible');
    
    // Take a screenshot of the initial state with the prompt
    await page.screenshot({ path: 'test-results/full-init-initial.png', fullPage: true });
    console.log('Screenshot saved: full-init-initial.png');
    
    // Verify the security check message is visible
    await expect(page.locator('text=Security Check:')).toBeVisible();
    
    // Click the "Yes, create it" button
    await page.click('button:has-text("Yes, create it")');
    console.log('✓ Clicked "Yes, create it" button');
    
    // Take a screenshot after clicking yes
    await page.screenshot({ path: 'test-results/full-init-after-click.png', fullPage: true });
    console.log('Screenshot saved: full-init-after-click.png');
    
    // Wait for the initialization to complete and the overlay to disappear
    // This should happen once the API call to initialize completes
    await expect(page.locator('text=Setup Kanban')).not.toBeVisible({ timeout: 15000 });
    console.log('✓ Initialization overlay disappeared');
    
    // Verify we see the main app interface
    await expect(page.locator('text=Kanban')).toBeVisible();
    await expect(page.locator('text=Todo')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
    
    // Take a final screenshot showing the main app loaded
    await page.screenshot({ path: 'test-results/full-init-main-app.png', fullPage: true });
    console.log('Screenshot saved: full-init-main-app.png');
    
    console.log('✓ Full initialization completed successfully!');
  });
});