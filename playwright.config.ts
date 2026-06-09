import { defineConfig, devices } from '@playwright/test';
import {
  getTestSessionSecret,
  loadTestEnvironment,
  requireTestDatabaseUrl,
} from './tests/helpers/testEnvironment';

loadTestEnvironment();
const TEST_DB_URL = requireTestDatabaseUrl();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_URL: TEST_DB_URL,
      SESSION_SECRET: getTestSessionSecret(),
    },
  },
});
