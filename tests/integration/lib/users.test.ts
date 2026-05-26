/**
 * Testes de integração — repositório de usuários (src/lib/users.ts).
 * DATABASE_URL já aponta pro banco de teste via tests/setup.ts.
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import * as usersLib from '../../../src/lib/users';
import {
  closeTestPool,
  hasTestDb,
  resetDatabase,
  testPool,
} from '../helpers/testDb';

describe.skipIf(!hasTestDb)(
  '🔄 Integração — Repositório de Usuários (lib/users)',
  () => {
    beforeAll(async () => {
      if (testPool) await resetDatabase();
    });
    beforeEach(async () => {
      if (testPool) await resetDatabase();
    });
    afterAll(async () => {
      await closeTestPool();
    });

    test('createUser cria usuario + jogador na mesma transação', async () => {
      const { usuario, jogador } = await usersLib.createUser({
        nome: 'Renan',
        sobrenome: 'Leite',
        username: 'renan_test',
        email: 'renan@cesuchess.test',
        senha: 'senhaForte123',
      });

      expect(usuario.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(jogador.usuario_id).toBe(usuario.id);
      expect(usuario.senha_hash).not.toBe('senhaForte123');
      expect(usuario.senha_hash).toMatch(/^\$2[aby]\$10\$/);
    });

    test('findByEmailOrUsername encontra por email OU username', async () => {
      await usersLib.createUser({
        nome: 'Magnus', sobrenome: 'Carlsen', username: 'magnus',
        email: 'magnus@cesuchess.test', senha: 'senhaForte123',
      });

      const porEmail = await usersLib.findByEmailOrUsername('magnus@cesuchess.test');
      const porUsername = await usersLib.findByEmailOrUsername('magnus');

      expect(porEmail?.username).toBe('magnus');
      expect(porUsername?.email).toBe('magnus@cesuchess.test');
    });

    test('createUser duplicado dispara erro 23505 (UNIQUE)', async () => {
      await usersLib.createUser({
        nome: 'A', sobrenome: 'B', username: 'duplicado',
        email: 'dup@cesuchess.test', senha: 'senhaForte123',
      });

      await expect(
        usersLib.createUser({
          nome: 'C', sobrenome: 'D', username: 'duplicado',
          email: 'outro@cesuchess.test', senha: 'senhaForte123',
        })
      ).rejects.toMatchObject({ code: '23505' });
    });

    test('updateUser altera dados parcialmente', async () => {
      const { usuario } = await usersLib.createUser({
        nome: 'Antes', sobrenome: 'X', username: 'edit_me',
        email: 'edit@cesuchess.test', senha: 'senhaForte123',
      });

      const atualizado = await usersLib.updateUser(usuario.id, { nome: 'Depois' });
      expect(atualizado?.nome).toBe('Depois');
      expect(atualizado?.sobrenome).toBe('X');
    });

    test('deleteUser cascata para jogador', async () => {
      const { usuario, jogador } = await usersLib.createUser({
        nome: 'R', sobrenome: 'L', username: 'cascata',
        email: 'cascata@cesuchess.test', senha: 'senhaForte123',
      });

      await usersLib.deleteUser(usuario.id);

      const r = await testPool!.query('SELECT id FROM jogador WHERE id = $1', [jogador.id]);
      expect(r.rowCount).toBe(0);
    });

    test('findJogadorIdByUsuarioId resolve UUID do jogador', async () => {
      const { usuario, jogador } = await usersLib.createUser({
        nome: 'R', sobrenome: 'L', username: 'resolver',
        email: 'resolver@cesuchess.test', senha: 'senhaForte123',
      });

      const id = await usersLib.findJogadorIdByUsuarioId(usuario.id);
      expect(id).toBe(jogador.id);
    });
  }
);
