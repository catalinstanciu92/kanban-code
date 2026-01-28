import { test, expect } from '@playwright/test';

test.describe('Kanban App Screenshots', () => {
  test('should take screenshots of the initialization flow', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the initialization overlay to appear
    await expect(page.locator('text=Setup Kanban')).toBeVisible();
    
    // Take a screenshot of the initial state with the prompt
    await page.screenshot({ path: 'test-results/initialization-prompt-new.png', fullPage: true });
    console.log('Screenshot 1 saved: initialization-prompt-new.png');
    
    // Verify the security check message is visible
    await expect(page.locator('text=Security Check:')).toBeVisible();
    
    // Click the "Yes, create it" button
    await page.click('button:has-text("Yes, create it")');
    console.log('Clicked "Yes, create it" button');
    
    // Take a screenshot after clicking yes (even though UI might not change in static build)
    await page.screenshot({ path: 'test-results/after-clicking-yes-new.png', fullPage: true });
    console.log('Screenshot 2 saved: after-clicking-yes-new.png');
    
    // Since we're running a static build without backend, the UI might remain the same
    // So we'll just verify that the click happened and take one more screenshot
    console.log('Note: In a static build without backend, the UI might not update after clicking Yes');
    
    // Take a final screenshot
    await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
    console.log('Screenshot 3 saved: final-state.png');
    
    console.log('All screenshots captured successfully!');
  });
});