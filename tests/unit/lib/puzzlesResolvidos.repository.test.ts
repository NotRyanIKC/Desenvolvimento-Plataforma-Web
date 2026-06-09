import { beforeEach, describe, expect, test, vi } from 'vitest';

const { queryMock, findJogadorMock } = vi.hoisted(() => ({ queryMock: vi.fn(), findJogadorMock: vi.fn() }));

vi.mock('../../../src/lib/db', () => ({ query: queryMock }));
vi.mock('../../../src/lib/users', () => ({ findJogadorIdByUsuarioId: findJogadorMock }));

import {
  deleteResolvido,
  findByIdForUsuario,
  listByUsuario,
  toDTO,
  updateResolvido,
  upsertResolvido,
  type PuzzleResolvidoRow,
} from '../../../src/lib/puzzlesResolvidos';

function row(overrides: Partial<PuzzleResolvidoRow> = {}): PuzzleResolvidoRow {
  return {
    id: 1,
    jogador_id: 'jogador-1',
    puzzle_id: 'puzzle-1',
    fase: 1,
    rating: 1300,
    tentativas: 2,
    acertou: true,
    anotacao: 'Boa solução',
    resolvido_em: new Date('2026-06-09T10:00:00.000Z'),
    atualizado_em: new Date('2026-06-09T11:00:00.000Z'),
    ...overrides,
  };
}

describe('repositório de puzzles resolvidos', () => {
  beforeEach(() => {
    queryMock.mockReset();
    findJogadorMock.mockReset();
  });

  test('converte linha em DTO', () => {
    expect(toDTO(row())).toMatchObject({
      id: 1, puzzleId: 'puzzle-1', resolvidoEm: '2026-06-09T10:00:00.000Z', atualizadoEm: '2026-06-09T11:00:00.000Z',
    });
  });

  test('lista histórico quando jogador existe e retorna vazio quando não existe', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    expect(await listByUsuario('usuario-x')).toEqual([]);
    expect(await listByUsuario('usuario-1')).toEqual([row()]);
  });

  test('busca registro próprio existente, inexistente e usuário sem jogador', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1').mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await findByIdForUsuario(1, 'usuario-x')).toBeNull();
    expect(await findByIdForUsuario(1, 'usuario-1')).toEqual(row());
    expect(await findByIdForUsuario(2, 'usuario-1')).toBeNull();
  });

  test('upsert usa defaults e devolve nulo quando usuário não tem jogador', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    expect(await upsertResolvido({ usuarioId: 'usuario-x', puzzleId: 'p', fase: 1 })).toBeNull();
    expect(await upsertResolvido({ usuarioId: 'usuario-1', puzzleId: 'puzzle-1', fase: 1 })).toEqual(row());
    expect(queryMock.mock.calls[0][1]).toEqual(['jogador-1', 'puzzle-1', 1, null, 1, true, null]);
  });

  test('upsert preserva opcionais enviados', async () => {
    findJogadorMock.mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row({ acertou: false })] });
    await upsertResolvido({ usuarioId: 'usuario-1', puzzleId: 'puzzle-1', fase: 2, rating: 1600, tentativas: 3, acertou: false, anotacao: 'Rever' });
    expect(queryMock.mock.calls[0][1]).toEqual(['jogador-1', 'puzzle-1', 2, 1600, 3, false, 'Rever']);
  });

  test('atualiza todos os campos, delega busca sem campos e cobre inexistência', async () => {
    findJogadorMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('jogador-1')
      .mockResolvedValueOnce('jogador-1')
      .mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await updateResolvido(1, 'usuario-x', { anotacao: 'x' })).toBeNull();
    expect(await updateResolvido(1, 'usuario-1', { anotacao: null, acertou: false, tentativas: 4 })).toEqual(row());
    expect(queryMock.mock.calls[0][1]).toEqual([null, false, 4, 1, 'jogador-1']);
    expect(await updateResolvido(1, 'usuario-1', {})).toEqual(row());
    expect(await updateResolvido(2, 'usuario-1', { anotacao: 'x' })).toBeNull();
  });

  test('exclusão diferencia usuário sem jogador, sucesso e ausência', async () => {
    findJogadorMock.mockResolvedValueOnce(null).mockResolvedValueOnce('jogador-1').mockResolvedValueOnce('jogador-1');
    queryMock.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: 0 });
    expect(await deleteResolvido(1, 'usuario-x')).toBe(false);
    expect(await deleteResolvido(1, 'usuario-1')).toBe(true);
    expect(await deleteResolvido(2, 'usuario-1')).toBe(false);
  });
});
