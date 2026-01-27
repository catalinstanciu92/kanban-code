import { test, expect } from '@playwright/test';

test.describe('Retry Load Test', () => {
  test('should reload and retry to fix loading errors', async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:3001');
    
    // Wait a moment for the page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of the current state (likely showing "failed to load board")
    await page.screenshot({ path: 'test-results/before-reload.png', fullPage: true });
    console.log('Screenshot saved: before-reload.png');
    
    // Reload the page
    await page.reload();
    console.log('Page reloaded');
    
    // Wait for the page to load after reload
    await page.waitForTimeout(3000);
    
    // Take another screenshot after reload
    await page.screenshot({ path: 'test-results/after-reload.png', fullPage: true });
    console.log('Screenshot saved: after-reload.png');
    
    // Look for a retry button and click it if it exists
    const retryButton = page.locator('button:has-text("Retry")');
    const isRetryVisible = await retryButton.isVisible({ timeout: 5000 });
    
    if (isRetryVisible) {
      console.log('Found retry button, clicking it...');
      await retryButton.click();
      
      // Wait for potential reload after retry
      await page.waitForTimeout(5000);
      
      // Take final screenshot after retry
      await page.screenshot({ path: 'test-results/after-retry.png', fullPage: true });
      console.log('Screenshot saved: after-retry.png');
    } else {
      console.log('No retry button found, taking final screenshot...');
      await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
      console.log('Screenshot saved: final-state.png');
    }
    
    console.log('Retry test completed!');
  });
});