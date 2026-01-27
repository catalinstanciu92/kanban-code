import { test, expect } from '@playwright/test';

test.describe('Kanban App Initialize Flow', () => {
  test('should handle initialization flow if needed and take screenshots', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check if initialization overlay is present
    const initOverlayVisible = await page.isVisible('text=Setup Kanban');
    
    if (initOverlayVisible) {
      console.log('Initialization overlay is visible - this is the first scenario');
      
      // Take a screenshot of the initial state with the prompt
      await page.screenshot({ path: 'test-results/initialization-prompt.png', fullPage: true });
      console.log('Screenshot saved: initialization-prompt.png');
      
      // Verify the security check message is visible
      await expect(page.locator('text=Security Check:')).toBeVisible();
      
      // Click the "Yes, create it" button
      await page.click('button:has-text("Yes, create it")');
      console.log('Clicked "Yes, create it" button');
      
      // Take a screenshot after clicking yes
      await page.screenshot({ path: 'test-results/after-clicking-yes.png', fullPage: true });
      console.log('Screenshot saved: after-clicking-yes.png');
      
      // Wait for the initialization to complete and the overlay to disappear
      await expect(page.locator('text=Setup Kanban')).not.toBeVisible({ timeout: 10000 });
      
      // Verify we see the main app interface
      await expect(page.locator('text=Kanban')).toBeVisible();
    } else {
      console.log('Initialization overlay is not visible - app is already initialized');
      // App is already initialized, proceed with taking screenshots
      
      // Wait for main elements to load
      await expect(page.locator('text=Kanban')).toBeVisible({ timeout: 10000 });
    }
    
    // Take a screenshot of the main app
    await page.screenshot({ path: 'test-results/main-app-loaded.png', fullPage: true });
    console.log('Screenshot saved: main-app-loaded.png');
    
    // Check for any message prompts that might appear after loading
    const messagePrompts = await page.$$('.btn, button, [role="button"]');
    console.log(`Found ${messagePrompts.length} potential buttons`);
    
    // Look for a "Yes" button among the first few buttons
    for (let i = 0; i < Math.min(5, messagePrompts.length); i++) {
      const element = messagePrompts[i];
      const buttonText = await element.textContent();
      console.log(`Button ${i} text: "${buttonText}"`);
      
      if (buttonText && buttonText.toLowerCase().includes('yes')) {
        await element.click();
        console.log(`Clicked button with "yes": "${buttonText}"`);
        
        // Take screenshot after clicking
        await page.screenshot({ path: `test-results/after-clicking-yes-button-${i}.png`, fullPage: true });
        console.log(`Screenshot saved: after-clicking-yes-button-${i}.png`);
        break;
      }
    }
    
    console.log('Test completed!');
  });
});