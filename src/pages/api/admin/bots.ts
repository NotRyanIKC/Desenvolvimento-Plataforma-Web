/**
 * POST /api/admin/bots
 *
 * Cria um bot (tela "Criar Bots" do modo admin). Exige sessão de
 * administrador; o bot é vinculado ao admin criador (criado_por_id).
 *
 * Body: { nome, nivelDificuldade: 'facil'|'medio'|'dificil', descricao? }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import { createBot, toBotDTO, type NivelDificuldade } from '@/lib/bots';
import {
  firstError,
  validateBotNome,
  validateNivelDificuldade,
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

  const { nome, nivelDificuldade, descricao } = req.body ?? {};

  const erro = firstError(
    validateBotNome(nome),
    validateNivelDificuldade(nivelDificuldade)
  );
  if (erro) return res.status(400).json({ error: erro });

  if (descricao !== undefined && descricao !== null && typeof descricao !== 'string') {
    return res.status(400).json({ error: 'descricao inválida.' });
  }

  try {
    const row = await createBot(
      {
        nome,
        nivelDificuldade: nivelDificuldade as NivelDificuldade,
        descricao: descricao ?? null,
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
      return res.status(409).json({ error: 'Já existe um bot com esse nome.' });
    }
    console.error('Erro em /api/admin/bots:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
