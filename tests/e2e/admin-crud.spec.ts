import { test, expect } from '@playwright/test';
import { resetDb, closePool } from './helpers/dbReset';
import { registrarUsuario, userFactory } from './helpers/auth';

async function registrarComoAdmin(
  page: import('@playwright/test').Page,
  prefix: string
) {
  const u = userFactory(prefix);

  await registrarUsuario(page, u);

  const promoteResp = await page.request.post(
    '/api/_internal/test/promote-admin',
    {
      data: { email: u.email },
    }
  );

  if (!promoteResp.ok()) {
    throw new Error(
      `Falha ao promover. status=${promoteResp.status()} body=${await promoteResp.text()}`
    );
  }

  const meResponse = await page.evaluate(async () => {
    const response = await fetch('/api/users/me', {
      credentials: 'include',
    });

    return {
      status: response.status,
      body: await response.json(),
    };
  });

  if (meResponse.status !== 200 || !meResponse.body.isAdmin) {
    throw new Error(
      `Promoção a admin falhou. status=${meResponse.status} body=${JSON.stringify(meResponse.body)}`
    );
  }

  return u;
}

test.describe('🎭 E2E — CRUDs admin', () => {
  test.beforeEach(async () => {
    await resetDb();
  });

  test.afterAll(async () => {
    await closePool();
  });

  test('Admin cria puzzle no catálogo (UC-20, UC-21)', async ({ page }) => {
    await registrarComoAdmin(page, 'adminP');

    await page.goto('/routes/administracao/puzzles');

    await expect(page.locator('#fen')).toBeVisible({
      timeout: 15_000,
    });

    const lichessId = `e2e-${Date.now()}`;

    await page.locator('#nome').fill(`Puzzle E2E ${lichessId}`);

    await page.locator('#fen').fill(
      'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25'
    );

    await page.locator('#solucao').fill('e6e7 b2b1');
    await page.locator('#fase').fill('1');
    await page.locator('#rating').fill('1500');
    await page.locator('#lichessId').fill(lichessId);

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/puzzles') &&
          response.request().method() === 'POST',
        {
          timeout: 10_000,
        }
      ),
      page.getByRole('button', { name: /criar puzzle/i }).click(),
    ]);

    await expect(page.locator('body')).toContainText(/sucesso|criado/i, {
      timeout: 5_000,
    });

    await expect(page.locator('body')).toContainText(lichessId, {
      timeout: 5_000,
    });
  });

  test('Admin cria bot (UC-24, UC-25)', async ({ page }) => {
    await registrarComoAdmin(page, 'adminB');

    await page.goto('/routes/administracao/bots');

    await expect(page.locator('#cNome')).toBeVisible({
      timeout: 15_000,
    });

    const nomeBot = `BotE2E-${Date.now()}`;

    await page.locator('#cNome').fill(nomeBot);
    await page.locator('#cNivel').selectOption('medio');
    await page.locator('#cDescricao').fill('Bot criado via E2E');

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/bots') &&
          response.request().method() === 'POST',
        {
          timeout: 10_000,
        }
      ),
      page.getByRole('button', { name: /criar bot/i }).click(),
    ]);

    await expect(page.locator('body')).toContainText(nomeBot, {
      timeout: 5_000,
    });
  });

  test('Admin cria, edita, pesquisa e exclui bot (UC-24..27)', async ({
    page,
  }) => {
    await registrarComoAdmin(page, 'adminBotCrud');

    await page.goto('/routes/administracao/bots');

    await expect(page.locator('#cNome')).toBeVisible({
      timeout: 15_000,
    });

    const nomeBot = `BotCRUD-${Date.now()}`;
    const nomeEditado = `${nomeBot}-Editado`;

    await page.locator('#cNome').fill(nomeBot);
    await page.locator('#cNivel').selectOption('dificil');
    await page.locator('#cDescricao').fill(
      'Bot para validar CRUD completo'
    );
    await page.locator('#cAgressividade').fill('82');

    await page.getByRole('button', { name: /criar bot/i }).click();

    await expect(page.locator('body')).toContainText(nomeBot, {
      timeout: 5_000,
    });

    await page.locator('#buscaBot').fill(nomeBot);

    const linhaBot = page.locator('tr').filter({
      hasText: nomeBot,
    });

    await expect(linhaBot).toBeVisible({
      timeout: 5_000,
    });

    await linhaBot
      .getByRole('button', { name: /editar/i })
      .click();

    const formularioEdicaoBot = page
      .locator('form')
      .filter({
        has: page.getByRole('button', {
          name: /salvar alterações/i,
        }),
      })
      .first();

    await expect(formularioEdicaoBot).toBeVisible({
      timeout: 5_000,
    });

    const campoNomeBot = formularioEdicaoBot
      .locator(
        'input:not([type="range"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"])'
      )
      .first();

    await expect(campoNomeBot).toBeVisible({
      timeout: 5_000,
    });

    await campoNomeBot.fill(nomeEditado);

    const campoAgressividade = formularioEdicaoBot
      .locator('input[type="range"]')
      .first();

    await expect(campoAgressividade).toBeVisible({
      timeout: 5_000,
    });

    await campoAgressividade.fill('65');

    await formularioEdicaoBot
      .getByRole('button', {
        name: /salvar alterações/i,
      })
      .click();

    await page.locator('#buscaBot').fill(nomeEditado);

    const linhaBotEditado = page.locator('tr').filter({
      hasText: nomeEditado,
    });

    await expect(linhaBotEditado).toBeVisible({
      timeout: 5_000,
    });

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await linhaBotEditado
      .getByRole('button', { name: /excluir/i })
      .click();

    await expect(
      page.locator('tr').filter({
        hasText: nomeEditado,
      })
    ).toHaveCount(0, {
      timeout: 5_000,
    });
  });

  test('Admin cria, edita, pesquisa e exclui tema (UC-28..31)', async ({
    page,
  }) => {
    await registrarComoAdmin(page, 'adminTemaCrud');

    await page.goto('/routes/administracao/temas');

    await expect(page.locator('#temaNome')).toBeVisible({
      timeout: 15_000,
    });

    const nomeTema = `TemaCRUD-${Date.now()}`;
    const nomeEditado = `${nomeTema}-Editado`;

    await page.locator('#temaNome').fill(nomeTema);

    await page.locator('#temaDescricao').fill(
      'Tema cadastrado pelo teste E2E'
    );

    await page.getByRole('button', { name: /criar tema/i }).click();

    await expect(page.locator('body')).toContainText(nomeTema, {
      timeout: 5_000,
    });

    await page.locator('#temaBusca').fill(nomeTema);

    const linhaTema = page.locator('tr').filter({
      hasText: nomeTema,
    });

    await expect(linhaTema).toBeVisible({
      timeout: 5_000,
    });

    await linhaTema
      .getByRole('button', { name: /editar/i })
      .click();

    const formularioEdicaoTema = page
      .locator('form')
      .filter({
        has: page.getByRole('button', {
          name: /salvar alterações/i,
        }),
      })
      .first();

    await expect(formularioEdicaoTema).toBeVisible({
      timeout: 5_000,
    });

    const campoNomeTema = formularioEdicaoTema
      .locator(
        'input:not([type="range"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"])'
      )
      .first();

    await expect(campoNomeTema).toBeVisible({
      timeout: 5_000,
    });

    await campoNomeTema.fill(nomeEditado);

    await formularioEdicaoTema
      .getByRole('button', {
        name: /salvar alterações/i,
      })
      .click();

    await page.locator('#temaBusca').fill(nomeEditado);

    const linhaTemaEditado = page.locator('tr').filter({
      hasText: nomeEditado,
    });

    await expect(linhaTemaEditado).toBeVisible({
      timeout: 5_000,
    });

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await linhaTemaEditado
      .getByRole('button', { name: /excluir/i })
      .click();

    await expect(
      page.locator('tr').filter({
        hasText: nomeEditado,
      })
    ).toHaveCount(0, {
      timeout: 5_000,
    });
  });
});