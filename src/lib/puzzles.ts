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
  nome: string | null;
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
  nome: string | null;
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
    nome: row.nome,
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
  // Opcional na lib (coluna nullable, como rating/temas); a API exige via validação.
  nome?: string | null;
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
       (adicionado_por_id, lichess_id, nome, fen, solucao, rating, temas, fase)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 1200), $7, $8)
     RETURNING *`,
    [
      adminId,
      input.lichessId ?? null,
      input.nome?.trim() ?? null,
      input.fen.trim(),
      input.solucao,
      input.rating ?? null,
      input.temas ?? null,
      input.fase,
    ]
  );
  return rows[0];
}

/**
 * Lista todos os puzzles do catálogo (mais recentes primeiro).
 * Uso administrativo na tela "Catálogo de Puzzles".
 */
export async function listAllPuzzles(): Promise<PuzzleRow[]> {
  const { rows } = await query<PuzzleRow>(
    'SELECT * FROM puzzle ORDER BY criado_em DESC'
  );
  return rows;
}

/**
 * Lista apenas os puzzles ativos do catálogo (mais recentes primeiro).
 * Uso público na página "Puzzles dos Mestres".
 */
export async function listPuzzlesAtivos(): Promise<PuzzleRow[]> {
  const { rows } = await query<PuzzleRow>(
    'SELECT * FROM puzzle WHERE ativo = TRUE ORDER BY criado_em DESC'
  );
  return rows;
}

export async function findPuzzleById(id: string): Promise<PuzzleRow | null> {
  const { rows } = await query<PuzzleRow>(
    'SELECT * FROM puzzle WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export interface UpdatePuzzleInput {
  nome?: string;
  fen?: string;
  solucao?: string[];
  fase?: number;
  rating?: number;
  temas?: string[] | null;
  lichessId?: string | null;
  ativo?: boolean;
}

/**
 * Atualização parcial de um puzzle do catálogo. Campos não enviados ficam
 * inalterados. Devolve a linha atualizada, ou null se o id não existir.
 */
export async function updatePuzzle(
  id: string,
  input: UpdatePuzzleInput
): Promise<PuzzleRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (input.nome !== undefined) {
    sets.push(`nome = $${idx++}`);
    params.push(input.nome.trim());
  }
  if (input.fen !== undefined) {
    sets.push(`fen = $${idx++}`);
    params.push(input.fen.trim());
  }
  if (input.solucao !== undefined) {
    sets.push(`solucao = $${idx++}`);
    params.push(input.solucao);
  }
  if (input.fase !== undefined) {
    sets.push(`fase = $${idx++}`);
    params.push(input.fase);
  }
  if (input.rating !== undefined) {
    sets.push(`rating = $${idx++}`);
    params.push(input.rating);
  }
  if (input.temas !== undefined) {
    sets.push(`temas = $${idx++}`);
    params.push(input.temas);
  }
  if (input.lichessId !== undefined) {
    sets.push(`lichess_id = $${idx++}`);
    params.push(input.lichessId);
  }
  if (input.ativo !== undefined) {
    sets.push(`ativo = $${idx++}`);
    params.push(input.ativo);
  }

  if (sets.length === 0) return findPuzzleById(id);

  params.push(id);
  const { rows } = await query<PuzzleRow>(
    `UPDATE puzzle SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

export async function deletePuzzle(id: string): Promise<boolean> {
  const { rowCount } = await query('DELETE FROM puzzle WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
