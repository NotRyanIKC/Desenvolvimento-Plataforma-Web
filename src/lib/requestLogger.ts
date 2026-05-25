/**
 * src/lib/requestLogger.ts
 *
 * Sistema de log de requisições — grava em arquivo (JSON-lines).
 *
 * Cada requisição vira UMA linha JSON em `logs/requests.log` (na raiz do
 * projeto). O destino é arquivo por decisão de projeto; a granularidade é
 * "todas as requisições" — páginas (via src/proxy.ts → /api/_internal/log) e
 * rotas de API (via withRequestLog).
 *
 * IMPORTANTE — privacidade:
 *   Registramos apenas METADADOS (método, rota, status, duração, usuário, IP,
 *   user-agent). O corpo da requisição/resposta NUNCA é gravado, então senhas
 *   de /api/auth/login e /api/auth/register jamais chegam ao arquivo.
 *
 * A escrita é "fire-and-forget": uma falha ao logar não pode derrubar a
 * requisição que estava sendo servida.
 *
 * Limitação conhecida: não há rotação do arquivo de log (fora de escopo).
 */

import { appendFile, mkdir } from 'fs/promises';
import path from 'path';

export interface LogEntry {
  /** ISO-8601 do instante em que a entrada foi registrada. */
  ts: string;
  /** Origem da requisição: navegação de página ou rota de API. */
  type: 'page' | 'api';
  method: string;
  path: string;
  /** Status HTTP da resposta (apenas para `type: 'api'`). */
  status?: number;
  /** Duração do handler em milissegundos (apenas para `type: 'api'`). */
  durationMs?: number;
  /** UUID do usuário autenticado, quando houver sessão válida. */
  usuarioId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
}

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'requests.log');

let dirReady = false;

async function ensureDir(): Promise<void> {
  if (dirReady) return;
  await mkdir(LOG_DIR, { recursive: true });
  dirReady = true;
}

/**
 * Acrescenta uma entrada ao arquivo de log. Nunca lança: erros de I/O são
 * apenas reportados no console para não afetar a requisição em andamento.
 */
export async function logRequest(
  entry: Omit<LogEntry, 'ts'> & { ts?: string }
): Promise<void> {
  try {
    await ensureDir();
    const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
    await appendFile(LOG_FILE, line, 'utf8');
  } catch (err) {
    console.error('Falha ao gravar log de requisição:', err);
  }
}
