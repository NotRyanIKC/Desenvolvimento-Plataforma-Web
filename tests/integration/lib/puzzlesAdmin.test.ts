/**
 * Testes de integração — CRUD administrativo de puzzles (UC-20..23).
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import * as puzzlesLib from '../../../src/lib/puzzles';
import * as usersLib from '../../../src/lib/users';
import {
  closeTestPool, hasTestDb, promoteToAdmin, resetDatabase, testPool,
} from '../helpers/testDb';

async function criarAdmin() {
  const { usuario } = await usersLib.createUser({
    nome: 'Admin', sobrenome: 'Test', username: 'admin_test',
    email: 'admin@cesuchess.test', senha: 'senhaForte123',
  });
  const adminId = await promoteToAdmin(usuario.id);
  return { usuarioId: usuario.id, adminId };
}

describe.skipIf(!hasTestDb)('🔄 Integração — CRUD admin: Puzzle (lib/puzzles)', () => {
  beforeAll(async () => { if (testPool) await resetDatabase(); });
  beforeEach(async () => { if (testPool) await resetDatabase(); });
  afterAll(async () => { await closeTestPool(); });

  test('createPuzzle insere com defaults aplicados', async () => {
    const { adminId } = await criarAdmin();
    const row = await puzzlesLib.createPuzzle({
      fen: 'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25',
      solucao: ['e6e7', 'b2b1'],
      fase: 1,
      lichessId: 'unq001',
    }, adminId);
    expect(row.rating).toBe(1200);
    expect(row.ativo).toBe(true);
    expect(row.lichess_id).toBe('unq001');
  });

  test('createPuzzle guarda o nome (e aceita ausência dele)', async () => {
    const { adminId } = await criarAdmin();
    const comNome = await puzzlesLib.createPuzzle({
      nome: '  Garfo da vitória  ',
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 1', solucao: ['a1a2'], fase: 1, lichessId: 'nome1',
    }, adminId);
    expect(comNome.nome).toBe('Garfo da vitória'); // trimado

    const semNome = await puzzlesLib.createPuzzle({
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 2', solucao: ['a1a3'], fase: 1, lichessId: 'nome2',
    }, adminId);
    expect(semNome.nome).toBeNull();
  });

  test('listPuzzlesAtivos devolve só os ativos', async () => {
    const { adminId } = await criarAdmin();
    const ativo = await puzzlesLib.createPuzzle({
      nome: 'Ativo', fen: '8/k7/8/8/8/8/7K/8 w - - 0 1', solucao: ['a1a2'], fase: 1, lichessId: 'at',
    }, adminId);
    const inativo = await puzzlesLib.createPuzzle({
      nome: 'Inativo', fen: '8/k7/8/8/8/8/7K/8 w - - 0 2', solucao: ['a1a3'], fase: 1, lichessId: 'in',
    }, adminId);
    await puzzlesLib.updatePuzzle(inativo.id, { ativo: false });

    const lista = await puzzlesLib.listPuzzlesAtivos();
    const ids = lista.map((p) => p.id);
    expect(ids).toContain(ativo.id);
    expect(ids).not.toContain(inativo.id);
  });

  test('listAllPuzzles devolve em ordem decrescente de criação', async () => {
    const { adminId } = await criarAdmin();
    await puzzlesLib.createPuzzle({
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 1', solucao: ['a1a2'], fase: 1, lichessId: 'a',
    }, adminId);
    await puzzlesLib.createPuzzle({
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 2', solucao: ['a1a3'], fase: 1, lichessId: 'b',
    }, adminId);
    const lista = await puzzlesLib.listAllPuzzles();
    expect(lista).toHaveLength(2);
    expect(lista[0].lichess_id).toBe('b');
  });

  test('updatePuzzle atualiza campos parciais', async () => {
    const { adminId } = await criarAdmin();
    const row = await puzzlesLib.createPuzzle({
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 1', solucao: ['a1a2'], fase: 1, lichessId: 'edit',
    }, adminId);
    const upd = await puzzlesLib.updatePuzzle(row.id, { rating: 2000, ativo: false });
    expect(upd?.rating).toBe(2000);
    expect(upd?.ativo).toBe(false);
    expect(upd?.fen).toBe(row.fen);
  });

  test('deletePuzzle remove a linha', async () => {
    const { adminId } = await criarAdmin();
    const row = await puzzlesLib.createPuzzle({
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 1', solucao: ['a1a2'], fase: 1, lichessId: 'del',
    }, adminId);
    expect(await puzzlesLib.deletePuzzle(row.id)).toBe(true);
    expect(await puzzlesLib.findPuzzleById(row.id)).toBeNull();
  });

  test('deletePuzzle devolve false para id inexistente', async () => {
    expect(await puzzlesLib.deletePuzzle('00000000-0000-0000-0000-000000000000')).toBe(false);
  });

  test('updatePuzzle sem campos devolve a linha inalterada', async () => {
    const { adminId } = await criarAdmin();
    const row = await puzzlesLib.createPuzzle({
      nome: 'Sem mudanças', fen: '8/k7/8/8/8/8/7K/8 w - - 0 1',
      solucao: ['a1a2'], fase: 1, lichessId: 'noop',
    }, adminId);
    const upd = await puzzlesLib.updatePuzzle(row.id, {});
    expect(upd?.id).toBe(row.id);
    expect(upd?.nome).toBe('Sem mudanças');
  });

  test('UNIQUE em lichess_id dispara 23505', async () => {
    const { adminId } = await criarAdmin();
    await puzzlesLib.createPuzzle({
      fen: '8/k7/8/8/8/8/7K/8 w - - 0 1', solucao: ['a1a2'], fase: 1, lichessId: 'dup',
    }, adminId);
    await expect(
      puzzlesLib.createPuzzle({
        fen: '8/k7/8/8/8/8/7K/8 w - - 0 2', solucao: ['a1a3'], fase: 1, lichessId: 'dup',
      }, adminId)
    ).rejects.toMatchObject({ code: '23505' });
  });
});
