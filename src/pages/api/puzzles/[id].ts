/**
 * GET /api/puzzles/[id]
 *
 * Proxy server-side para a API pública do Lichess.
 * Mantém o client sem precisar conhecer a URL do Lichess e respeita
 * o rate-limit (1 req/s) ao centralizar a chamada.
 *
 * Caso especial: id === 'daily' busca o puzzle do dia.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchDailyPuzzle, fetchPuzzleById } from '@/services/lichess';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const idRaw = req.query.id;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'id obrigatório.' });
  }

  try {
    const data =
      id === 'daily' ? await fetchDailyPuzzle() : await fetchPuzzleById(id);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Erro em /api/puzzles/[id]:', err);
    return res
      .status(502)
      .json({ error: 'Falha ao consultar o Lichess.' });
  }
}

export default withRequestLog(handler);
