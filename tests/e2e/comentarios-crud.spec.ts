/**
 * E2E: CRUD de Comentários em puzzle (UC-16..19).
 */
import { test, expect } from '@playwright/test';
import { resetDb, closePool } from './helpers/dbReset';
import { registrarELogar } from './helpers/auth';

test.describe('🎭 E2E — CRUD Comentários em Puzzle', () => {
  test.beforeAll(async () => { await resetDb(); });
  test.afterAll(async () => { await closePool(); });

  test('Usuário publica, vê, edita e exclui um comentário', async ({ page }) => {
    await registrarELogar(page, 'com');

    // Vai pra um puzzle qualquer (fase 1 existe em src/data/puzzles.ts)
    await page.goto('/routes/puzzles/1');

    // Aguarda a seção de comentários renderizar
    const textarea = page.getByPlaceholder(/compartilhe sua análise/i);
    await expect(textarea).toBeVisible({ timeout: 10_000 });

    const textoOriginal = `Comentário E2E ${Date.now()}`;
    const textoEditado = `Comentário E2E EDITADO ${Date.now()}`;

    // UC-16: publicar
    await textarea.fill(textoOriginal);
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/comentarios') &&
          r.request().method() === 'POST',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /^publicar$/i }).click(),
    ]);

    // UC-17: visualizar
    await expect(page.locator('body')).toContainText(textoOriginal, { timeout: 5_000 });

    // UC-18: editar — clica no "Editar" do comentário
    await page.getByRole('button', { name: /^editar$/i }).first().click();

    // O textarea de edição é o último textarea da página
    const allTextareas = page.locator('textarea');
    const editArea = allTextareas.last();
    await editArea.fill(textoEditado);

    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/comentarios/') &&
          r.request().method() === 'PATCH',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /^salvar$/i }).click(),
    ]);
    await expect(page.locator('body')).toContainText(textoEditado, { timeout: 5_000 });
    await expect(page.locator('body')).toContainText(/editado/i);

    // UC-19: excluir
    page.on('dialog', (d) => d.accept());
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/comentarios/') &&
          r.request().method() === 'DELETE',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /^excluir$/i }).first().click(),
    ]);
    await expect(page.locator('body')).not.toContainText(textoEditado, { timeout: 5_000 });
  });
});
