import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    bypassCSP: true, // RSC inline scripts su blokirani; riješiti nonce-om u produkciji
    serviceWorkers: 'block', // blokira SW u testovima (SW vraća 500 za stare chunk hash-eve)
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 5'] }, // mobile viewport — app je mobile-first
    },
  ],
})
