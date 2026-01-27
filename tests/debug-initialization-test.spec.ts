import { test, expect } from '@playwright/test';

test.describe('Debug Kanban App Initialization Test', () => {
  test('should properly initialize the app and update UI after clicking Yes', async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });

    // Navigate to the app
    await page.goto('http://localhost:3001');
    
    // Wait for the initialization overlay to appear
    await expect(page.locator('text=Setup Kanban')).toBeVisible();
    console.log('✓ Initialization overlay is visible');
    
    // Take a screenshot of the initial state with the prompt
    await page.screenshot({ path: 'test-results/debug-init-initial.png', fullPage: true });
    console.log('Screenshot saved: debug-init-initial.png');
    
    // Verify the security check message is visible
    await expect(page.locator('text=Security Check:')).toBeVisible();
    
    // Click the "Yes, create it" button
    await page.click('button:has-text("Yes, create it")');
    console.log('✓ Clicked "Yes, create it" button');
    
    // Take a screenshot after clicking yes
    await page.screenshot({ path: 'test-results/debug-init-after-click.png', fullPage: true });
    console.log('Screenshot saved: debug-init-after-click.png');
    
    // Wait for the initialization to complete and the overlay to disappear
    await expect(page.locator('text=Setup Kanban')).not.toBeVisible({ timeout: 15000 });
    console.log('✓ Initialization overlay disappeared');
    
    // Wait a bit more to allow the main app to load
    await page.waitForTimeout(3000);
    
    // Check if there's a loading indicator or similar
    // If the main app doesn't appear immediately, there might be a loading state
    console.log('Checking for main app elements...');
    
    // Try different selectors for the main app
    const selectorsToTry = [
      'text=Kanban',
      'text=Todo',
      'text=In Progress',
      'text=Done',
      '[data-testid="kanban-board"]',
      '.kanban-board',
      'h1:has-text("Kanban")'
    ];
    
    for (const selector of selectorsToTry) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
        console.log(`✓ Found element with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`✗ Element not found with selector: ${selector}`);
        continue;
      }
    }
    
    // Take a final screenshot showing the current state
    await page.screenshot({ path: 'test-results/debug-init-final.png', fullPage: true });
    console.log('Screenshot saved: debug-init-final.png');
    
    console.log('Debug initialization test completed!');
  });
});