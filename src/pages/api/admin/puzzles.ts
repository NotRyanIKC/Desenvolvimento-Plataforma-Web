/**
 * POST /api/admin/puzzles
 *
 * Cria um puzzle no catálogo (tela "Criar Puzzles" do modo admin).
 * Exige sessão de administrador. O puzzle é vinculado ao admin criador
 * (adicionado_por_id).
 *
 * Body: { fen, solucao: string[], fase, rating?, temas?, lichessId? }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import { createPuzzle, toPuzzleDTO } from '@/lib/puzzles';
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

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

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
    console.error('Erro em /api/admin/puzzles:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
