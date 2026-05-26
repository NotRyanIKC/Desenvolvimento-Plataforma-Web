/**
 * E2E: CRUD de Puzzles Resolvidos pela tela /routes/puzzles/history.
 */
import { test, expect } from '@playwright/test';
import { resetDb, closePool } from './helpers/dbReset';
import { registrarELogar } from './helpers/auth';

test.describe('🎭 E2E — CRUD Puzzles Resolvidos (Histórico)', () => {
  test.beforeAll(async () => { await resetDb(); });
  test.afterAll(async () => { await closePool(); });

  test('Criar, listar e excluir puzzle resolvido', async ({ page }) => {
    await registrarELogar(page, 'hist');
    await page.goto('/routes/puzzles/history');

    // Abre o modal de novo registro — o botão é "+ Registrar puzzle"
    await page.getByRole('button', { name: /registrar puzzle/i }).click();

    // Aguarda o modal aparecer (o campo #puzzleId só existe depois do modal abrir)
    await expect(page.locator('#puzzleId')).toBeVisible({ timeout: 10_000 });

    const puzzleId = `e2e-${Date.now()}`;
    await page.locator('#puzzleId').fill(puzzleId);
    await page.locator('#fase').fill('1');

    const rating = page.locator('#rating');
    if (await rating.count()) await rating.fill('1500');

    const tentativas = page.locator('#tentativas');
    if (await tentativas.count()) await tentativas.fill('1');

    const anotacao = page.locator('#anotacao');
    if (await anotacao.count()) await anotacao.fill('Teste E2E');

    // Submit do modal
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/puzzles/solved') && r.request().method() === 'POST',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /salvar|criar/i }).first().click(),
    ]);

    // Read: apareceu na lista
    await expect(page.locator('body')).toContainText(puzzleId, { timeout: 5_000 });

    // Delete
    page.on('dialog', (d) => d.accept());
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/puzzles/solved') &&
          r.request().method() === 'DELETE',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /excluir|remover/i }).first().click(),
    ]);
    await expect(page.locator('body')).not.toContainText(puzzleId, { timeout: 5_000 });
  });
});
