import { beforeEach, describe, expect, test, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('../../../src/lib/db', () => ({ query: queryMock }));

import {
  createBot,
  deleteBot,
  findBotById,
  listActiveBots,
  listAllBots,
  toBotDTO,
  updateBot,
  type BotRow,
} from '../../../src/lib/bots';

function row(overrides: Partial<BotRow> = {}): BotRow {
  return {
    id: 'bot-1',
    criado_por_id: 'admin-1',
    nome: 'Maia',
    nivel_dificuldade: 'medio',
    descricao: 'Bot de teste',
    parametros_estrategia: { agressividade: 50 },
    ativo: true,
    criado_em: new Date('2026-06-09T10:00:00.000Z'),
    ...overrides,
  };
}

describe('repositório de bots', () => {
  beforeEach(() => queryMock.mockReset());

  test('converte linha do banco em DTO e usa objeto vazio quando não há parâmetros', () => {
    expect(toBotDTO(row({ parametros_estrategia: undefined as never }))).toEqual({
      id: 'bot-1',
      nome: 'Maia',
      nivelDificuldade: 'medio',
      descricao: 'Bot de teste',
      parametrosEstrategia: {},
      ativo: true,
      criadoEm: '2026-06-09T10:00:00.000Z',
    });
  });

  test('cria bot aplicando trim e valores padrão', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    expect(await createBot({ nome: '  Maia  ', nivelDificuldade: 'medio', descricao: '  Teste  ' }, 'admin-1')).toEqual(row());
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO bot'), [
      'admin-1', 'Maia', 'medio', 'Teste', {}, true,
    ]);
  });

  test('cria bot preservando parâmetros, status e descrição nula', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row({ descricao: null, ativo: false })] });
    await createBot({ nome: 'Maia', nivelDificuldade: 'dificil', descricao: ' ', parametrosEstrategia: { defesa: true }, ativo: false }, 'admin-1');
    expect(queryMock.mock.calls[0][1]).toEqual(['admin-1', 'Maia', 'dificil', null, { defesa: true }, false]);
  });

  test('lista todos os bots e somente os ativos', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [row()] });
    expect(await listAllBots()).toEqual([row()]);
    expect(await listActiveBots()).toEqual([row()]);
    expect(queryMock.mock.calls[1][0]).toContain('WHERE ativo = TRUE');
  });

  test('busca bot por id existente ou inexistente', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] }).mockResolvedValueOnce({ rows: [] });
    expect(await findBotById('bot-1')).toEqual(row());
    expect(await findBotById('bot-x')).toBeNull();
  });

  test('atualiza todos os campos editáveis', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row({ nome: 'Novo' })] });
    const result = await updateBot('bot-1', {
      nome: '  Novo  ',
      nivelDificuldade: 'dificil',
      descricao: ' ',
      parametrosEstrategia: { agressividade: 90 },
      ativo: false,
    });
    expect(result?.nome).toBe('Novo');
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('nome = $1, nivel_dificuldade = $2, descricao = $3, parametros_estrategia = $4, ativo = $5'), [
      'Novo', 'dificil', null, { agressividade: 90 }, false, 'bot-1',
    ]);
  });

  test('sem alterações delega para busca por id', async () => {
    queryMock.mockResolvedValueOnce({ rows: [row()] });
    expect(await updateBot('bot-1', {})).toEqual(row());
    expect(queryMock).toHaveBeenCalledWith('SELECT * FROM bot WHERE id = $1', ['bot-1']);
  });

  test('atualização devolve nulo quando id não existe', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    expect(await updateBot('bot-x', { nome: 'Novo' })).toBeNull();
  });

  test('exclusão informa se removeu uma linha', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: 0 });
    expect(await deleteBot('bot-1')).toBe(true);
    expect(await deleteBot('bot-x')).toBe(false);
  });
});
