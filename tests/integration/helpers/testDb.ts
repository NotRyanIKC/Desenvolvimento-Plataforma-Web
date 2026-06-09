/**
 * Helpers compartilhados pelos testes de integração.
 *
 * A suíte padrão pode rodar sem PostgreSQL e pula integração quando TEST_DATABASE_URL
 * não está configurada. Já `npm run test:integration` exige o banco e falha com uma
 * mensagem clara antes de executar os testes.
 */
import { Pool } from 'pg';
import {
  assertSafeTestDatabaseUrl,
  getOptionalTestDatabaseUrl,
  maskDatabaseUrl,
} from '../../helpers/testEnvironment';

const TEST_URL = getOptionalTestDatabaseUrl();
const requireDatabase = process.env.REQUIRE_TEST_DATABASE_URL === 'true';

if (!TEST_URL && requireDatabase) {
  throw new Error(
    'TEST_DATABASE_URL não definida. Crie .env.test.local usando .env.test.local.example.'
  );
}
if (!TEST_URL) {
  console.warn('[testDb] TEST_DATABASE_URL ausente: integração será pulada.');
} else {
  assertSafeTestDatabaseUrl(TEST_URL);
}

const requiredTables = [
  'comentario',
  'puzzles_resolvidos',
  'tentativa_puzzle',
  'progresso_puzzle',
  'lance',
  'partida',
  'puzzle',
  'tema',
  'bot',
  'admin',
  'jogador',
  'usuario',
] as const;

const g = globalThis as unknown as {
  __testPool?: Pool;
  __testDbChecked?: boolean;
};
if (!g.__testPool && TEST_URL) {
  g.__testPool = new Pool({ connectionString: TEST_URL, connectionTimeoutMillis: 5000 });
}

export const testPool = g.__testPool ?? null;
export const hasTestDb = Boolean(TEST_URL);

export async function assertTestDatabaseReady(): Promise<void> {
  if (!testPool || !TEST_URL) throw new Error('Banco de teste não configurado.');
  if (g.__testDbChecked) return;

  const { rows: dbRows } = await testPool.query<{ database: string }>(
    'SELECT current_database() AS database'
  );
  const database = dbRows[0]?.database ?? '';
  if (!database.toLowerCase().includes('test')) {
    throw new Error(`Banco inseguro recusado pela integração: ${database}.`);
  }

  const { rows } = await testPool.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables
     WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
    [requiredTables]
  );
  const found = new Set(rows.map(({ tablename }) => tablename));
  const missing = requiredTables.filter((table) => !found.has(table));
  if (missing.length) {
    throw new Error(
      `Schema de testes incompleto. Tabelas ausentes: ${missing.join(', ')}. ` +
      'Execute DB/schema.sql no banco de testes.'
    );
  }
  g.__testDbChecked = true;
  console.info(`[testDb] banco validado: ${maskDatabaseUrl(TEST_URL)}`);
}

export async function resetDatabase(): Promise<void> {
  if (!testPool) throw new Error('Banco de teste não configurado.');
  await assertTestDatabaseReady();
  await testPool.query(`
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

export async function closeTestPool(): Promise<void> {
  return;
}

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
