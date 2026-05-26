import { describe, test, expect } from 'vitest';
import { hashSenha, verificarSenha } from '../../../src/lib/users';

/**
 * Testes unitários para as funções puras de hash de senha (bcryptjs).
 *
 * NÃO tocamos no banco aqui — findById, createUser etc. são cobertos
 * pelos testes de integração em tests/integration/lib/users.test.ts.
 */
describe('🧪 Testes Unitários - Hash de Senha (bcryptjs)', () => {

  describe('hashSenha + verificarSenha (round-trip)', () => {
    test('Deve aceitar a senha original após hash + verify', async () => {
      const senhaOriginal = 'MinhaSenh@Forte123';
      const hash = await hashSenha(senhaOriginal);

      expect(hash).not.toBe(senhaOriginal);
      expect(hash).toMatch(/^\$2[aby]\$10\$/); // bcrypt 10 rounds
      expect(await verificarSenha(senhaOriginal, hash)).toBe(true);
    });

    test('Deve recusar senha errada para o mesmo hash', async () => {
      const hash = await hashSenha('senhaCorreta123');
      expect(await verificarSenha('senhaErrada123', hash)).toBe(false);
    });

    test('Deve recusar string vazia contra hash de senha real', async () => {
      const hash = await hashSenha('algumaCoisa42');
      expect(await verificarSenha('', hash)).toBe(false);
    });
  });

  describe('hashSenha — propriedades do hash', () => {
    test('Dois hashes da MESMA senha devem ser diferentes (salt randômico)', async () => {
      const senha = 'mesmaSenha123';
      const hashA = await hashSenha(senha);
      const hashB = await hashSenha(senha);

      expect(hashA).not.toBe(hashB);
      // mas ambos devem validar a senha original
      expect(await verificarSenha(senha, hashA)).toBe(true);
      expect(await verificarSenha(senha, hashB)).toBe(true);
    });

    test('Hash deve ter formato bcrypt válido (~60 caracteres)', async () => {
      const hash = await hashSenha('qualquerSenha8+');
      expect(hash.length).toBeGreaterThanOrEqual(59);
      expect(hash.length).toBeLessThanOrEqual(61);
    });
  });

  describe('verificarSenha — robustez', () => {
    test('Deve retornar false para hash malformado em vez de explodir', async () => {
      const hashInvalido = 'isso-nao-eh-um-hash-bcrypt';
      // bcrypt.compare retorna false ao invés de lançar
      expect(await verificarSenha('qualquerCoisa', hashInvalido)).toBe(false);
    });
  });

});
