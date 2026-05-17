/**
 * POST /api/auth/register
 *
 * Cria um par usuario+jogador (em transação) e abre a sessão.
 *
 * Body: { nome, sobrenome, username, email, senha }
 * Resposta: 201 { user } + cookie de sessão
 *           400 erro de validação
 *           409 e-mail ou username já em uso
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createUser,
  findByEmailOrUsername,
  toPublicUser,
} from '@/lib/users';
import { setSessionCookie } from '@/lib/session';
import {
  firstError,
  validateEmail,
  validateNome,
  validateSenha,
  validateSobrenome,
  validateUsername,
} from '@/lib/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { nome, sobrenome, username, email, senha } = req.body ?? {};

  const erro = firstError(
    validateNome(nome),
    validateSobrenome(sobrenome),
    validateUsername(username),
    validateEmail(email),
    validateSenha(senha)
  );
  if (erro) return res.status(400).json({ error: erro });

  try {
    const existenteEmail = await findByEmailOrUsername(email);
    if (existenteEmail) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }
    const existenteUser = await findByEmailOrUsername(username);
    if (existenteUser) {
      return res.status(409).json({ error: 'Nome de usuário já em uso.' });
    }

    const { usuario } = await createUser({
      nome,
      sobrenome,
      username,
      email,
      senha,
    });
    setSessionCookie(res, usuario.id);
    return res.status(201).json({ user: toPublicUser(usuario) });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === '23505'
    ) {
      return res.status(409).json({ error: 'E-mail ou usuário já em uso.' });
    }
    console.error('Erro em /api/auth/register:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
