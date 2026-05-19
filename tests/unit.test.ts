import { describe, test, expect } from 'vitest';
import {
  validateEmail,
  validateSenha,
  validateNome,
  validateSobrenome,
  validateUsername,
  firstError,
} from '../src/lib/validation';

describe('🧪 Testes Unitários - Validação de Credenciais (Camada lib)', () => {

  // ─── validateEmail ────────────────────────────────────────────────────────

  describe('validateEmail', () => {
    test('Deve aceitar um formato de e-mail válido', () => {
      expect(validateEmail('player@cesuchess.com')).toBeNull();
    });

    test('Deve recusar e-mail sem caractere "@"', () => {
      expect(validateEmail('magnuscarlsen.com')).toBe('Formato de e-mail inválido.');
    });
  });

  // ─── validateSenha ───────────────────────────────────────────────────────

  describe('validateSenha', () => {
    test('Deve aprovar senhas seguras com 8 ou mais caracteres', () => {
      expect(validateSenha('e4e5Gf3Nc6')).toBeNull();
    });

    test('Deve recusar senhas curtas com menos de 8 caracteres', () => {
      expect(validateSenha('12345')).toBe('Senha deve ter no mínimo 8 caracteres.');
    });
  });

  // ─── validateNome ────────────────────────────────────────────────────────

  describe('validateNome', () => {
    test('Deve aceitar nome válido', () => {
      expect(validateNome('Magnus')).toBeNull();
    });

    test('Deve recusar nome com menos de 2 caracteres', () => {
      expect(validateNome('A')).toBe('Nome deve ter no mínimo 2 caracteres.');
    });

    test('Deve recusar nome com mais de 80 caracteres', () => {
      expect(validateNome('A'.repeat(81))).toBe('Nome deve ter no máximo 80 caracteres.');
    });
  });

  // ─── validateSobrenome ───────────────────────────────────────────────────

  describe('validateSobrenome', () => {
    test('Deve aceitar sobrenome válido', () => {
      expect(validateSobrenome('Carlsen')).toBeNull();
    });

    test('Deve recusar sobrenome com menos de 2 caracteres', () => {
      expect(validateSobrenome('C')).toBe('Sobrenome deve ter no mínimo 2 caracteres.');
    });

    test('Deve recusar sobrenome com mais de 80 caracteres', () => {
      expect(validateSobrenome('C'.repeat(81))).toBe('Sobrenome deve ter no máximo 80 caracteres.');
    });
  });

  // ─── validateUsername ────────────────────────────────────────────────────

  describe('validateUsername', () => {
    test('Deve aceitar username válido', () => {
      expect(validateUsername('magnus_99')).toBeNull();
    });

    test('Deve recusar username com menos de 3 caracteres', () => {
      expect(validateUsername('ab')).toBe('Username deve ter 3-40 caracteres (letras, números ou _).');
    });

    test('Deve recusar username com mais de 40 caracteres', () => {
      expect(validateUsername('a'.repeat(41))).toBe('Username deve ter 3-40 caracteres (letras, números ou _).');
    });

    test('Deve recusar username com caracteres especiais', () => {
      expect(validateUsername('magnus@99')).toBe('Username deve ter 3-40 caracteres (letras, números ou _).');
    });
  });

  // ─── firstError ──────────────────────────────────────────────────────────

  describe('firstError', () => {
    test('Deve retornar null quando não há erros', () => {
      expect(firstError(null, null, null)).toBeNull();
    });

    test('Deve retornar o primeiro erro encontrado', () => {
      expect(firstError(null, 'Erro B', 'Erro C')).toBe('Erro B');
    });
  });

});