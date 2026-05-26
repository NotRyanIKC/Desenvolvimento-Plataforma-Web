/**
 * E2E: CRUDs admin — Puzzles (UC-20..23) e Bots (UC-24..27).
 */
import { test, expect } from '@playwright/test';
import { resetDb, closePool } from './helpers/dbReset';
import { registrarUsuario, userFactory } from './helpers/auth';

/**
 * Vira admin via HTTP — chama a rota interna /api/_internal/test/promote-admin
 * que só existe em modo dev. Garante que estamos operando no MESMO banco que
 * o webServer está usando (sem precisar saber se é DEV ou _test).
 */
async function registrarComoAdmin(page: import('@playwright/test').Page, prefix: string) {
  const u = userFactory(prefix);
  await registrarUsuario(page, u);

  // Promove via HTTP no servidor (não toca o banco diretamente)
  const promoteResp = await page.request.post('/api/_internal/test/promote-admin', {
    data: { email: u.email },
  });
  if (!promoteResp.ok()) {
    throw new Error(
      `Falha ao promover. status=${promoteResp.status()} body=${await promoteResp.text()}`
    );
  }

  // Sanity: confirma que /api/users/me agora devolve isAdmin=true
  const meResponse = await page.evaluate(async () => {
    const r = await fetch('/api/users/me', { credentials: 'include' });
    return { status: r.status, body: await r.json() };
  });
  if (meResponse.status !== 200 || !meResponse.body.isAdmin) {
    throw new Error(
      `Promoção a admin falhou. status=${meResponse.status} body=${JSON.stringify(meResponse.body)}`
    );
  }
  return u;
}

test.describe('🎭 E2E — CRUDs admin', () => {
  test.beforeAll(async () => { await resetDb(); });
  test.afterAll(async () => { await closePool(); });

  test('Admin cria puzzle no catálogo (UC-20, UC-21)', async ({ page }) => {
    await registrarComoAdmin(page, 'adminP');
    await page.goto('/routes/administracao/puzzles');

    await expect(page.locator('#fen')).toBeVisible({ timeout: 15_000 });

    const lichessId = `e2e-${Date.now()}`;
    await page.locator('#fen').fill(
      'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25'
    );
    await page.locator('#solucao').fill('e6e7 b2b1');
    await page.locator('#fase').fill('1');
    await page.locator('#rating').fill('1500');
    await page.locator('#lichessId').fill(lichessId);

    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/admin/puzzles') &&
          r.request().method() === 'POST',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /criar puzzle/i }).click(),
    ]);

    await expect(page.locator('body')).toContainText(/sucesso|criado/i, { timeout: 5_000 });
    await expect(page.locator('body')).toContainText(lichessId, { timeout: 5_000 });
  });

  test('Admin cria bot (UC-24, UC-25)', async ({ page }) => {
    await registrarComoAdmin(page, 'adminB');
    await page.goto('/routes/administracao/bots');

    await expect(page.locator('#cNome')).toBeVisible({ timeout: 15_000 });

    const nomeBot = `BotE2E-${Date.now()}`;
    await page.locator('#cNome').fill(nomeBot);
    await page.locator('#cNivel').selectOption('medio');
    await page.locator('#cDescricao').fill('Bot criado via E2E');

    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/admin/bots') &&
          r.request().method() === 'POST',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /criar bot/i }).click(),
    ]);

    await expect(page.locator('body')).toContainText(nomeBot, { timeout: 5_000 });
  });
});
