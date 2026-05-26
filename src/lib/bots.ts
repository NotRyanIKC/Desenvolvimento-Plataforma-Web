/**
 * src/lib/bots.ts
 *
 * Acesso à tabela `bot`. Cada bot é criado por um admin (criado_por_id
 * referencia admin(id)) e tem um nível de dificuldade do enum
 * `dificuldade_bot` ('facil' | 'medio' | 'dificil'). O nome é único.
 */

import { query } from './db';

export const NIVEIS_DIFICULDADE = ['facil', 'medio', 'dificil'] as const;
export type NivelDificuldade = (typeof NIVEIS_DIFICULDADE)[number];

export interface BotRow {
  id: string;
  criado_por_id: string;
  nome: string;
  nivel_dificuldade: NivelDificuldade;
  descricao: string | null;
  ativo: boolean;
  criado_em: Date;
}

export interface BotDTO {
  id: string;
  nome: string;
  nivelDificuldade: NivelDificuldade;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
}

export function toBotDTO(row: BotRow): BotDTO {
  return {
    id: row.id,
    nome: row.nome,
    nivelDificuldade: row.nivel_dificuldade,
    descricao: row.descricao,
    ativo: row.ativo,
    criadoEm: row.criado_em.toISOString(),
  };
}

export interface CreateBotInput {
  nome: string;
  nivelDificuldade: NivelDificuldade;
  descricao?: string | null;
}

/**
 * Cria um bot. Lança o erro 23505 do Postgres se o nome já existir
 * (constraint uq_bot_nome) — tratado na rota como 409.
 */
export async function createBot(
  input: CreateBotInput,
  adminId: string
): Promise<BotRow> {
  const { rows } = await query<BotRow>(
    `INSERT INTO bot (criado_por_id, nome, nivel_dificuldade, descricao)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [adminId, input.nome.trim(), input.nivelDificuldade, input.descricao ?? null]
  );
  return rows[0];
}

/** Lista todos os bots (mais recentes primeiro). */
export async function listAllBots(): Promise<BotRow[]> {
  const { rows } = await query<BotRow>(
    'SELECT * FROM bot ORDER BY criado_em DESC'
  );
  return rows;
}

export async function findBotById(id: string): Promise<BotRow | null> {
  const { rows } = await query<BotRow>('SELECT * FROM bot WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export interface UpdateBotInput {
  nome?: string;
  nivelDificuldade?: NivelDificuldade;
  descricao?: string | null;
  ativo?: boolean;
}

export async function updateBot(
  id: string,
  input: UpdateBotInput
): Promise<BotRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (input.nome !== undefined) {
    sets.push(`nome = $${idx++}`);
    params.push(input.nome.trim());
  }
  if (input.nivelDificuldade !== undefined) {
    sets.push(`nivel_dificuldade = $${idx++}`);
    params.push(input.nivelDificuldade);
  }
  if (input.descricao !== undefined) {
    sets.push(`descricao = $${idx++}`);
    params.push(input.descricao);
  }
  if (input.ativo !== undefined) {
    sets.push(`ativo = $${idx++}`);
    params.push(input.ativo);
  }

  if (sets.length === 0) return findBotById(id);

  params.push(id);
  const { rows } = await query<BotRow>(
    `UPDATE bot SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

export async function deleteBot(id: string): Promise<boolean> {
  const { rowCount } = await query('DELETE FROM bot WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
