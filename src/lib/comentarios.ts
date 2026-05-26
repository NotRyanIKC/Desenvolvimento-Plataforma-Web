/**
 * src/lib/comentarios.ts
 *
 * Repositório do CRUD de Comentários em puzzles (Sprint 3).
 *
 * Cada comentário pertence a um `jogador` (não diretamente ao `usuario`)
 * e referencia um puzzle por seu identificador externo do Lichess
 * (puzzle_lichess_id). Isso permite que um jogador comente em qualquer
 * puzzle vindo da API do Lichess, mesmo que o admin não tenha importado
 * o puzzle para o catálogo local.
 *
 * UC-16 Publicar comentário, UC-17 Visualizar comentários,
 * UC-18 Editar comentário, UC-19 Excluir comentário.
 */

import { query } from './db';
import { findJogadorIdByUsuarioId } from './users';

export interface ComentarioRow {
  id: string;
  jogador_id: string;
  puzzle_lichess_id: string;
  texto: string;
  criado_em: Date;
  atualizado_em: Date;
}

export interface ComentarioDTO {
  id: string;
  puzzleLichessId: string;
  texto: string;
  autor: {
    jogadorId: string;
    nome: string;
    username: string;
  };
  criadoEm: string;
  atualizadoEm: string;
  /** Se o comentário pertence ao jogador da sessão atual (UI mostra editar/excluir). */
  pertenceAoLeitor: boolean;
}

interface ComentarioComAutor extends ComentarioRow {
  autor_nome: string;
  autor_username: string;
}

function toDTO(
  row: ComentarioComAutor,
  jogadorIdDoLeitor: string | null
): ComentarioDTO {
  return {
    id: row.id,
    puzzleLichessId: row.puzzle_lichess_id,
    texto: row.texto,
    autor: {
      jogadorId: row.jogador_id,
      nome: row.autor_nome,
      username: row.autor_username,
    },
    criadoEm: row.criado_em.toISOString(),
    atualizadoEm: row.atualizado_em.toISOString(),
    pertenceAoLeitor: row.jogador_id === jogadorIdDoLeitor,
  };
}

/**
 * Lista comentários de um puzzle (mais antigos primeiro, pra fluxo de conversa).
 * Marca cada item com `pertenceAoLeitor` para a UI saber se mostra edit/delete.
 */
export async function listByPuzzle(
  puzzleLichessId: string,
  usuarioIdDoLeitor: string | null
): Promise<ComentarioDTO[]> {
  const jogadorIdDoLeitor = usuarioIdDoLeitor
    ? await findJogadorIdByUsuarioId(usuarioIdDoLeitor)
    : null;

  const { rows } = await query<ComentarioComAutor>(
    `SELECT c.*,
            u.nome     AS autor_nome,
            u.username AS autor_username
     FROM comentario c
     JOIN jogador j ON j.id = c.jogador_id
     JOIN usuario u ON u.id = j.usuario_id
     WHERE c.puzzle_lichess_id = $1
     ORDER BY c.criado_em ASC`,
    [puzzleLichessId]
  );
  return rows.map((r) => toDTO(r, jogadorIdDoLeitor));
}

export interface CreateComentarioInput {
  usuarioId: string;
  puzzleLichessId: string;
  texto: string;
}

/**
 * Cria um comentário no puzzle. Resolve o jogador_id internamente a partir
 * do usuario_id. Lança erro se o usuario não tiver jogador associado
 * (não deveria acontecer porque /api/auth/register cria os dois juntos).
 */
export async function createComentario(
  input: CreateComentarioInput
): Promise<ComentarioDTO> {
  const jogadorId = await findJogadorIdByUsuarioId(input.usuarioId);
  if (!jogadorId) {
    throw new Error('Jogador não encontrado para o usuário da sessão.');
  }

  const { rows } = await query<ComentarioRow>(
    `INSERT INTO comentario (jogador_id, puzzle_lichess_id, texto)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [jogadorId, input.puzzleLichessId, input.texto.trim()]
  );
  const novo = rows[0];

  // Busca dados do autor para devolver DTO completo
  const { rows: autorRows } = await query<{ nome: string; username: string }>(
    `SELECT u.nome, u.username
     FROM jogador j JOIN usuario u ON u.id = j.usuario_id
     WHERE j.id = $1`,
    [jogadorId]
  );
  const autor = autorRows[0];

  return toDTO(
    {
      ...novo,
      autor_nome: autor.nome,
      autor_username: autor.username,
    },
    jogadorId
  );
}

/**
 * Busca um comentário por id já checando se pertence ao usuário da sessão.
 * Devolve null quando não existe OU quando não é dono — a UI/handler trata
 * ambos os casos como 404 (não vazamos a informação de que o id existe).
 */
export async function findOwnComentarioById(
  comentarioId: string,
  usuarioId: string
): Promise<ComentarioRow | null> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return null;

  const { rows } = await query<ComentarioRow>(
    'SELECT * FROM comentario WHERE id = $1 AND jogador_id = $2',
    [comentarioId, jogadorId]
  );
  return rows[0] ?? null;
}

/**
 * Atualiza o texto do comentário SE pertencer ao usuário da sessão.
 * Devolve null caso contrário (vira 404/403 no handler).
 */
export async function updateComentario(
  comentarioId: string,
  usuarioId: string,
  texto: string
): Promise<ComentarioDTO | null> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return null;

  const { rows } = await query<ComentarioRow>(
    `UPDATE comentario
     SET texto = $1
     WHERE id = $2 AND jogador_id = $3
     RETURNING *`,
    [texto.trim(), comentarioId, jogadorId]
  );
  if (rows.length === 0) return null;

  const { rows: autorRows } = await query<{ nome: string; username: string }>(
    `SELECT u.nome, u.username
     FROM jogador j JOIN usuario u ON u.id = j.usuario_id
     WHERE j.id = $1`,
    [jogadorId]
  );
  const autor = autorRows[0];

  return toDTO(
    {
      ...rows[0],
      autor_nome: autor.nome,
      autor_username: autor.username,
    },
    jogadorId
  );
}

/**
 * Exclui o comentário SE pertencer ao usuário da sessão.
 * Retorna true em caso de sucesso, false caso contrário (404 no handler).
 */
export async function deleteComentario(
  comentarioId: string,
  usuarioId: string
): Promise<boolean> {
  const jogadorId = await findJogadorIdByUsuarioId(usuarioId);
  if (!jogadorId) return false;

  const { rowCount } = await query(
    'DELETE FROM comentario WHERE id = $1 AND jogador_id = $2',
    [comentarioId, jogadorId]
  );
  return (rowCount ?? 0) > 0;
}
