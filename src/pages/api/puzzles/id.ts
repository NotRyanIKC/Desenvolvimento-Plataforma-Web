/**
 * Rota legada — substituída por /api/puzzles/[id].ts.
 * Mantida apenas para não quebrar o build do Next.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error: 'Rota descontinuada. Use /api/puzzles/<id>.',
  });
}
