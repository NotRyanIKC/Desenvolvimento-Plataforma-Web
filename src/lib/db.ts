/**
 * src/lib/db.ts
 *
 * Camada única de acesso ao PostgreSQL.
 * Toda query do servidor passa por este pool — nunca importe `pg` direto
 * em rotas/handlers.
 *
 * Como funciona:
 *  - Em desenvolvimento o Next.js recompila e reexecuta este módulo a cada
 *    hot reload, o que criaria múltiplos pools e vazaria conexões. Por isso
 *    persistimos a instância em `globalThis`.
 */

import { Pool, type QueryResult, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __cesuchessPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL não definida. Copie .env.local.example para .env.local.'
    );
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

export const pool: Pool = globalThis.__cesuchessPgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__cesuchessPgPool = pool;
}

/**
 * Wrapper tipado para queries. Use sempre via:
 *   const { rows } = await query<UserRow>('SELECT ...', [param]);
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as unknown[] | undefined);
}
