/**
 * PATCH  /api/comentarios/[id]  — edita o texto do comentário (UC-18).
 * DELETE /api/comentarios/[id]  — remove o comentário (UC-19).
 *
 * Ambos exigem sessão E que o comentário PERTENÇA ao usuário da sessão.
 * Para evitar enumeração, retornamos 404 tanto quando o id não existe
 * quanto quando existe mas pertence a outro jogador.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  deleteComentario,
  updateComentario,
} from '@/lib/comentarios';
import { getSessionUserId } from '@/lib/session';
import { validateComentarioTexto } from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const usuarioId = getSessionUserId(req);
  if (!usuarioId) return res.status(401).json({ error: 'Não autenticado.' });

  const id = String(req.query.id ?? '');
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'ID do comentário inválido.' });
  }

  if (req.method === 'PATCH') {
    const { texto } = req.body ?? {};
    const e = validateComentarioTexto(texto);
    if (e) return res.status(400).json({ error: e });

    const atualizado = await updateComentario(id, usuarioId, texto);
    if (!atualizado) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }
    return res.status(200).json({ comentario: atualizado });
  }

  if (req.method === 'DELETE') {
    const ok = await deleteComentario(id, usuarioId);
    if (!ok) return res.status(404).json({ error: 'Comentário não encontrado.' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
