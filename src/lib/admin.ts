/**
 * src/lib/admin.ts
 *
 * Acesso ao papel de administrador. Um usuário é admin quando existe uma
 * linha em `admin` (1:1 com `usuario`) apontando para ele. As tabelas `bot`
 * e `puzzle` referenciam `admin.id` (criado_por_id / adicionado_por_id), por
 * isso o guard devolve também o `adminId`.
 */

import type { NextApiRequest } from 'next';
import { query } from './db';
import { getSessionUserId } from './session';

/**
 * Indica se o usuário informado é administrador.
 */
export async function isAdmin(usuarioId: string): Promise<boolean> {
  const { rowCount } = await query(
    'SELECT 1 FROM admin WHERE usuario_id = $1',
    [usuarioId]
  );
  return (rowCount ?? 0) > 0;
}

/**
 * Devolve o `admin.id` (UUID) do usuário, ou null se ele não for admin.
 * Necessário para preencher bot.criado_por_id e puzzle.adicionado_por_id.
 */
export async function findAdminIdByUsuarioId(
  usuarioId: string
): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    'SELECT id FROM admin WHERE usuario_id = $1',
    [usuarioId]
  );
  return rows[0]?.id ?? null;
}

export type AdminAuth =
  | { ok: true; usuarioId: string; adminId: string }
  | { ok: false; status: 401 | 403 };

/**
 * Guard das rotas de admin. Combina a sessão com o lookup na tabela `admin`:
 *   - 401 quando não há sessão válida (não autenticado).
 *   - 403 quando há sessão mas o usuário não é admin.
 */
export async function requireAdmin(req: NextApiRequest): Promise<AdminAuth> {
  const usuarioId = getSessionUserId(req);
  if (!usuarioId) return { ok: false, status: 401 };

  const adminId = await findAdminIdByUsuarioId(usuarioId);
  if (!adminId) return { ok: false, status: 403 };

  return { ok: true, usuarioId, adminId };
}
