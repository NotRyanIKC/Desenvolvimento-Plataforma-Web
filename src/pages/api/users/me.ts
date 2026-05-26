/**
 * /api/users/me
 *
 * GET     → dados do usuário logado
 * PATCH   → atualiza nome / sobrenome / e-mail / senha (subset)
 * DELETE  → exclui a conta (cascateia jogador, puzzles_resolvidos…)
 *
 * Todas as operações exigem cookie de sessão válido.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  clearSessionCookie,
  getSessionUserId,
} from '@/lib/session';
import {
  deleteUser,
  findById,
  findByEmailOrUsername,
  toPublicUser,
  updateUser,
  verificarSenha,
} from '@/lib/users';
import {
  firstError,
  validateEmail,
  validateNome,
  validateSenha,
  validateSobrenome,
} from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';
import { isAdmin } from '@/lib/admin';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const usuarioId = getSessionUserId(req);
  if (!usuarioId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    if (req.method === 'GET') {
      const user = await findById(usuarioId);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      const admin = await isAdmin(usuarioId);
      return res.status(200).json({ user: toPublicUser(user), isAdmin: admin });
    }

    if (req.method === 'PATCH') {
      const { nome, sobrenome, email, senha, senhaAtual } = req.body ?? {};

      const exigeSenhaAtual = email !== undefined || senha !== undefined;
      if (exigeSenhaAtual) {
        if (typeof senhaAtual !== 'string' || senhaAtual.length === 0) {
          return res
            .status(400)
            .json({ error: 'Informe sua senha atual para alterar e-mail ou senha.' });
        }
        const atual = await findById(usuarioId);
        if (!atual) return res.status(404).json({ error: 'Usuário não encontrado.' });
        const ok = await verificarSenha(senhaAtual, atual.senha_hash);
        if (!ok) return res.status(401).json({ error: 'Senha atual incorreta.' });
      }

      const erro = firstError(
        nome !== undefined ? validateNome(nome) : null,
        sobrenome !== undefined ? validateSobrenome(sobrenome) : null,
        email !== undefined ? validateEmail(email) : null,
        senha !== undefined ? validateSenha(senha) : null
      );
      if (erro) return res.status(400).json({ error: erro });

      if (email !== undefined) {
        const existente = await findByEmailOrUsername(email);
        if (existente && existente.id !== usuarioId) {
          return res.status(409).json({ error: 'E-mail já em uso.' });
        }
      }

      const atualizado = await updateUser(usuarioId, {
        nome,
        sobrenome,
        email,
        senha,
      });
      if (!atualizado) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.status(200).json({ user: toPublicUser(atualizado) });
    }

    if (req.method === 'DELETE') {
      const ok = await deleteUser(usuarioId);
      clearSessionCookie(res);
      if (!ok) return res.status(404).json({ error: 'Usuário não encontrado.' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === '23505'
    ) {
      return res.status(409).json({ error: 'E-mail já em uso.' });
    }
    console.error('Erro em /api/users/me:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
