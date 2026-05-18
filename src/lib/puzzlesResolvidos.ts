/**
 * src/lib/puzzlesResolvidos.ts
 *
 * Acesso à tabela `puzzles_resolvidos` — histórico do "lado jogador"
 * de cada usuário. Recebe sempre o `usuarioId` (vindo da sessão) e
 * resolve internamente para `jogador.id`, mantendo a API consistente.
 */

import { query } from './db';
import { findJogadorIdByUsuarioId } from './users';

export interface PuzzleResolvidoRow {
  id: number;
  jogador_id: string;
  puzzle_id: string;
  fase: number;
  rating: number | null;
  tentativas: number;
  acertou: boolean;
  anotacao: string | null;
  resolvido_em: Date;
  atualizado_em: Date;
}

export interface PuzzleResolvidoDTO {
  id: number;
  puzzleId: string;
  fase: number;
  rating: number | null;
  tentativas: number;
  acertou: boolean;
  anotacao: string | null;
  resolvidoEm: string;
  atualizadoEm: string;
}

export function toDTO(row: PuzzleResolvidoRow): PuzzleResolvidoDTO {
  return {
    id: row.id,
    puzzleId: row.puzzle_id,
    fase: row.fase,
    rating: row.rating,
    tentativas: row.tentativas,
    acertou: row.acertou,
    anotacao: row.anotacao,
    resolvidoEm: row.resolvido_em.toISOString(),
    atualizadoEm: row.atualizado_em.toISOString(),
  };
}

/* ─── Leitura ─────────────────────────────────────────────── */

export async function listByUsuario(
  usuarioId: string
): Promise<PuzzleResolvidoRow[]> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return [];

  const { rows } = await query<PuzzleResolvidoRow>(
    `SELECT * FROM puzzles_resolvidos
       WHERE jogador_id = $1
       ORDER BY resolvido_em DESC`,
    [jogadorId]
  );
  return rows;
}

export async function findByIdForUsuario(
  id: number,
  usuarioId: string
): Promise<PuzzleResolvidoRow | null> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return null;

  const { rows } = await query<PuzzleResolvidoRow>(
    `SELECT * FROM puzzles_resolvidos WHERE id = $1 AND jogador_id = $2`,
    [id, jogadorId]
  );
  return rows[0] ?? null;
}

/* ─── Create / Update / Delete ───────────────────────────── */

export interface UpsertInput {
  usuarioId: string;
  puzzleId: string;
  fase: number;
  rating?: number | null;
  tentativas?: number;
  acertou?: boolean;
  anotacao?: string | null;
}

export async function upsertResolvido(
  input: UpsertInput
): Promise<PuzzleResolvidoRow | null> {
  const jogadorId = await findJogadorIdByUsuarioId(input.usuarioId);
  if (!jogadorId) return null;

  const { rows } = await query<PuzzleResolvidoRow>(
    `INSERT INTO puzzles_resolvidos
       (jogador_id, puzzle_id, fase, rating, tentativas, acertou, anotacao)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (jogador_id, puzzle_id) DO UPDATE
       SET tentativas = puzzles_resolvidos.tentativas + EXCLUDED.tentativas,
           fase       = EXCLUDED.fase,
           rating     = COALESCE(EXCLUDED.rating, puzzles_resolvidos.rating),
           acertou    = EXCLUDED.acertou,
           anotacao   = COALESCE(EXCLUDED.anotacao, puzzles_resolvidos.anotacao)
     RETURNING *`,
    [
      jogadorId,
      input.puzzleId,
      input.fase,
      input.rating ?? null,
      input.tentativas ?? 1,
      input.acertou ?? true,
      input.anotacao ?? null,
    ]
  );
  return rows[0];
}

export interface UpdateInput {
  anotacao?: string | null;
  acertou?: boolean;
  tentativas?: number;
}

export async function updateResolvido(
  id: number,
  usuarioId: string,
  input: UpdateInput
): Promise<PuzzleResolvidoRow | null> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return null;

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (input.anotacao !== undefined) {
    sets.push(`anotacao = $${idx++}`);
    params.push(input.anotacao);
  }
  if (input.acertou !== undefined) {
    sets.push(`acertou = $${idx++}`);
    params.push(input.acertou);
  }
  if (input.tentativas !== undefined) {
    sets.push(`tentativas = $${idx++}`);
    params.push(input.tentativas);
  }
  if (sets.length === 0) return findByIdForUsuario(id, usuarioId);

  params.push(id, jogadorId);
  const { rows } = await query<PuzzleResolvidoRow>(
    `UPDATE puzzles_resolvidos
        SET ${sets.join(', ')}
      WHERE id = $${idx++} AND jogador_id = $${idx}
   RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

export async function deleteResolvido(
  id: number,
  usuarioId: string
): Promise<boolean> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return false;

  const { rowCount } = await query(
    `DELETE FROM puzzles_resolvidos WHERE id = $1 AND jogador_id = $2`,
    [id, jogadorId]
  );
  return (rowCount ?? 0) > 0;
}
