/**
 * POST /api/_internal/test/promote-admin
 *
 * Endpoint AUXILIAR PRO E2E:
 *   - Promove um usuário a administrador (insere em `admin`).
 *   - SÓ aceita em desenvolvimento (NODE_ENV !== 'production').
 *   - Em produção retorna 404.
 *
 * Existe pra resolver o problema de "qual banco o servidor está usando":
 * o helper de E2E chama esta rota via HTTP, então opera GARANTIDAMENTE no
 * mesmo banco que o resto do app (não precisa saber se é DEV ou _test).
 *
 * Body: { email: string }
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { email } = req.body ?? {};
  if (typeof email !== 'string' || email.length < 3) {
    return res.status(400).json({ error: 'email inválido.' });
  }

  try {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO admin (usuario_id)
       SELECT id FROM usuario WHERE email = $1
       ON CONFLICT (usuario_id) DO UPDATE SET usuario_id = EXCLUDED.usuario_id
       RETURNING id`,
      [email.toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ adminId: rows[0].id });
  } catch (err) {
    console.error('Erro em promote-admin:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
