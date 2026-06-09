/**
 * Testes de integração — CRUD administrativo de bots (UC-24..27).
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import * as botsLib from '../../../src/lib/bots';
import * as usersLib from '../../../src/lib/users';
import {
  closeTestPool, hasTestDb, promoteToAdmin, resetDatabase, testPool,
} from '../helpers/testDb';

async function criarAdmin() {
  const { usuario } = await usersLib.createUser({
    nome: 'Admin', sobrenome: 'Bots', username: 'admin_bots',
    email: 'admin.bots@cesuchess.test', senha: 'senhaForte123',
  });
  const adminId = await promoteToAdmin(usuario.id);
  return { usuarioId: usuario.id, adminId };
}

describe.skipIf(!hasTestDb)('🔄 Integração — CRUD admin: Bot (lib/bots)', () => {
  beforeAll(async () => { if (testPool) await resetDatabase(); });
  beforeEach(async () => { if (testPool) await resetDatabase(); });
  afterAll(async () => { await closeTestPool(); });

  test('createBot insere com defaults aplicados', async () => {
    const { adminId } = await criarAdmin();
    const row = await botsLib.createBot({
      nome: 'Maia 1', nivelDificuldade: 'facil',
    }, adminId);
    expect(row.nivel_dificuldade).toBe('facil');
    expect(row.ativo).toBe(true);
  });

  test('listAllBots devolve em ordem decrescente', async () => {
    const { adminId } = await criarAdmin();
    await botsLib.createBot({ nome: 'A', nivelDificuldade: 'facil' }, adminId);
    await botsLib.createBot({ nome: 'B', nivelDificuldade: 'medio' }, adminId);
    const lista = await botsLib.listAllBots();
    expect(lista).toHaveLength(2);
    expect(lista[0].nome).toBe('B');
  });

  test('updateBot altera nivel e descricao', async () => {
    const { adminId } = await criarAdmin();
    const row = await botsLib.createBot({
      nome: 'Edit Bot', nivelDificuldade: 'facil', descricao: 'antes',
    }, adminId);
    const upd = await botsLib.updateBot(row.id, {
      nivelDificuldade: 'dificil',
      descricao: 'depois',
      ativo: false,
    });
    expect(upd?.nivel_dificuldade).toBe('dificil');
    expect(upd?.descricao).toBe('depois');
    expect(upd?.ativo).toBe(false);
  });

  test('deleteBot remove a linha', async () => {
    const { adminId } = await criarAdmin();
    const row = await botsLib.createBot({
      nome: 'Del Bot', nivelDificuldade: 'medio',
    }, adminId);
    expect(await botsLib.deleteBot(row.id)).toBe(true);
    expect(await botsLib.findBotById(row.id)).toBeNull();
  });

  test('listActiveBots omite bots desativados', async () => {
    const { adminId } = await criarAdmin();
    await botsLib.createBot({ nome: 'Ativo', nivelDificuldade: 'facil' }, adminId);
    await botsLib.createBot({ nome: 'Inativo', nivelDificuldade: 'medio', ativo: false }, adminId);
    expect((await botsLib.listActiveBots()).map(({ nome }) => nome)).toEqual(['Ativo']);
  });

  test('persiste parâmetros da estratégia', async () => {
    const { adminId } = await criarAdmin();
    const row = await botsLib.createBot({
      nome: 'Estrategista', nivelDificuldade: 'dificil', parametrosEstrategia: { agressividade: 80 },
    }, adminId);
    expect(row.parametros_estrategia).toEqual({ agressividade: 80 });
    const atualizado = await botsLib.updateBot(row.id, { parametrosEstrategia: { agressividade: 35 } });
    expect(atualizado?.parametros_estrategia).toEqual({ agressividade: 35 });
  });

  test('deleteBot devolve false para id inexistente', async () => {
    expect(await botsLib.deleteBot('00000000-0000-0000-0000-000000000000')).toBe(false);
  });

  test('nome UNIQUE dispara 23505', async () => {
    const { adminId } = await criarAdmin();
    await botsLib.createBot({ nome: 'Único', nivelDificuldade: 'facil' }, adminId);
    await expect(
      botsLib.createBot({ nome: 'Único', nivelDificuldade: 'medio' }, adminId)
    ).rejects.toMatchObject({ code: '23505' });
  });
});
