const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true }); // headless mode for server environment
  const page = await browser.newPage();

  // Set viewport to iPhone 12
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:24125/');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({ path: 'mobile-final.png', fullPage: true });
  console.log('Final screenshot saved: mobile-final.png');

  // Wait a bit to see the page
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
})();