/**
 * Carrega a configuração local de testes antes de qualquer import de src/lib/db.ts.
 * Quando TEST_DATABASE_URL existe, todo acesso do Vitest ao PostgreSQL é redirecionado
 * para o banco isolado de testes. Testes unitários mockados continuam funcionando sem DB.
 */
import {
  getOptionalTestDatabaseUrl,
  getTestSessionSecret,
  loadTestEnvironment,
} from './helpers/testEnvironment';

loadTestEnvironment();
process.env.SESSION_SECRET = getTestSessionSecret();

const testDatabaseUrl = getOptionalTestDatabaseUrl();
if (testDatabaseUrl) {
  process.env.DATABASE_URL = testDatabaseUrl;
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgres://postgres:postgres@127.0.0.1:5432/cesuchess_unit_test_placeholder';
}
