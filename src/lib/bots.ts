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
