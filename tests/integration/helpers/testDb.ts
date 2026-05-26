/**
 * tests/integration/helpers/testDb.ts
 *
 * Helpers para os testes de integração contra o banco CesuChess_test.
 *
 * NOTA: o `testPool` é um SINGLETON compartilhado entre suites.
 * `closeTestPool()` é uma no-op intencional — fechar o pool no afterAll
 * de uma suite quebraria as próximas. O Node cuida do cleanup ao sair.
 *
 * Pré-requisito: criar o banco de teste e aplicar o schema:
 *
 *   createdb -U postgres CesuChess_test
 *   psql -U postgres -d CesuChess_test -f DB/schema.sql
 */
import { Pool } from 'pg';

const TEST_URL = process.env.TEST_DATABASE_URL;

if (!TEST_URL) {
  console.warn('[testDb] TEST_DATABASE_URL ausente — testes de integração serão pulados.');
}

// Singleton: vive enquanto o processo do Vitest estiver rodando.
const g = globalThis as unknown as { __testPool?: Pool };
if (!g.__testPool && TEST_URL) {
  g.__testPool = new Pool({ connectionString: TEST_URL });
}

export const testPool = g.__testPool ?? null;
export const hasTestDb = Boolean(TEST_URL);

export async function resetDatabase(): Promise<void> {
  if (!testPool) throw new Error('Banco de teste não configurado.');
  await testPool.query(`
    TRUNCATE TABLE
      comentario,
      puzzles_resolvidos,
      tentativa_puzzle,
      progresso_puzzle,
      lance,
      partida,
      puzzle,
      bot,
      admin,
      jogador,
      usuario
    RESTART IDENTITY CASCADE
  `);
}

/**
 * No-op intencional. O pool é compartilhado entre suites; fechá-lo aqui
 * quebraria as próximas. Vitest encerra o processo ao final e o Node
 * cuida do cleanup das conexões.
 */
export async function closeTestPool(): Promise<void> {
  return;
}

/**
 * Promove um usuário a administrador. Recebe um sufixo único pra garantir
 * que cada teste use um admin diferente (evita colisão com username 'admin_test'
 * se múltiplos testes do mesmo arquivo chamarem essa função).
 */
export async function promoteToAdmin(usuarioId: string): Promise<string> {
  if (!testPool) throw new Error('Banco de teste não configurado.');
  const { rows } = await testPool.query<{ id: string }>(
    `INSERT INTO admin (usuario_id) VALUES ($1)
     ON CONFLICT (usuario_id) DO UPDATE SET usuario_id = EXCLUDED.usuario_id
     RETURNING id`,
    [usuarioId]
  );
  return rows[0].id;
}
