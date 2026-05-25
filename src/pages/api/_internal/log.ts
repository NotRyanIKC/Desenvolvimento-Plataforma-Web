/**
 * POST /api/_internal/log  (uso interno)
 *
 * Recebe os metadados de uma navegação de página vindos do middleware (Edge,
 * que não acessa o filesystem) e grava no arquivo via requestLogger.
 *
 * Propositalmente NÃO é envolvida por withRequestLog — caso contrário cada
 * página geraria também uma entrada de API para esta própria rota.
 *
 * Como é exposta via HTTP, os campos são saneados (whitelist + limite de
 * tamanho) antes de irem para o log.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { logRequest } from '@/lib/requestLogger';

function str(value: unknown, max = 512): string | null {
  if (typeof value !== 'string') return null;
  return value.slice(0, max);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const body = req.body ?? {};

  await logRequest({
    type: 'page',
    method: str(body.method, 10) ?? 'UNKNOWN',
    path: str(body.path) ?? 'unknown',
    ip: str(body.ip, 64),
    userAgent: str(body.userAgent),
    referer: str(body.referer),
  });

  return res.status(204).end();
}
