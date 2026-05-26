/**
 * tests/e2e/helpers/dbReset.ts
 *
 * Trunca o banco de teste do Playwright antes/depois das specs.
 * Reusa o mesmo banco CesuChess_test que a integração usa.
 */
import { Pool } from 'pg';

const TEST_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://postgres:201005@localhost:5432/CesuChess_test';

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: TEST_URL });
  return pool;
}

export async function resetDb(): Promise<void> {
  await getPool().query(`
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

export async function promoteUserToAdmin(email: string): Promise<void> {
  await getPool().query(
    `INSERT INTO admin (usuario_id)
     SELECT id FROM usuario WHERE email = $1
     ON CONFLICT (usuario_id) DO NOTHING`,
    [email]
  );
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
