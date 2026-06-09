import { beforeEach, describe, expect, test, vi } from 'vitest';

const { queryMock, connectMock, clientQueryMock, releaseMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  connectMock: vi.fn(),
  clientQueryMock: vi.fn(),
  releaseMock: vi.fn(),
}));

vi.mock('../../../src/lib/db', () => ({
  query: queryMock,
  pool: { connect: connectMock },
}));

import {
  createUser,
  deleteUser,
  findByEmailOrUsername,
  findById,
  findJogadorIdByUsuarioId,
  listAllUsers,
  toAdminUser,
  toPublicUser,
  updateUser,
  type JogadorRow,
  type UsuarioRow,
} from '../../../src/lib/users';

function usuario(overrides: Partial<UsuarioRow> = {}): UsuarioRow {
  return {
    id: 'usuario-1', nome: 'Victor', sobrenome: 'Sampaio', username: 'victor', email: 'victor@example.com',
    senha_hash: '$2a$10$hash', ativo: true,
    criado_em: new Date('2026-06-09T10:00:00.000Z'), atualizado_em: new Date('2026-06-09T11:00:00.000Z'),
    ...overrides,
  };
}

function jogador(overrides: Partial<JogadorRow> = {}): JogadorRow {
  return {
    id: 'jogador-1', usuario_id: 'usuario-1', rating: 1200, partidas_jogadas: 0, partidas_vencidas: 0,
    partidas_perdidas: 0, puzzles_resolvidos: 0, serie_dias: 0, ultima_atividade: null,
    criado_em: new Date('2026-06-09T10:00:00.000Z'), ...overrides,
  };
}

describe('repositório de usuários', () => {
  beforeEach(() => {
    queryMock.mockReset();
    connectMock.mockReset();
    clientQueryMock.mockReset();
    releaseMock.mockReset();
    connectMock.mockResolvedValue({ query: clientQueryMock, release: releaseMock });
  });

  test('converte usuário em DTO público e administrativo', () => {
    expect(toPublicUser(usuario())).toEqual({ id: 'usuario-1', nome: 'Victor', sobrenome: 'Sampaio', username: 'victor', email: 'victor@example.com', criadoEm: '2026-06-09T10:00:00.000Z' });
    expect(toAdminUser(usuario({ ativo: false })).ativo).toBe(false);
  });

  test('busca por id e por email ou username', async () => {
    queryMock.mockResolvedValueOnce({ rows: [usuario()] }).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [usuario()] });
    expect(await findById('usuario-1')).toEqual(usuario());
    expect(await findById('usuario-x')).toBeNull();
    expect(await findByEmailOrUsername('VICTOR@EXAMPLE.COM')).toEqual(usuario());
    expect(queryMock.mock.calls[2][1]).toEqual(['victor@example.com']);
  });

  test('lista usuários e resolve jogador existente ou inexistente', async () => {
    queryMock.mockResolvedValueOnce({ rows: [usuario()] }).mockResolvedValueOnce({ rows: [{ id: 'jogador-1' }] }).mockResolvedValueOnce({ rows: [] });
    expect(await listAllUsers()).toEqual([usuario()]);
    expect(await findJogadorIdByUsuarioId('usuario-1')).toBe('jogador-1');
    expect(await findJogadorIdByUsuarioId('usuario-x')).toBeNull();
  });

  test('cria usuário e jogador em transação com normalização', async () => {
    clientQueryMock
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [usuario()] })
      .mockResolvedValueOnce({ rows: [jogador()] })
      .mockResolvedValueOnce({});
    expect(await createUser({ nome: '  Victor  ', sobrenome: '  Sampaio  ', username: 'ADMIN', email: 'ADMIN@EXAMPLE.COM', senha: 'senhaForte123' })).toEqual({ usuario: usuario(), jogador: jogador() });
    expect(clientQueryMock.mock.calls[1][1].slice(0, 4)).toEqual(['Victor', 'Sampaio', 'admin', 'admin@example.com']);
    expect(clientQueryMock.mock.calls[0][0]).toBe('BEGIN');
    expect(clientQueryMock.mock.calls[3][0]).toBe('COMMIT');
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  test('faz rollback e libera conexão quando criação falha', async () => {
    clientQueryMock.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('falha')).mockResolvedValueOnce({});
    await expect(createUser({ nome: 'Victor', sobrenome: 'Sampaio', username: 'victor', email: 'v@example.com', senha: 'senhaForte123' })).rejects.toThrow('falha');
    expect(clientQueryMock.mock.calls[2][0]).toBe('ROLLBACK');
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  test('atualiza todos os campos e gera hash para nova senha', async () => {
    queryMock.mockResolvedValueOnce({ rows: [usuario({ nome: 'Novo' })] });
    const result = await updateUser('usuario-1', { nome: '  Novo  ', sobrenome: '  Nome  ', email: 'NOVO@EXAMPLE.COM', senha: 'novaSenha123' });
    expect(result?.nome).toBe('Novo');
    expect(queryMock.mock.calls[0][1][0]).toBe('Novo');
    expect(queryMock.mock.calls[0][1][1]).toBe('Nome');
    expect(queryMock.mock.calls[0][1][2]).toBe('novo@example.com');
    expect(String(queryMock.mock.calls[0][1][3])).toMatch(/^\$2[aby]\$10\$/);
  });

  test('sem alterações delega para busca e update inexistente devolve nulo', async () => {
    queryMock.mockResolvedValueOnce({ rows: [usuario()] }).mockResolvedValueOnce({ rows: [] });
    expect(await updateUser('usuario-1', {})).toEqual(usuario());
    expect(await updateUser('usuario-x', { nome: 'Novo' })).toBeNull();
  });

  test('exclusão informa se removeu uma linha', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValueOnce({ rowCount: 0 });
    expect(await deleteUser('usuario-1')).toBe(true);
    expect(await deleteUser('usuario-x')).toBe(false);
  });
});
