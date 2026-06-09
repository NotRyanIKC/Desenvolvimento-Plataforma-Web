import { beforeEach, describe, expect, test, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('../../../src/lib/db', () => ({ query: queryMock }));

import {
  createPuzzle,
  deletePuzzle,
  findPuzzleById,
  listAllPuzzles,
  listPuzzlesAtivos,
  toPuzzleDTO,
  updatePuzzle,
  type PuzzleRow,
} from '../../../src/lib/puzzles';

function row(overrides: Partial<PuzzleRow> = {}): PuzzleRow {
  return {
    id: 'puzzle-1',
    adicionado_por_id: 'admin-1',
    lichess_id: 'lichess-1',
    nome: 'Mate em um',
    fen: '7k/5Q2/7K/8/8/8/8/8 b - - 0 1',
    solucao: ['f7g7'],
    rating: 1200,
    temas: ['mate'],
    fase: 1,
    ativo: true,
    criado_em: new Date('2026-06-09T10:00:00.000Z'),
    ...overrides,
  };
}

describe('repositório de puzzles', () => {
  beforeEach(() => queryMock.mockReset());

  test('converte linha em DTO e aplica lista vazia para temas nulos', () => {
    expect(toPuzzleDTO(row({ temas: null }))).toMatchObject({
      id: 'puzzle-1', lichessId: 'lichess-1', temas: [], criadoEm: '2026-06-09T10:00:00.000Z',
    });
  });

  test('cria puzzle limpando textos e aplicando opcionais nulos', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    await createPuzzle({ nome: '  Mate em um  ', fen: '  fen de teste  ', solucao: ['a1a2'], fase: 1 }, 'admin-1');
    expect(queryMock.mock.calls[0][1]).toEqual(['admin-1', null, 'Mate em um', 'fen de teste', ['a1a2'], null, null, 1]);
  });

  test('cria puzzle preservando opcionais informados', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    await createPuzzle({ fen: ' fen ', solucao: ['a1a2'], fase: 2, rating: 1700, temas: ['garfo'], lichessId: 'abc' }, 'admin-1');
    expect(queryMock.mock.calls[0][1]).toEqual(['admin-1', 'abc', null, 'fen', ['a1a2'], 1700, ['garfo'], 2]);
  });

  test('lista catálogo completo e público ativo', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [row()] });
    expect(await listAllPuzzles()).toEqual([row()]);
    expect(await listPuzzlesAtivos()).toEqual([row()]);
    expect(queryMock.mock.calls[1][0]).toContain('WHERE ativo = TRUE');
  });

  test('busca puzzle existente ou inexistente', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await findPuzzleById('puzzle-1')).toEqual(row());
    expect(await findPuzzleById('puzzle-x')).toBeNull();
  });

  test('atualiza todos os campos editáveis', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row({ nome: 'Novo' })] });
    const result = await updatePuzzle('puzzle-1', {
      nome: '  Novo  ', fen: '  fen nova  ', solucao: ['b1b2'], fase: 3,
      rating: 1800, temas: null, lichessId: null, ativo: false,
    });
    expect(result?.nome).toBe('Novo');
    expect(queryMock.mock.calls[0][1]).toEqual(['Novo', 'fen nova', ['b1b2'], 3, 1800, null, null, false, 'puzzle-1']);
  });

  test('sem alterações delega para busca e update inexistente devolve nulo', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await updatePuzzle('puzzle-1', {})).toEqual(row());
    expect(await updatePuzzle('puzzle-x', { ativo: false })).toBeNull();
  });

  test('exclusão informa se removeu uma linha', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: null });
    expect(await deletePuzzle('puzzle-1')).toBe(true);
    expect(await deletePuzzle('puzzle-x')).toBe(false);
  });
});
