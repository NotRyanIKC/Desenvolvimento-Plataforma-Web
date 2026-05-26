/**
 * POST /api/auth/login
 *
 * Autentica por e-mail OU username + senha.
 *
 * Body: { identifier, senha }
 * Resposta: 200 { user } + cookie de sessão
 *           400 dados ausentes
 *           401 credenciais inválidas
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  findByEmailOrUsername,
  toPublicUser,
  verificarSenha,
} from '@/lib/users';
import { setSessionCookie } from '@/lib/session';
import { withRequestLog } from '@/lib/withRequestLog';
import { isAdmin } from '@/lib/admin';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { identifier, senha } = req.body ?? {};

  if (typeof identifier !== 'string' || identifier.trim().length === 0) {
    return res.status(400).json({ error: 'Informe e-mail ou usuário.' });
  }
  if (typeof senha !== 'string' || senha.length === 0) {
    return res.status(400).json({ error: 'Informe a senha.' });
  }

  try {
    const user = await findByEmailOrUsername(identifier.trim());
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const ok = await verificarSenha(senha, user.senha_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    setSessionCookie(res, user.id);
    const admin = await isAdmin(user.id);
    return res.status(200).json({ user: toPublicUser(user), isAdmin: admin });
  } catch (err) {
    console.error('Erro em /api/auth/login:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
