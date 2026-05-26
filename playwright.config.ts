import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E.
 *
 * IMPORTANTE: usamos cross-env no `command` pra setar DATABASE_URL ANTES
 * do Next inicializar. Sem isso, o Next carrega .env.local (que aponta
 * pro banco DEV) e o `env` daqui é ignorado.
 *
 * Pré-requisito (uma vez):
 *   createdb -U postgres BancoVersao2034_test
 *   psql -U postgres -d BancoVersao2034_test -f DB/schema.sql
 *   npx playwright install
 */
const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://postgres:201005@localhost:5432/BancoVersao2034_test';

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
    command: `npx cross-env DATABASE_URL=${TEST_DB_URL} npm run dev -- -p 3001`,
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
