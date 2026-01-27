import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    // Remove the specific base URL to allow direct navigation
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Comment out web server for now to avoid port conflicts
  // webServer: {
  //   command: 'bun run dev:all',
  //   url: 'http://127.0.0.1:24125',
  //   reuseExistingServer: true,
  // },
});