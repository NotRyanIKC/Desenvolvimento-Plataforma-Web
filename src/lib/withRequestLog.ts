/**
 * src/lib/withRequestLog.ts
 *
 * Higher-order handler que envolve uma rota de API (Pages Router) para
 * registrar a requisição no arquivo de log assim que o handler termina.
 *
 * Uso (envolvendo o export default de cada rota em src/pages/api/**):
 *   export default withRequestLog(async function handler(req, res) { ... });
 *
 * Captura método, rota, status HTTP, duração, IP, user-agent e o usuário
 * autenticado (via sessão). NÃO lê o corpo da requisição — veja a nota de
 * privacidade em requestLogger.ts.
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { logRequest } from './requestLogger';
import { getSessionUserId } from './session';

function clientIp(req: NextApiRequest): string | null {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  return req.socket?.remoteAddress ?? null;
}

function headerValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function withRequestLog(handler: NextApiHandler): NextApiHandler {
  return async function loggedHandler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const started = Date.now();

    // Lê o usuário da sessão sem deixar uma eventual falha quebrar a rota.
    let usuarioId: string | null = null;
    try {
      usuarioId = getSessionUserId(req);
    } catch {
      usuarioId = null;
    }

    const registrar = () => {
      void logRequest({
        type: 'api',
        method: req.method ?? 'UNKNOWN',
        path: req.url ?? 'unknown',
        status: res.statusCode,
        durationMs: Date.now() - started,
        usuarioId,
        ip: clientIp(req),
        userAgent: headerValue(req.headers['user-agent']),
      });
    };

    try {
      await handler(req, res);
      registrar();
    } catch (err) {
      // Garante o registro mesmo quando o handler estoura antes de responder.
      registrar();
      throw err;
    }
  };
}
