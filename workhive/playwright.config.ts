import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173', // Using Vite's default port since frontend runs there
    headless: true,
  },
});
