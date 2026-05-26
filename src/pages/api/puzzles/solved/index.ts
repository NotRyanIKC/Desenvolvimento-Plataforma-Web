/**
 * /api/puzzles/solved
 *
 * GET   → lista todos os puzzles resolvidos do usuário autenticado
 * POST  → registra um puzzle como resolvido (upsert)
 *
 * Body do POST:
 *   { puzzleId: string, fase: number, rating?, tentativas?, acertou?, anotacao? }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserId } from '@/lib/session';
import {
  listByUsuario,
  toDTO,
  upsertResolvido,
} from '@/lib/puzzlesResolvidos';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const usuarioId = getSessionUserId(req);
  if (!usuarioId) return res.status(401).json({ error: 'Não autenticado.' });

  try {
    if (req.method === 'GET') {
      const rows = await listByUsuario(usuarioId);
      return res.status(200).json({ puzzles: rows.map(toDTO) });
    }

    if (req.method === 'POST') {
      const { puzzleId, fase, rating, tentativas, acertou, anotacao } =
        req.body ?? {};

      if (typeof puzzleId !== 'string' || puzzleId.trim().length === 0) {
        return res.status(400).json({ error: 'puzzleId obrigatório.' });
      }
      if (typeof fase !== 'number' || !Number.isInteger(fase) || fase < 1) {
        return res.status(400).json({ error: 'fase inválida.' });
      }
      if (
        anotacao !== undefined &&
        anotacao !== null &&
        typeof anotacao !== 'string'
      ) {
        return res.status(400).json({ error: 'anotacao inválida.' });
      }
      if (
        rating !== undefined &&
        rating !== null &&
        (typeof rating !== 'number' || !Number.isFinite(rating))
      ) {
        return res.status(400).json({ error: 'rating inválido.' });
      }

      const row = await upsertResolvido({
        usuarioId,
        puzzleId: puzzleId.trim(),
        fase,
        rating: rating ?? null,
        tentativas: typeof tentativas === 'number' ? tentativas : 1,
        acertou: typeof acertou === 'boolean' ? acertou : true,
        anotacao: typeof anotacao === 'string' ? anotacao : null,
      });
      if (!row) {
        return res
          .status(404)
          .json({ error: 'Perfil de jogador não encontrado.' });
      }
      return res.status(201).json({ puzzle: toDTO(row) });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('Erro em /api/puzzles/solved:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
