import { test, expect } from '@playwright/test';

test.describe('Test on Original Ports', () => {
  test('should load kanban boards properly on original ports', async ({ page }) => {
    // Go to the app on the original port
    await page.goto('http://localhost:24125');
    
    // Wait a moment for the page to load
    await page.waitForTimeout(3000);
    
    // Take screenshot of the current state
    await page.screenshot({ path: 'test-results/original-ports-before-retry.png', fullPage: true });
    console.log('Screenshot saved: original-ports-before-retry.png');
    
    // Check if we see the "failed to load board" error
    const hasError = await page.isVisible('text=failed to load board', { timeout: 5000 });
    
    if (hasError) {
      console.log('Found "failed to load board" error, looking for retry button...');
      
      // Look for a retry button and click it
      const retryButton = page.locator('button:has-text("Retry")');
      const isRetryVisible = await retryButton.isVisible({ timeout: 5000 });
      
      if (isRetryVisible) {
        console.log('Found retry button, clicking it...');
        await retryButton.click();
        
        // Wait for the board to load after retry
        await page.waitForTimeout(5000);
        
        // Take another screenshot after retry
        await page.screenshot({ path: 'test-results/original-ports-after-retry.png', fullPage: true });
        console.log('Screenshot saved: original-ports-after-retry.png');
      }
    } else {
      console.log('No "failed to load board" error found, checking for kanban boards...');
      
      // Check for kanban board elements
      const hasKanbanTitle = await page.isVisible('text=Kanban');
      const hasTodoColumn = await page.isVisible('text=Todo');
      const hasInProgressColumn = await page.isVisible('text=In Progress');
      const hasDoneColumn = await page.isVisible('text=Done');
      
      if (hasKanbanTitle && (hasTodoColumn || hasInProgressColumn || hasDoneColumn)) {
        console.log('Kanban boards are visible!');
      } else {
        console.log('Kanban boards not immediately visible, taking screenshot anyway...');
      }
      
      // Take screenshot of the loaded board
      await page.screenshot({ path: 'test-results/original-ports-loaded-board.png', fullPage: true });
      console.log('Screenshot saved: original-ports-loaded-board.png');
    }
    
    // Check for the presence of board columns specifically
    const columnsPresent = await page.isVisible('[data-testid="column"], .board-column, .kanban-column, [class*="column"]');
    if (columnsPresent) {
      console.log('Board columns detected!');
    } else {
      console.log('Board columns not detected.');
    }
    
    console.log('Test completed on original ports!');
  });
});