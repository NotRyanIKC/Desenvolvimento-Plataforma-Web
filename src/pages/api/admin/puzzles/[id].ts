/**
 * PATCH  /api/admin/puzzles/[id] — atualização parcial de um puzzle (admin).
 * DELETE /api/admin/puzzles/[id] — remove um puzzle do catálogo (admin).
 *
 * UC-22 (Editar puzzle) e UC-23 (Excluir puzzle).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import {
  deletePuzzle,
  findPuzzleById,
  toPuzzleDTO,
  updatePuzzle,
  type UpdatePuzzleInput,
} from '@/lib/puzzles';
import {
  firstError,
  validateFase,
  validateFen,
  validatePuzzleNome,
  validateRating,
  validateSolucao,
} from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const id = String(req.query.id ?? '');
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'ID do puzzle inválido.' });
  }

  if (req.method === 'GET') {
    const row = await findPuzzleById(id);
    if (!row) return res.status(404).json({ error: 'Puzzle não encontrado.' });
    return res.status(200).json({ puzzle: toPuzzleDTO(row) });
  }

  if (req.method === 'PATCH') {
    const { nome, fen, solucao, fase, rating, temas, lichessId, ativo } =
      req.body ?? {};

    const input: UpdatePuzzleInput = {};

    if (nome !== undefined) {
      const e = validatePuzzleNome(nome);
      if (e) return res.status(400).json({ error: e });
      input.nome = nome;
    }
    if (fen !== undefined) {
      const e = validateFen(fen);
      if (e) return res.status(400).json({ error: e });
      input.fen = fen;
    }
    if (solucao !== undefined) {
      const e = validateSolucao(solucao);
      if (e) return res.status(400).json({ error: e });
      input.solucao = solucao;
    }
    if (fase !== undefined) {
      const e = validateFase(fase);
      if (e) return res.status(400).json({ error: e });
      input.fase = fase;
    }
    if (rating !== undefined && rating !== null) {
      const e = validateRating(rating);
      if (e) return res.status(400).json({ error: e });
      input.rating = rating;
    }
    if (temas !== undefined) {
      if (
        temas !== null &&
        (!Array.isArray(temas) || !temas.every((t) => typeof t === 'string'))
      ) {
        return res.status(400).json({ error: 'temas inválidos.' });
      }
      input.temas = temas;
    }
    if (lichessId !== undefined) {
      if (lichessId !== null && typeof lichessId !== 'string') {
        return res.status(400).json({ error: 'lichessId inválido.' });
      }
      input.lichessId = lichessId === null ? null : (lichessId as string).trim();
    }
    if (ativo !== undefined) {
      if (typeof ativo !== 'boolean') {
        return res.status(400).json({ error: 'ativo deve ser booleano.' });
      }
      input.ativo = ativo;
    }

    // garantia: nada além desses campos foi aceito
    void firstError; // silencia linter caso algum dia o firstError seja removido daqui

    try {
      const row = await updatePuzzle(id, input);
      if (!row) return res.status(404).json({ error: 'Puzzle não encontrado.' });
      return res.status(200).json({ puzzle: toPuzzleDTO(row) });
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
      console.error('Erro em PATCH /api/admin/puzzles/[id]:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  if (req.method === 'DELETE') {
    const ok = await deletePuzzle(id);
    if (!ok) return res.status(404).json({ error: 'Puzzle não encontrado.' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
