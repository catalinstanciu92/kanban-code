import { test, expect } from '@playwright/test';

// Modified test to work with pre-initialized app
test.describe('Kanban App Screenshots', () => {
  test('should load the app and take screenshots', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:24125');
    
    // Wait for the main app to load
    await expect(page.locator('text=Kanban')).toBeVisible();
    
    // Take a screenshot of the main app
    await page.screenshot({ path: 'test-results/main-app-loaded.png', fullPage: true });
    console.log('Main app screenshot taken');
    
    // Find and click the first message prompt/button if it exists
    // Look for common selectors that might represent message prompts
    const messagePrompts = await page.$$('.btn, button, [role="button"]');
    if (messagePrompts.length > 0) {
      console.log(`Found ${messagePrompts.length} potential buttons`);
      
      // Try to click the first button that might be a "yes" or confirmation prompt
      for (let i = 0; i < Math.min(3, messagePrompts.length); i++) {
        const buttonText = await messagePrompts[i].textContent();
        console.log(`Button ${i} text: "${buttonText}"`);
        
        if (buttonText && (buttonText.toLowerCase().includes('yes') || 
                          buttonText.toLowerCase().includes('ok') || 
                          buttonText.toLowerCase().includes('confirm'))) {
          await messagePrompts[i].click();
          console.log(`Clicked button with text: "${buttonText}"`);
          
          // Take screenshot after clicking
          await page.screenshot({ path: `test-results/after-clicking-button-${i}.png`, fullPage: true });
          console.log(`Screenshot saved: after-clicking-button-${i}.png`);
          break;
        }
      }
    }
    
    console.log('Test completed!');
  });
});