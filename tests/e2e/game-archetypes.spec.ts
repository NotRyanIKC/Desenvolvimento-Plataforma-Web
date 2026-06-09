import { expect, test } from '@playwright/test';
import { closePool, resetDb, seedActiveBot } from './helpers/dbReset';

test.describe('🎭 E2E — Arquétipos jogáveis de partida', () => {
  test.beforeEach(async () => { await resetDb(); });
  test.afterAll(async () => { await closePool(); });

  test('PvP local exibe tabuleiro, turno inicial e ações da partida (UC-08)', async ({ page }) => {
    await page.goto('/routes/play/pvp');
    await expect(page.getByRole('heading', { name: /partida 1v1 local/i })).toBeVisible();
    await expect(page.getByTestId('game-status')).toHaveText('Vez das brancas.');
    await expect(page.getByRole('button', { name: /nova partida/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /abandonar/i })).toBeVisible();
  });

  test('histórico local registra abandono realizado no navegador (UC-10)', async ({ page }) => {
    await page.goto('/routes/play/pvp');
    await page.getByRole('button', { name: /abandonar/i }).click();
    await expect(page.getByTestId('game-status')).toHaveText(/abandono/i);
    await page.goto('/routes/play/history');
    await expect(page.locator('body')).toContainText(/PvP local/i);
    await expect(page.locator('body')).toContainText(/Abandono/i);
  });

  test('rota de bot orienta quando ainda não existem bots ativos (UC-09)', async ({ page }) => {
    await page.goto('/routes/play/bot');
    await expect(page.getByRole('heading', { name: /partida contra bot/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/nenhum bot ativo/i);
  });

  test('bot ativo aparece como oponente e permite iniciar partida (UC-09)', async ({ page }) => {
    await seedActiveBot('Bot E2E Ativo');
    await page.goto('/routes/play/bot');
    await expect(page.locator('#botId')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#botId')).toContainText('Bot E2E Ativo');
    await page.getByRole('button', { name: /iniciar partida/i }).click();
    await expect(page.getByTestId('game-status')).toHaveText('Vez das brancas.');
    await expect(page.getByRole('button', { name: /abandonar/i })).toBeVisible();
  });
});
