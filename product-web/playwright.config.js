import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    screenshot: 'off',
    viewport: {
      width: 1440,
      height: 1080
    }
  },
  reporter: [['list']]
});
