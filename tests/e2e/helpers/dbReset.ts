/**
 * Limpa e prepara o banco isolado usado pelo Playwright.
 * Não há senha padrão embutida: TEST_DATABASE_URL é obrigatória no E2E.
 */
import { Pool } from 'pg';
import { requireTestDatabaseUrl } from '../../helpers/testEnvironment';

const TEST_URL = requireTestDatabaseUrl();
const requiredTables = [
  'comentario', 'puzzles_resolvidos', 'tentativa_puzzle', 'progresso_puzzle',
  'lance', 'partida', 'puzzle', 'tema', 'bot', 'admin', 'jogador', 'usuario',
] as const;

let pool: Pool | null = null;
let checked = false;

function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: TEST_URL, connectionTimeoutMillis: 5000 });
  return pool;
}

export async function assertE2eDatabaseReady(): Promise<void> {
  if (checked) return;
  const current = await getPool().query<{ database: string }>(
    'SELECT current_database() AS database'
  );
  const database = current.rows[0]?.database ?? '';
  if (!database.toLowerCase().includes('test')) {
    throw new Error(`Banco inseguro recusado pelo E2E: ${database}.`);
  }

  const { rows } = await getPool().query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables
     WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
    [requiredTables]
  );
  const found = new Set(rows.map(({ tablename }) => tablename));
  const missing = requiredTables.filter((table) => !found.has(table));
  if (missing.length) {
    throw new Error(
      `Schema E2E incompleto. Tabelas ausentes: ${missing.join(', ')}. ` +
      'Execute DB/schema.sql no banco de testes.'
    );
  }
  checked = true;
}

export async function resetDb(): Promise<void> {
  await assertE2eDatabaseReady();
  await getPool().query(`
    TRUNCATE TABLE
      comentario,
      puzzles_resolvidos,
      tentativa_puzzle,
      progresso_puzzle,
      lance,
      partida,
      puzzle,
      tema,
      bot,
      admin,
      jogador,
      usuario
    RESTART IDENTITY CASCADE
  `);
}

export async function seedActiveBot(nome = 'Bot E2E Ativo'): Promise<void> {
  await assertE2eDatabaseReady();
  await getPool().query(
    `WITH novo_usuario AS (
       INSERT INTO usuario (nome, sobrenome, username, email, senha_hash)
       VALUES ('Admin', 'E2E', 'admin_bot_e2e', 'admin.bot.e2e@cesuchess.test', 'hash-e2e')
       RETURNING id
     ), novo_admin AS (
       INSERT INTO admin (usuario_id)
       SELECT id FROM novo_usuario
       RETURNING id
     )
     INSERT INTO bot (criado_por_id, nome, nivel_dificuldade, descricao, parametros_estrategia, ativo)
     SELECT id, $1, 'facil', 'Bot semeado pelo Playwright', '{"agressividade": 30}'::jsonb, TRUE
     FROM novo_admin`,
    [nome]
  );
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    checked = false;
  }
}
