import { config } from 'dotenv';
import { Pool } from 'pg';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['.env.test.local', '.env.local']) {
  config({ path: path.join(root, file), override: false });
}

const url = process.env.TEST_DATABASE_URL?.trim();
if (!url) {
  fail([
    'TEST_DATABASE_URL não definida.',
    'Crie .env.test.local a partir de .env.test.local.example.',
    'Depois informe a senha local do PostgreSQL e o banco cesuchess_test.',
  ]);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  fail(['TEST_DATABASE_URL inválida. Use uma URL PostgreSQL completa.']);
}

const database = decodeURIComponent(parsed.pathname.replace(/^\//, '')).toLowerCase();
if (!database.includes('test')) {
  fail([
    `Banco recusado: "${database || '(vazio)'}".`,
    'Os testes destrutivos só podem rodar em um banco separado cujo nome contenha "test".',
  ]);
}

const requiredTables = [
  'usuario', 'admin', 'jogador', 'bot', 'tema', 'partida', 'lance',
  'puzzle', 'tentativa_puzzle', 'progresso_puzzle', 'puzzles_resolvidos', 'comentario',
];

const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
try {
  const dbResult = await pool.query('SELECT current_database() AS database, current_user AS usuario');
  const tablesResult = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
    [requiredTables]
  );
  const found = new Set(tablesResult.rows.map(({ tablename }) => tablename));
  const missing = requiredTables.filter((table) => !found.has(table));
  if (missing.length) {
    fail([
      `Banco conectado, mas o schema está incompleto. Tabelas ausentes: ${missing.join(', ')}.`,
      'Atualize o banco de testes executando:',
      'psql -U postgres -d cesuchess_test -f DB/schema.sql',
    ]);
  }

  const safeUrl = new URL(url);
  if (safeUrl.password) safeUrl.password = '***';
  console.log('[test-db] conexão validada com sucesso.');
  console.log(`[test-db] banco: ${dbResult.rows[0].database}`);
  console.log(`[test-db] usuário: ${dbResult.rows[0].usuario}`);
  console.log(`[test-db] URL: ${safeUrl.toString()}`);
  console.log(`[test-db] tabelas verificadas: ${requiredTables.length}`);
} catch (error) {
  fail([
    'Não foi possível acessar o banco de testes.',
    error instanceof Error ? error.message : String(error),
    'Confira a senha, a porta, o nome do banco e se o PostgreSQL está iniciado.',
  ]);
} finally {
  await pool.end().catch(() => undefined);
}

function fail(lines) {
  for (const line of lines) console.error(`[test-db] ${line}`);
  process.exit(1);
}
