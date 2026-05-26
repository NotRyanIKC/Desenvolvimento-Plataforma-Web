/**
 * src/lib/puzzles.ts
 *
 * Acesso à tabela `puzzle` — o catálogo de puzzles da plataforma, gerenciado
 * por administradores (diferente de `puzzles_resolvidos`, que é o histórico
 * do jogador, em src/lib/puzzlesResolvidos.ts).
 *
 * `adicionado_por_id` referencia admin(id); o handler passa o adminId obtido
 * pelo requireAdmin.
 */

import { query } from './db';

export interface PuzzleRow {
  id: string;
  adicionado_por_id: string | null;
  lichess_id: string | null;
  fen: string;
  solucao: string[];
  rating: number;
  temas: string[] | null;
  fase: number;
  ativo: boolean;
  criado_em: Date;
}

export interface PuzzleDTO {
  id: string;
  lichessId: string | null;
  fen: string;
  solucao: string[];
  rating: number;
  temas: string[];
  fase: number;
  ativo: boolean;
  criadoEm: string;
}

export function toPuzzleDTO(row: PuzzleRow): PuzzleDTO {
  return {
    id: row.id,
    lichessId: row.lichess_id,
    fen: row.fen,
    solucao: row.solucao,
    rating: row.rating,
    temas: row.temas ?? [],
    fase: row.fase,
    ativo: row.ativo,
    criadoEm: row.criado_em.toISOString(),
  };
}

export interface CreatePuzzleInput {
  fen: string;
  solucao: string[];
  fase: number;
  rating?: number | null;
  temas?: string[] | null;
  lichessId?: string | null;
}

/**
 * Insere um puzzle no catálogo. `rating` ausente cai no DEFAULT 1200 do banco.
 * Lança o erro 23505 do Postgres se o lichess_id já existir (tratado na rota).
 */
export async function createPuzzle(
  input: CreatePuzzleInput,
  adminId: string
): Promise<PuzzleRow> {
  const { rows } = await query<PuzzleRow>(
    `INSERT INTO puzzle
       (adicionado_por_id, lichess_id, fen, solucao, rating, temas, fase)
     VALUES ($1, $2, $3, $4, COALESCE($5, 1200), $6, $7)
     RETURNING *`,
    [
      adminId,
      input.lichessId ?? null,
      input.fen.trim(),
      input.solucao,
      input.rating ?? null,
      input.temas ?? null,
      input.fase,
    ]
  );
  return rows[0];
}
