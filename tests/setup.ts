/**
 * tests/setup.ts
 *
 * Roda ANTES de qualquer teste — carrega o .env.local e redireciona
 * DATABASE_URL → TEST_DATABASE_URL para que o pool singleton de
 * src/lib/db.ts já nasça apontando pro banco de TESTE.
 */
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env.local') });

// Default seguro para CI / quando .env.local não tem TEST_DATABASE_URL
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET =
    'chave-de-teste-vitest-com-tamanho-suficiente-32-chars';
}

// Aponta o pool de produção pro banco de teste durante a suíte.
// Tem que acontecer ANTES de qualquer import de src/lib/db.ts.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
