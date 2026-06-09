/**
 * GET  /api/admin/bots  — lista todos os bots (admin).
 * POST /api/admin/bots  — cria um bot (admin).
 *
 * UC-24 (Cadastrar bot) e UC-25 (Consultar bots).
 *
 * Body POST: { nome, nivelDificuldade: 'facil'|'medio'|'dificil', descricao? }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import {
  createBot,
  listAllBots,
  toBotDTO,
  type NivelDificuldade,
} from '@/lib/bots';
import {
  firstError,
  validateBotNome,
  validateNivelDificuldade,
  validateParametrosEstrategia,
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
    const rows = await listAllBots();
    return res.status(200).json({ bots: rows.map(toBotDTO) });
  }

  if (req.method === 'POST') {
    const { nome, nivelDificuldade, descricao, parametrosEstrategia, ativo } = req.body ?? {};

    const erro = firstError(
      validateBotNome(nome),
      validateNivelDificuldade(nivelDificuldade),
      validateParametrosEstrategia(parametrosEstrategia),
      ativo !== undefined && typeof ativo !== 'boolean' ? 'ativo deve ser booleano.' : null
    );
    if (erro) return res.status(400).json({ error: erro });

    if (
      descricao !== undefined &&
      descricao !== null &&
      typeof descricao !== 'string'
    ) {
      return res.status(400).json({ error: 'descricao inválida.' });
    }

    try {
      const row = await createBot(
        {
          nome,
          nivelDificuldade: nivelDificuldade as NivelDificuldade,
          descricao: descricao ?? null,
          parametrosEstrategia: parametrosEstrategia ?? {},
          ativo: ativo ?? true,
        },
        auth.adminId
      );
      return res.status(201).json({ bot: toBotDTO(row) });
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
      console.error('Erro em POST /api/admin/bots:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
