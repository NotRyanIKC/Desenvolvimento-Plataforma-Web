/**
 * Helper de autenticação pros testes E2E.
 *
 * Faz cadastro completo aguardando a resposta 201 do servidor — isso
 * garante que o cookie httpOnly já está no browser antes do próximo
 * navigate. Sem esse await, o teste pode chamar /routes/profile antes
 * do Set-Cookie chegar, e o useAdmin/useUser interpretam como sessão
 * expirada.
 */
import { Page, expect } from '@playwright/test';

export interface NovoUsuario {
  nome: string;
  sobrenome: string;
  username: string;
  email: string;
  senha: string;
}

export function userFactory(prefix: string): NovoUsuario {
  const stamp = Date.now() + Math.floor(Math.random() * 1000);
  return {
    nome: 'Teste',
    sobrenome: 'E2E',
    username: `${prefix}_${stamp}`,
    email: `${prefix}-${stamp}@cesuchess.test`,
    senha: 'SenhaSegura123',
  };
}

/**
 * Registra um novo usuário pela tela /routes/register. Aguarda o 201 do
 * servidor antes de retornar, garantindo que o cookie já está set.
 */
export async function registrarUsuario(page: Page, u: NovoUsuario): Promise<void> {
  await page.goto('/routes/register');

  // Usa IDs reais (firstName, lastName, username, email, password, confirm, terms)
  await page.locator('#firstName').fill(u.nome);
  await page.locator('#lastName').fill(u.sobrenome);
  await page.locator('#username').fill(u.username);
  await page.locator('#email').fill(u.email);
  await page.locator('#password').fill(u.senha);
  await page.locator('#confirm').fill(u.senha);
  await page.locator('#terms').check();

  // Aguarda o servidor confirmar antes do router.push('/routes/profile')
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes('/api/auth/register') &&
        r.request().method() === 'POST' &&
        (r.status() === 201 || r.status() === 200),
      { timeout: 10_000 }
    ),
    page.getByRole('button', { name: /criar conta/i }).click(),
  ]);

  // Espera o router.push concluir
  await page.waitForURL((url) => !url.pathname.includes('/register'), {
    timeout: 10_000,
  });
}

/**
 * Faz login pela tela /routes/login, aguardando 200 do servidor.
 */
export async function login(page: Page, identifier: string, senha: string): Promise<void> {
  await page.goto('/routes/login');
  await page.locator('#identifier').fill(identifier);
  await page.locator('#password').fill(senha);

  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes('/api/auth/login') &&
        r.request().method() === 'POST',
      { timeout: 10_000 }
    ),
    page.getByRole('button', { name: /^entrar$/i }).click(),
  ]);
}

/**
 * Conveniência: registra E garante que está na /routes/profile (logado).
 */
export async function registrarELogar(page: Page, prefix = 'e2e'): Promise<NovoUsuario> {
  const u = userFactory(prefix);
  await registrarUsuario(page, u);
  await page.goto('/routes/profile');
  // Espera o profile carregar de fato (mostra o username)
  await expect(page.locator('body')).toContainText(u.username, { timeout: 10_000 });
  return u;
}
