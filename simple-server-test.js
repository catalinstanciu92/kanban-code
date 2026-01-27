// Simple test to verify the functionality without complex server setup
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Since the app requires both frontend and backend, we need to handle initialization differently
  // Let's try to manually create the required directory structure first
  console.log('Starting test...');
  
  // Navigate to the app (assuming a server is running separately)
  await page.goto('http://127.0.0.1:24125/');
  
  // Wait for the initialization overlay to appear
  await page.waitForSelector('text=Setup Kanban', { timeout: 10000 });
  console.log('Found initialization overlay');
  
  // Take a screenshot of the initial state with the prompt
  await page.screenshot({ path: 'test-results/initialization-prompt.png', fullPage: true });
  console.log('Screenshot saved: initialization-prompt.png');
  
  // Verify the security check message is visible
  await page.waitForSelector('text=Security Check:');
  
  // Click the "Yes, create it" button
  await page.click('button:has-text("Yes, create it")');
  console.log('Clicked Yes button');
  
  // Take a screenshot after clicking yes
  await page.screenshot({ path: 'test-results/after-clicking-yes.png', fullPage: true });
  console.log('Screenshot saved: after-clicking-yes.png');
  
  // Wait for the initialization to complete and the overlay to disappear
  await page.waitForSelector('text=Setup Kanban', { state: 'detached', timeout: 10000 });
  
  // Verify we see the main app interface
  await page.waitForSelector('text=Kanban');
  await page.waitForSelector('text=Todo');
  await page.waitForSelector('text=In Progress');
  await page.waitForSelector('text=Done');
  
  // Take a final screenshot showing the main app loaded
  await page.screenshot({ path: 'test-results/main-app-loaded.png', fullPage: true });
  console.log('Screenshot saved: main-app-loaded.png');
  
  console.log('Test completed successfully!');
  await browser.close();
})();