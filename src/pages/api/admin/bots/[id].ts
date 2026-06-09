/**
 * PATCH  /api/admin/bots/[id] — atualização parcial de um bot (admin).
 * DELETE /api/admin/bots/[id] — remove um bot (admin).
 *
 * UC-26 (Editar bot) e UC-27 (Excluir bot).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import {
  deleteBot,
  findBotById,
  toBotDTO,
  updateBot,
  type NivelDificuldade,
  type UpdateBotInput,
} from '@/lib/bots';
import {
  validateBotNome,
  validateNivelDificuldade,
  validateParametrosEstrategia,
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
    return res.status(400).json({ error: 'ID do bot inválido.' });
  }

  if (req.method === 'GET') {
    const row = await findBotById(id);
    if (!row) return res.status(404).json({ error: 'Bot não encontrado.' });
    return res.status(200).json({ bot: toBotDTO(row) });
  }

  if (req.method === 'PATCH') {
    const { nome, nivelDificuldade, descricao, parametrosEstrategia, ativo } = req.body ?? {};
    const input: UpdateBotInput = {};

    if (nome !== undefined) {
      const e = validateBotNome(nome);
      if (e) return res.status(400).json({ error: e });
      input.nome = nome;
    }
    if (nivelDificuldade !== undefined) {
      const e = validateNivelDificuldade(nivelDificuldade);
      if (e) return res.status(400).json({ error: e });
      input.nivelDificuldade = nivelDificuldade as NivelDificuldade;
    }
    if (descricao !== undefined) {
      if (descricao !== null && typeof descricao !== 'string') {
        return res.status(400).json({ error: 'descricao inválida.' });
      }
      input.descricao = descricao;
    }
    if (parametrosEstrategia !== undefined) {
      const e = validateParametrosEstrategia(parametrosEstrategia);
      if (e) return res.status(400).json({ error: e });
      input.parametrosEstrategia = parametrosEstrategia;
    }
    if (ativo !== undefined) {
      if (typeof ativo !== 'boolean') {
        return res.status(400).json({ error: 'ativo deve ser booleano.' });
      }
      input.ativo = ativo;
    }

    try {
      const row = await updateBot(id, input);
      if (!row) return res.status(404).json({ error: 'Bot não encontrado.' });
      return res.status(200).json({ bot: toBotDTO(row) });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === '23505'
      ) {
        return res
          .status(409)
          .json({ error: 'Já existe um bot com esse nome.' });
      }
      console.error('Erro em PATCH /api/admin/bots/[id]:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  if (req.method === 'DELETE') {
    const ok = await deleteBot(id);
    if (!ok) return res.status(404).json({ error: 'Bot não encontrado.' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
