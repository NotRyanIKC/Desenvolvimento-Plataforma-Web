/**
 * GET /api/puzzles/mestres
 *
 * Lista pública dos puzzles ativos do catálogo (os "puzzles dos mestres",
 * cadastrados por administradores). Alimenta a página de resolução
 * /routes/puzzles/mestres.
 *
 * É público (sem requireAdmin) e devolve a `solucao` ao cliente — mesmo padrão
 * de /api/puzzles/[id] (proxy Lichess) e dos dados estáticos de [phase].tsx,
 * onde a validação dos lances acontece no cliente.
 *
 * Rota estática: tem precedência sobre o proxy dinâmico [id].ts, então
 * `/api/puzzles/mestres` cai aqui e não tenta buscar "mestres" no Lichess.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { listPuzzlesAtivos, toPuzzleDTO } from '@/lib/puzzles';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const rows = await listPuzzlesAtivos();
    return res.status(200).json({ puzzles: rows.map(toPuzzleDTO) });
  } catch (err) {
    console.error('Erro em GET /api/puzzles/mestres:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
