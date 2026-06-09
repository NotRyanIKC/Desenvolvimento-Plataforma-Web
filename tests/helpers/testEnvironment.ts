import { config } from 'dotenv';
import path from 'node:path';

const TEST_ENV_FILES = ['.env.test.local', '.env.local'] as const;
let loaded = false;

export function loadTestEnvironment(): void {
  if (loaded) return;
  const root = path.resolve(process.cwd());
  for (const file of TEST_ENV_FILES) {
    config({ path: path.join(root, file), override: false });
  }
  loaded = true;
}

export function getOptionalTestDatabaseUrl(): string | undefined {
  loadTestEnvironment();
  const value = process.env.TEST_DATABASE_URL?.trim();
  return value || undefined;
}

export function requireTestDatabaseUrl(): string {
  const value = getOptionalTestDatabaseUrl();
  if (!value) {
    throw new Error(
      [
        'TEST_DATABASE_URL não definida.',
        'Crie .env.test.local a partir de .env.test.local.example e informe um banco exclusivo de testes.',
        'Exemplo: TEST_DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/cesuchess_test',
      ].join('\n')
    );
  }
  assertSafeTestDatabaseUrl(value);
  return value;
}

export function assertSafeTestDatabaseUrl(connectionString: string): void {
  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error('TEST_DATABASE_URL inválida. Use uma URL PostgreSQL completa.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('TEST_DATABASE_URL deve usar o protocolo postgres:// ou postgresql://.');
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\//, '')).toLowerCase();
  if (!database || !database.includes('test')) {
    throw new Error(
      `Banco recusado para testes: "${database || '(vazio)'}". ` +
      'Use um banco separado cujo nome contenha "test", por exemplo: cesuchess_test.'
    );
  }
}

export function getTestSessionSecret(): string {
  loadTestEnvironment();
  return (
    process.env.TEST_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    'cesuchess-test-session-secret-local-only-32-chars'
  );
}

export function maskDatabaseUrl(connectionString: string): string {
  try {
    const parsed = new URL(connectionString);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '(URL inválida)';
  }
}
