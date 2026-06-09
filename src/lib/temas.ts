import { query } from './db';

export interface TemaRow {
  id: string;
  criado_por_id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
  puzzles_associados?: number;
}

export interface TemaDTO {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  puzzlesAssociados: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateTemaInput {
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
}

export interface UpdateTemaInput {
  nome?: string;
  descricao?: string | null;
  ativo?: boolean;
}

export function toTemaDTO(row: TemaRow): TemaDTO {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    ativo: row.ativo,
    puzzlesAssociados: Number(row.puzzles_associados ?? 0),
    criadoEm: row.criado_em.toISOString(),
    atualizadoEm: row.atualizado_em.toISOString(),
  };
}

const SELECT_WITH_COUNT = `
  SELECT t.*,
    (
      SELECT COUNT(*)::int
      FROM puzzle p
      WHERE EXISTS (
        SELECT 1
        FROM unnest(COALESCE(p.temas, ARRAY[]::TEXT[])) tema_puzzle
        WHERE lower(tema_puzzle) = lower(t.nome)
      )
    ) AS puzzles_associados
  FROM tema t`;

export async function createTema(
  input: CreateTemaInput,
  adminId: string
): Promise<TemaRow> {
  const { rows } = await query<TemaRow>(
    `INSERT INTO tema (criado_por_id, nome, descricao, ativo)
     VALUES ($1, $2, $3, $4)
     RETURNING *, 0::int AS puzzles_associados`,
    [adminId, input.nome.trim(), input.descricao?.trim() || null, input.ativo ?? true]
  );
  return rows[0];
}

export async function listAllTemas(): Promise<TemaRow[]> {
  const { rows } = await query<TemaRow>(
    `${SELECT_WITH_COUNT} ORDER BY lower(t.nome)`
  );
  return rows;
}

export async function listActiveTemas(): Promise<TemaRow[]> {
  const { rows } = await query<TemaRow>(
    `${SELECT_WITH_COUNT} WHERE t.ativo = TRUE ORDER BY lower(t.nome)`
  );
  return rows;
}

export async function findTemaById(id: string): Promise<TemaRow | null> {
  const { rows } = await query<TemaRow>(
    `${SELECT_WITH_COUNT} WHERE t.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateTema(
  id: string,
  input: UpdateTemaInput
): Promise<TemaRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (input.nome !== undefined) {
    sets.push(`nome = $${idx++}`);
    params.push(input.nome.trim());
  }
  if (input.descricao !== undefined) {
    sets.push(`descricao = $${idx++}`);
    params.push(input.descricao?.trim() || null);
  }
  if (input.ativo !== undefined) {
    sets.push(`ativo = $${idx++}`);
    params.push(input.ativo);
  }

  if (sets.length === 0) return findTemaById(id);

  params.push(id);
  const { rows } = await query<{ id: string }>(
    `UPDATE tema SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
    params
  );
  if (!rows[0]) return null;
  return findTemaById(rows[0].id);
}

export type DeleteTemaResult = 'deleted' | 'not_found' | 'in_use';

export async function deleteTema(id: string): Promise<DeleteTemaResult> {
  const tema = await findTemaById(id);
  if (!tema) return 'not_found';
  if (Number(tema.puzzles_associados ?? 0) > 0) return 'in_use';
  const { rowCount } = await query('DELETE FROM tema WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0 ? 'deleted' : 'not_found';
}
