/**
 * /api/puzzles/solved/[id]
 *
 * PATCH   → atualiza anotação / acerto / tentativas de um registro
 * DELETE  → remove um registro de puzzle resolvido
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserId } from '@/lib/session';
import {
  deleteResolvido,
  findByIdForUsuario,
  toDTO,
  updateResolvido,
} from '@/lib/puzzlesResolvidos';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const usuarioId = getSessionUserId(req);
  if (!usuarioId) return res.status(401).json({ error: 'Não autenticado.' });

  const idRaw = req.query.id;
  const id = Number(Array.isArray(idRaw) ? idRaw[0] : idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id inválido.' });
  }

  try {
    if (req.method === 'PATCH') {
      const { anotacao, acertou, tentativas } = req.body ?? {};

      if (
        anotacao !== undefined &&
        anotacao !== null &&
        typeof anotacao !== 'string'
      ) {
        return res.status(400).json({ error: 'anotacao inválida.' });
      }
      if (acertou !== undefined && typeof acertou !== 'boolean') {
        return res.status(400).json({ error: 'acertou inválido.' });
      }
      if (
        tentativas !== undefined &&
        (typeof tentativas !== 'number' ||
          !Number.isInteger(tentativas) ||
          tentativas < 1)
      ) {
        return res.status(400).json({ error: 'tentativas inválido.' });
      }

      const existente = await findByIdForUsuario(id, usuarioId);
      if (!existente) return res.status(404).json({ error: 'Registro não encontrado.' });

      const atualizado = await updateResolvido(id, usuarioId, {
        anotacao,
        acertou,
        tentativas,
      });
      if (!atualizado)
        return res.status(404).json({ error: 'Registro não encontrado.' });
      return res.status(200).json({ puzzle: toDTO(atualizado) });
    }

    if (req.method === 'DELETE') {
      const ok = await deleteResolvido(id, usuarioId);
      if (!ok) return res.status(404).json({ error: 'Registro não encontrado.' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('Erro em /api/puzzles/solved/[id]:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
