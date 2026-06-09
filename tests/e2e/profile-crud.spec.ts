/**
 * E2E: CRUD do Usuário pela tela /routes/profile
 * (UC-05 Visualizar, UC-06 Editar, UC-07 Excluir conta).
 */
import { test, expect } from '@playwright/test';
import { resetDb, closePool } from './helpers/dbReset';
import { registrarELogar } from './helpers/auth';

test.describe('🎭 E2E — CRUD Usuário (Perfil)', () => {
  test.beforeEach(async () => { await resetDb(); });
  test.afterAll(async () => { await closePool(); });

  test('Usuário consegue ler, editar nome e excluir a conta', async ({ page }) => {
    const u = await registrarELogar(page, 'prof');

    // UC-05: confirma que o username aparece no perfil (registrarELogar já fez,
    // mas reafirmamos aqui pra deixar explícito qual usuário está logado)
    await expect(page.locator('body')).toContainText(u.username);

    // UC-06: editar nome
    await page.locator('#nome').fill('NomeEditado');
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/users/me') && r.request().method() === 'PATCH',
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: /^salvar/i }).first().click(),
    ]);
    await expect(page.locator('body')).toContainText(/NomeEditado|atualizad/i, {
      timeout: 5_000,
    });

    // UC-07: excluir conta — o botão real é "Excluir minha conta"
    // O profile usa window.confirm() — listener PRECISA estar set antes do click
    page.on('dialog', (d) => d.accept());

    // botão real: "Excluir minha conta" / "Excluindo…"
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/users/me') && r.request().method() === 'DELETE',
        { timeout: 15_000 }
      ),
      page.getByRole('button', { name: /excluir/i }).last().click(),
    ]);

    // Após excluir, redireciona pra /
    await page.waitForURL(/\/(routes\/(login)?)?$/, { timeout: 10_000 });

    // sanity: tentar voltar pro profile deve mandar pro login
    await page.goto('/routes/profile');
    await page.waitForURL(/\/routes\/login/, { timeout: 10_000 });
  });
});
