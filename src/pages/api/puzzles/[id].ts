/**
 * GET /api/puzzles/[id]
 *
 * Proxy server-side para a API pública do Lichess. Mantém o client sem
 * conhecer a URL do Lichess e respeita o rate-limit (1 req/s) centralizando
 * a chamada. Já devolve o puzzle CONVERTIDO ({ id, fen, solution, rating,
 * themes }) — a conversão PGN→FEN roda no servidor (chess.js).
 *
 * Casos especiais:
 *   id === 'daily' → puzzle do dia
 *   id === 'next'  → próximo puzzle (aceita ?angle e ?difficulty)
 *   senão          → puzzle por ID
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchDailyPuzzle,
  fetchNextPuzzle,
  fetchPuzzleById,
} from '@/services/lichess';
import { converterPuzzleLichess } from '@/lib/puzzleLichess';
import { withRequestLog } from '@/lib/withRequestLog';

function primeiroParam(v: NextApiRequest['query'][string]): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === 'string' && s.length > 0 ? s : undefined;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const id = primeiroParam(req.query.id);
  if (!id) {
    return res.status(400).json({ error: 'id obrigatório.' });
  }

  const angle = primeiroParam(req.query.angle);
  const difficulty = primeiroParam(req.query.difficulty);

  try {
    const data =
      id === 'daily'
        ? await fetchDailyPuzzle()
        : id === 'next'
          ? await fetchNextPuzzle(angle, difficulty)
          : await fetchPuzzleById(id);

    return res.status(200).json(converterPuzzleLichess(data));
  } catch (err) {
    console.error('Erro em /api/puzzles/[id]:', err);
    return res
      .status(502)
      .json({ error: 'Falha ao consultar o Lichess.' });
  }
}

export default withRequestLog(handler);
