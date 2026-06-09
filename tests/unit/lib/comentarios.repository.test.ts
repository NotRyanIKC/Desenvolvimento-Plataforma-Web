import { beforeEach, describe, expect, test, vi } from 'vitest';

const { queryMock, findJogadorMock } = vi.hoisted(() => ({ queryMock: vi.fn(), findJogadorMock: vi.fn() }));

vi.mock('../../../src/lib/db', () => ({ query: queryMock }));
vi.mock('../../../src/lib/users', () => ({ findJogadorIdByUsuarioId: findJogadorMock }));

import {
  createComentario,
  deleteComentario,
  findOwnComentarioById,
  listByPuzzle,
  updateComentario,
  type ComentarioRow,
} from '../../../src/lib/comentarios';

function row(overrides: Partial<ComentarioRow> = {}): ComentarioRow {
  return {
    id: 'comentario-1',
    jogador_id: 'jogador-1',
    puzzle_lichess_id: 'lichess-1',
    texto: 'Ótimo puzzle',
    criado_em: new Date('2026-06-09T10:00:00.000Z'),
    atualizado_em: new Date('2026-06-09T11:00:00.000Z'),
    ...overrides,
  };
}

function rowWithAuthor(overrides: Partial<ComentarioRow> = {}) {
  return { ...row(overrides), autor_nome: 'Victor', autor_username: 'victor' };
}

describe('repositório de comentários', () => {
  beforeEach(() => {
    queryMock.mockReset();
    findJogadorMock.mockReset();
  });

  test('lista comentários para visitante e usuário autenticado', async () => {
    queryMock.mockResolvedValueOnce({ rows: [rowWithAuthor()] }).mockResolvedValueOnce({ rows: [rowWithAuthor()] });
    findJogadorMock.mockResolvedValueOnce('jogador-1');
    expect((await listByPuzzle('lichess-1', null))[0].pertenceAoLeitor).toBe(false);
    expect((await listByPuzzle('lichess-1', 'usuario-1'))[0].pertenceAoLeitor).toBe(true);
  });

  test('cria comentário com trim e devolve autor completo', async () => {
    findJogadorMock.mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [{ nome: 'Victor', username: 'victor' }] });
    const dto = await createComentario({ usuarioId: 'usuario-1', puzzleLichessId: 'lichess-1', texto: '  Ótimo puzzle  ' });
    expect(dto).toMatchObject({ texto: 'Ótimo puzzle', pertenceAoLeitor: true, autor: { jogadorId: 'jogador-1', nome: 'Victor', username: 'victor' } });
    expect(queryMock.mock.calls[0][1]).toEqual(['jogador-1', 'lichess-1', 'Ótimo puzzle']);
  });

  test('bloqueia criação para usuário sem jogador', async () => {
    findJogadorMock.mockResolvedValueOnce(null);
    await expect(createComentario({ usuarioId: 'usuario-x', puzzleLichessId: 'p', texto: 'x' })).rejects.toThrow('Jogador não encontrado');
  });

  test('busca somente comentário próprio', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1').mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await findOwnComentarioById('comentario-1', 'usuario-x')).toBeNull();
    expect(await findOwnComentarioById('comentario-1', 'usuario-1')).toEqual(row());
    expect(await findOwnComentarioById('comentario-x', 'usuario-1')).toBeNull();
  });

  test('atualiza comentário próprio e cobre usuário sem jogador ou registro ausente', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1').mockResolvedValueOnce('jogador-1');
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [row({ texto: 'Editado' })] })
      .mockResolvedValueOnce({ rows: [{ nome: 'Victor', username: 'victor' }] });
    expect(await updateComentario('comentario-1', 'usuario-x', 'Editado')).toBeNull();
    expect(await updateComentario('comentario-x', 'usuario-1', 'Editado')).toBeNull();
    expect(await updateComentario('comentario-1', 'usuario-1', '  Editado  ')).toMatchObject({ texto: 'Editado', pertenceAoLeitor: true });
  });

  test('exclusão diferencia usuário sem jogador, sucesso e ausência', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1').mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: null });
    expect(await deleteComentario('comentario-1', 'usuario-x')).toBe(false);
    expect(await deleteComentario('comentario-1', 'usuario-1')).toBe(true);
    expect(await deleteComentario('comentario-x', 'usuario-1')).toBe(false);
  });
});
