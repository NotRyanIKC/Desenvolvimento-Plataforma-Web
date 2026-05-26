/**
 * GET  /api/comentarios?puzzleId=<lichessId>  — lista comentários do puzzle (UC-17).
 *   - Aceita usuário anônimo (não exige sessão). Quando há sessão, marca
 *     `pertenceAoLeitor` no payload pra UI saber se mostra editar/excluir.
 *
 * POST /api/comentarios  — publica um comentário (UC-16).
 *   - Exige sessão. Body: { puzzleLichessId, texto }.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createComentario,
  listByPuzzle,
} from '@/lib/comentarios';
import { getSessionUserId } from '@/lib/session';
import {
  firstError,
  validateComentarioTexto,
  validatePuzzleLichessId,
} from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const puzzleId = String(req.query.puzzleId ?? '');
    const errPuzzle = validatePuzzleLichessId(puzzleId);
    if (errPuzzle) return res.status(400).json({ error: errPuzzle });

    const usuarioId = getSessionUserId(req); // pode ser null (anônimo)
    const comentarios = await listByPuzzle(puzzleId, usuarioId);
    return res.status(200).json({ comentarios });
  }

  if (req.method === 'POST') {
    const usuarioId = getSessionUserId(req);
    if (!usuarioId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { puzzleLichessId, texto } = req.body ?? {};
    const erro = firstError(
      validatePuzzleLichessId(puzzleLichessId),
      validateComentarioTexto(texto)
    );
    if (erro) return res.status(400).json({ error: erro });

    try {
      const comentario = await createComentario({
        usuarioId,
        puzzleLichessId,
        texto,
      });
      return res.status(201).json({ comentario });
    } catch (err) {
      console.error('Erro em POST /api/comentarios:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
