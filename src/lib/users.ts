/**
 * src/lib/users.ts
 *
 * Acesso ao agregado Usuário (tabelas `usuario` + `jogador`).
 *
 * No modelo unificado o `usuario` é a raiz e o `jogador` é seu
 * lado "competitivo" (1:1). Toda conta criada via /api/auth/register
 * gera um par usuario+jogador na mesma transação.
 *
 * Hash de senha: bcryptjs (BCRYPT_ROUNDS = 10).
 */

import bcrypt from 'bcryptjs';
import { pool, query } from './db';

export interface UsuarioRow {
  id: string;
  nome: string;
  sobrenome: string;
  username: string;
  email: string;
  senha_hash: string;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface JogadorRow {
  id: string;
  usuario_id: string;
  rating: number;
  partidas_jogadas: number;
  partidas_vencidas: number;
  partidas_perdidas: number;
  puzzles_resolvidos: number;
  serie_dias: number;
  ultima_atividade: Date | null;
  criado_em: Date;
}

export interface PublicUser {
  id: string;
  nome: string;
  sobrenome: string;
  username: string;
  email: string;
  criadoEm: string;
}

export function toPublicUser(row: UsuarioRow): PublicUser {
  return {
    id: row.id,
    nome: row.nome,
    sobrenome: row.sobrenome,
    username: row.username,
    email: row.email,
    criadoEm: row.criado_em.toISOString(),
  };
}

const BCRYPT_ROUNDS = 10;

export async function hashSenha(senhaPlana: string): Promise<string> {
  return bcrypt.hash(senhaPlana, BCRYPT_ROUNDS);
}

export async function verificarSenha(
  senhaPlana: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(senhaPlana, hash);
}

/* ─── Queries de leitura ─────────────────────────────────── */

export async function findById(id: string): Promise<UsuarioRow | null> {
  const { rows } = await query<UsuarioRow>(
    'SELECT * FROM usuario WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function findByEmailOrUsername(
  identifier: string
): Promise<UsuarioRow | null> {
  const { rows } = await query<UsuarioRow>(
    'SELECT * FROM usuario WHERE email = $1 OR username = $1 LIMIT 1',
    [identifier.toLowerCase()]
  );
  return rows[0] ?? null;
}

/**
 * Devolve o `jogador.id` (UUID) do usuário informado.
 * As tabelas filhas (puzzles_resolvidos, partida, …) referenciam jogador,
 * por isso muitas rotas precisam desse id derivado.
 */
export async function findJogadorIdByUsuarioId(
  usuarioId: string
): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    'SELECT id FROM jogador WHERE usuario_id = $1',
    [usuarioId]
  );
  return rows[0]?.id ?? null;
}

/* ─── Criação / atualização ──────────────────────────────── */

export interface CreateUserInput {
  nome: string;
  sobrenome: string;
  username: string;
  email: string;
  senha: string;
}

/**
 * Cria um par usuario+jogador em uma transação.
 * Lança erro do Postgres (código 23505) se email/username já existirem.
 */
export async function createUser(
  input: CreateUserInput
): Promise<{ usuario: UsuarioRow; jogador: JogadorRow }> {
  const senhaHash = await hashSenha(input.senha);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: usuarioRows } = await client.query<UsuarioRow>(
      `INSERT INTO usuario (nome, sobrenome, username, email, senha_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        input.nome.trim(),
        input.sobrenome.trim(),
        input.username.toLowerCase(),
        input.email.toLowerCase(),
        senhaHash,
      ]
    );
    const usuario = usuarioRows[0];

    const { rows: jogadorRows } = await client.query<JogadorRow>(
      `INSERT INTO jogador (usuario_id) VALUES ($1) RETURNING *`,
      [usuario.id]
    );
    const jogador = jogadorRows[0];

    await client.query('COMMIT');
    return { usuario, jogador };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export interface UpdateUserInput {
  nome?: string;
  sobrenome?: string;
  email?: string;
  senha?: string;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<UsuarioRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (input.nome !== undefined) {
    sets.push(`nome = $${idx++}`);
    params.push(input.nome.trim());
  }
  if (input.sobrenome !== undefined) {
    sets.push(`sobrenome = $${idx++}`);
    params.push(input.sobrenome.trim());
  }
  if (input.email !== undefined) {
    sets.push(`email = $${idx++}`);
    params.push(input.email.toLowerCase());
  }
  if (input.senha !== undefined) {
    sets.push(`senha_hash = $${idx++}`);
    params.push(await hashSenha(input.senha));
  }

  if (sets.length === 0) return findById(id);

  // O trigger trg_usuario_atualizado_em cuida do atualizado_em.
  params.push(id);
  const { rows } = await query<UsuarioRow>(
    `UPDATE usuario SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

export async function deleteUser(id: string): Promise<boolean> {
  // ON DELETE CASCADE em jogador, admin, puzzles_resolvidos cuida do resto.
  const { rowCount } = await query('DELETE FROM usuario WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
