/**
 * GET  /api/admin/puzzles  — lista o catálogo (admin).
 * POST /api/admin/puzzles  — cria um puzzle no catálogo (admin).
 *
 * UC-20 (Cadastrar puzzle) e UC-21 (Consultar puzzles).
 *
 * Body POST: { fen, solucao: string[], fase, rating?, temas?, lichessId? }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import { createPuzzle, listAllPuzzles, toPuzzleDTO } from '@/lib/puzzles';
import {
  firstError,
  validateFase,
  validateFen,
  validateRating,
  validateSolucao,
} from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({
      error:
        auth.status === 401
          ? 'Não autenticado.'
          : 'Acesso restrito a administradores.',
    });
  }

  if (req.method === 'GET') {
    const rows = await listAllPuzzles();
    return res.status(200).json({ puzzles: rows.map(toPuzzleDTO) });
  }

  if (req.method === 'POST') {
    const { fen, solucao, fase, rating, temas, lichessId } = req.body ?? {};

    const erro = firstError(
      validateFen(fen),
      validateSolucao(solucao),
      validateFase(fase),
      rating !== undefined && rating !== null ? validateRating(rating) : null
    );
    if (erro) return res.status(400).json({ error: erro });

    if (
      temas !== undefined &&
      temas !== null &&
      (!Array.isArray(temas) || !temas.every((t) => typeof t === 'string'))
    ) {
      return res.status(400).json({ error: 'temas inválidos.' });
    }
    if (
      lichessId !== undefined &&
      lichessId !== null &&
      typeof lichessId !== 'string'
    ) {
      return res.status(400).json({ error: 'lichessId inválido.' });
    }

    try {
      const row = await createPuzzle(
        {
          fen,
          solucao,
          fase,
          rating: rating ?? null,
          temas: temas ?? null,
          lichessId: lichessId ? lichessId.trim() : null,
        },
        auth.adminId
      );
      return res.status(201).json({ puzzle: toPuzzleDTO(row) });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === '23505'
      ) {
        return res
          .status(409)
          .json({ error: 'Já existe um puzzle com esse lichessId.' });
      }
      console.error('Erro em POST /api/admin/puzzles:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
