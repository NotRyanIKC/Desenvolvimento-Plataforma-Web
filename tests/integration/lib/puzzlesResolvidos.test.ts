/**
 * Testes de integração — CRUD de Puzzles Resolvidos
 * (Histórico do jogador, tela /routes/puzzles/history).
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import * as prLib from '../../../src/lib/puzzlesResolvidos';
import * as usersLib from '../../../src/lib/users';
import {
  closeTestPool, hasTestDb, resetDatabase, testPool,
} from '../helpers/testDb';

async function criarUsuario(suffix: string) {
  return usersLib.createUser({
    nome: 'Renan', sobrenome: 'Leite', username: `pr_${suffix}`,
    email: `pr-${suffix}@cesuchess.test`, senha: 'senhaForte123',
  });
}

describe.skipIf(!hasTestDb)('🔄 Integração — CRUD Puzzles Resolvidos', () => {
  beforeAll(async () => { if (testPool) await resetDatabase(); });
  beforeEach(async () => { if (testPool) await resetDatabase(); });
  afterAll(async () => { await closeTestPool(); });

  test('upsertResolvido cria primeira vez e ACUMULA tentativas no upsert', async () => {
    const { usuario } = await criarUsuario('upsert');

    const primeiro = await prLib.upsertResolvido({
      usuarioId: usuario.id,
      puzzleId: '00008', fase: 1, rating: 1500, tentativas: 1, acertou: true,
    });
    expect(primeiro?.tentativas).toBe(1);

    const segundo = await prLib.upsertResolvido({
      usuarioId: usuario.id,
      puzzleId: '00008', fase: 1, rating: 1500, tentativas: 3, acertou: false,
    });
    expect(segundo?.tentativas).toBe(4);
    expect(segundo?.acertou).toBe(false);
    expect(segundo?.id).toBe(primeiro?.id);
  });

  test('listByUsuario só devolve do dono', async () => {
    const { usuario: a } = await criarUsuario('a');
    const { usuario: b } = await criarUsuario('b');

    await prLib.upsertResolvido({
      usuarioId: a.id, puzzleId: 'p1', fase: 1, tentativas: 1, acertou: true,
    });
    await prLib.upsertResolvido({
      usuarioId: b.id, puzzleId: 'p1', fase: 1, tentativas: 1, acertou: true,
    });

    const listaA = await prLib.listByUsuario(a.id);
    expect(listaA).toHaveLength(1);
  });

  test('updateResolvido só atualiza se for do usuário', async () => {
    const { usuario: a } = await criarUsuario('a');
    const { usuario: b } = await criarUsuario('b');

    const r = await prLib.upsertResolvido({
      usuarioId: a.id, puzzleId: 'p1', fase: 1, tentativas: 1, acertou: true,
    });
    expect(r).not.toBeNull();

    const fail = await prLib.updateResolvido(r!.id, b.id, { anotacao: 'hacker' });
    expect(fail).toBeNull();

    const ok = await prLib.updateResolvido(r!.id, a.id, { anotacao: 'minha nota' });
    expect(ok?.anotacao).toBe('minha nota');
  });

  test('deleteResolvido só apaga se for do usuário', async () => {
    const { usuario: a } = await criarUsuario('a');
    const { usuario: b } = await criarUsuario('b');

    const r = await prLib.upsertResolvido({
      usuarioId: a.id, puzzleId: 'pd', fase: 1, tentativas: 1, acertou: true,
    });
    expect(r).not.toBeNull();

    expect(await prLib.deleteResolvido(r!.id, b.id)).toBe(false);
    expect(await prLib.deleteResolvido(r!.id, a.id)).toBe(true);
    expect(await prLib.deleteResolvido(r!.id, a.id)).toBe(false);
  });
});
