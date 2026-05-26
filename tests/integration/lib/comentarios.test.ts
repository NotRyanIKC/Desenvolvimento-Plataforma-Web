/**
 * Testes de integração — CRUD de Comentários (UC-16/17/18/19).
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import * as comentariosLib from '../../../src/lib/comentarios';
import * as usersLib from '../../../src/lib/users';
import {
  closeTestPool, hasTestDb, resetDatabase, testPool,
} from '../helpers/testDb';

async function criarUsuario(suffix: string) {
  return usersLib.createUser({
    nome: 'Renan',
    sobrenome: 'Leite',
    username: `user_${suffix}`,
    email: `${suffix}@cesuchess.test`,
    senha: 'senhaForte123',
  });
}

describe.skipIf(!hasTestDb)('🔄 Integração — CRUD de Comentários', () => {
  beforeAll(async () => { if (testPool) await resetDatabase(); });
  beforeEach(async () => { if (testPool) await resetDatabase(); });
  afterAll(async () => { await closeTestPool(); });

  test('createComentario insere e retorna DTO com autor preenchido', async () => {
    const { usuario } = await criarUsuario('create');
    const c = await comentariosLib.createComentario({
      usuarioId: usuario.id,
      puzzleLichessId: '00008',
      texto: 'Achei a tática do garfo.',
    });

    expect(c.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(c.puzzleLichessId).toBe('00008');
    expect(c.texto).toBe('Achei a tática do garfo.');
    expect(c.autor.username).toBe('user_create');
    expect(c.pertenceAoLeitor).toBe(true);
  });

  test('listByPuzzle marca pertenceAoLeitor=true só para o autor', async () => {
    const { usuario: alice } = await criarUsuario('alice');
    const { usuario: bob } = await criarUsuario('bob');

    await comentariosLib.createComentario({
      usuarioId: alice.id, puzzleLichessId: 'p1', texto: 'oi sou a alice',
    });
    await comentariosLib.createComentario({
      usuarioId: bob.id, puzzleLichessId: 'p1', texto: 'oi sou o bob',
    });

    const lidoPorAlice = await comentariosLib.listByPuzzle('p1', alice.id);
    expect(lidoPorAlice).toHaveLength(2);
    expect(lidoPorAlice.find(c => c.autor.username === 'user_alice')?.pertenceAoLeitor).toBe(true);
    expect(lidoPorAlice.find(c => c.autor.username === 'user_bob')?.pertenceAoLeitor).toBe(false);
  });

  test('listByPuzzle anônimo (UC-17): tudo pertenceAoLeitor=false', async () => {
    const { usuario } = await criarUsuario('anon');
    await comentariosLib.createComentario({
      usuarioId: usuario.id, puzzleLichessId: 'p2', texto: 'visivel pra qq um',
    });

    const anon = await comentariosLib.listByPuzzle('p2', null);
    expect(anon).toHaveLength(1);
    expect(anon[0].pertenceAoLeitor).toBe(false);
  });

  test('updateComentario só permite editar comentário próprio', async () => {
    const { usuario: alice } = await criarUsuario('alice');
    const { usuario: bob } = await criarUsuario('bob');

    const c = await comentariosLib.createComentario({
      usuarioId: alice.id, puzzleLichessId: 'p3', texto: 'original',
    });

    const editada = await comentariosLib.updateComentario(c.id, alice.id, 'editado');
    expect(editada?.texto).toBe('editado');

    const tentBob = await comentariosLib.updateComentario(c.id, bob.id, 'bob hackeou');
    expect(tentBob).toBeNull();
  });

  test('deleteComentario só permite excluir comentário próprio', async () => {
    const { usuario: alice } = await criarUsuario('alice');
    const { usuario: bob } = await criarUsuario('bob');

    const c = await comentariosLib.createComentario({
      usuarioId: alice.id, puzzleLichessId: 'p4', texto: 'meu comentário',
    });

    expect(await comentariosLib.deleteComentario(c.id, bob.id)).toBe(false);
    expect(await comentariosLib.deleteComentario(c.id, alice.id)).toBe(true);
    expect(await comentariosLib.deleteComentario(c.id, alice.id)).toBe(false);
  });
});
