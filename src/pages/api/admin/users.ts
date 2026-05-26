/**
 * GET /api/admin/users
 *
 * Lista todos os usuários (tela "Listar Usuários" do modo admin).
 * Exige sessão de administrador (requireAdmin): 401 sem sessão, 403 se a
 * sessão não for de admin.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import { listAllUsers, toAdminUser } from '@/lib/users';
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

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const rows = await listAllUsers();
    return res.status(200).json({ users: rows.map(toAdminUser) });
  } catch (err) {
    console.error('Erro em /api/admin/users:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export default withRequestLog(handler);
