import { beforeEach, describe, expect, test, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('../../../src/lib/db', () => ({ query: queryMock }));

import {
  createTema,
  deleteTema,
  findTemaById,
  listActiveTemas,
  listAllTemas,
  toTemaDTO,
  updateTema,
  type TemaRow,
} from '../../../src/lib/temas';

function row(overrides: Partial<TemaRow> = {}): TemaRow {
  return {
    id: 'tema-1',
    criado_por_id: 'admin-1',
    nome: 'Garfo',
    descricao: 'Ataque duplo',
    ativo: true,
    criado_em: new Date('2026-06-09T10:00:00.000Z'),
    atualizado_em: new Date('2026-06-09T11:00:00.000Z'),
    puzzles_associados: 2,
    ...overrides,
  };
}

describe('repositório de temas', () => {
  beforeEach(() => queryMock.mockReset());

  test('converte linha em DTO e aplica zero quando não há contagem', () => {
    expect(toTemaDTO(row({ puzzles_associados: undefined }))).toMatchObject({
      id: 'tema-1', nome: 'Garfo', puzzlesAssociados: 0,
      criadoEm: '2026-06-09T10:00:00.000Z', atualizadoEm: '2026-06-09T11:00:00.000Z',
    });
  });

  test('cria tema com trim e valores padrão', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row({ nome: 'Garfo', descricao: null, puzzles_associados: 0 })] });
    await createTema({ nome: '  Garfo  ', descricao: ' ' }, 'admin-1');
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO tema'), ['admin-1', 'Garfo', null, true]);
  });

  test('cria tema inativo com descrição preenchida', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row({ ativo: false })] });
    await createTema({ nome: 'Garfo', descricao: '  Ataque duplo  ', ativo: false }, 'admin-1');
    expect(queryMock.mock.calls[0][1]).toEqual(['admin-1', 'Garfo', 'Ataque duplo', false]);
  });

  test('lista todos os temas e somente os ativos', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [row()] });
    expect(await listAllTemas()).toEqual([row()]);
    expect(await listActiveTemas()).toEqual([row()]);
    expect(queryMock.mock.calls[1][0]).toContain('WHERE t.ativo = TRUE');
  });

  test('busca tema existente ou inexistente', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await findTemaById('tema-1')).toEqual(row());
    expect(await findTemaById('tema-x')).toBeNull();
  });

  test('atualiza campos parciais e recarrega a linha completa', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'tema-1' }] }).mockResolvedValueOnce({ rows: [row({ nome: 'Cravada', descricao: null, ativo: false })] });
    const result = await updateTema('tema-1', { nome: '  Cravada  ', descricao: ' ', ativo: false });
    expect(result).toMatchObject({ nome: 'Cravada', descricao: null, ativo: false });
    expect(queryMock.mock.calls[0][1]).toEqual(['Cravada', null, false, 'tema-1']);
  });

  test('sem alterações delega para busca', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    expect(await updateTema('tema-1', {})).toEqual(row());
  });

  test('atualização inexistente devolve nulo', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    expect(await updateTema('tema-x', { nome: 'Outro' })).toBeNull();
  });

  test('exclusão diferencia inexistente, em uso, removido e corrida de exclusão', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [row({ puzzles_associados: 1 })] })
      .mockResolvedValueOnce({ rows: [row({ puzzles_associados: 0 })] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rows: [row({ puzzles_associados: 0 })] })
      .mockResolvedValueOnce({ rowCount: 0 });
    expect(await deleteTema('tema-x')).toBe('not_found');
    expect(await deleteTema('tema-uso')).toBe('in_use');
    expect(await deleteTema('tema-ok')).toBe('deleted');
    expect(await deleteTema('tema-race')).toBe('not_found');
  });
});
