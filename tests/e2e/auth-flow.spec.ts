/**
 * E2E: fluxo completo de autenticação (UC-01, UC-02, UC-03).
 */
import { test, expect } from '@playwright/test';
import { resetDb, closePool } from './helpers/dbReset';
import { registrarUsuario, login, userFactory } from './helpers/auth';

test.describe('🎭 E2E — Autenticação (UC-01..03)', () => {
  test.beforeEach(async () => { await resetDb(); });
  test.afterAll(async () => { await closePool(); });

  test('Visitante consegue criar conta, fazer logout, logar de volta', async ({ page }) => {
    const u = userFactory('auth');
    await registrarUsuario(page, u);

    await page.goto('/routes/profile');
    await expect(page.locator('body')).toContainText(u.username, { timeout: 10_000 });

    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/auth/logout'),
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /sair|logout/i }).first().click(),
    ]);

    await page.goto('/routes/profile');
    await page.waitForURL(/\/routes\/login/, { timeout: 10_000 });

    await login(page, u.email, u.senha);
    await page.goto('/routes/profile');
    await expect(page.locator('body')).toContainText(u.username, { timeout: 10_000 });
  });

  test('Login com senha errada falha com mensagem clara', async ({ page }) => {
    await page.goto('/routes/login');
    await page.locator('#identifier').fill('inexistente@cesuchess.test');
    await page.locator('#password').fill('senhaErrada123');
    await page.getByRole('button', { name: /^entrar$/i }).click();

    // Filtra apenas o <p role="alert"> com texto não-vazio (ignora o route-announcer do Next)
    await expect(
      page.getByText(/credenciais inválid|inválid/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
