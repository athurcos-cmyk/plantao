import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './testes_claw',
  fullyParallel: false,       // sequencial: compartilhamos estado no Firebase
  retries: 1,                 // 1 retry para flakiness de rede
  timeout: 30000,             // 30s por teste
  globalSetup: './testes_claw/global-setup.js',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL:       'http://localhost:5173',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
    video:         'off',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile (Pixel 5)',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command:             'npm run dev',
    url:                 'http://localhost:5173',
    reuseExistingServer: true,
    timeout:             30000,
  },
})
