import { describe, test, expect } from 'vitest';
import {
  validateComentarioTexto,
  validatePuzzleLichessId,
} from '../../../src/lib/validation';

describe('🧪 Testes Unitários - Validação de Comentários (UC-16/18)', () => {

  // ─── validateComentarioTexto ──────────────────────────────────────────

  describe('validateComentarioTexto', () => {
    test('Deve aceitar comentário simples', () => {
      expect(validateComentarioTexto('Bom puzzle, gostei!')).toBeNull();
    });

    test('Deve aceitar comentário com 1000 caracteres exatos', () => {
      expect(validateComentarioTexto('a'.repeat(1000))).toBeNull();
    });

    test('Deve recusar comentário vazio', () => {
      expect(validateComentarioTexto('')).toBe(
        'O comentário não pode estar vazio.'
      );
    });

    test('Deve recusar comentário com apenas espaços em branco', () => {
      expect(validateComentarioTexto('   ')).toBe(
        'O comentário não pode estar vazio.'
      );
    });

    test('Deve recusar comentário com mais de 1000 caracteres', () => {
      expect(validateComentarioTexto('a'.repeat(1001))).toBe(
        'O comentário deve ter no máximo 1000 caracteres.'
      );
    });

    test('Deve recusar tipos não-string', () => {
      expect(validateComentarioTexto(123)).toBe(
        'Texto do comentário inválido.'
      );
      expect(validateComentarioTexto(null)).toBe(
        'Texto do comentário inválido.'
      );
      expect(validateComentarioTexto(undefined)).toBe(
        'Texto do comentário inválido.'
      );
    });
  });

  // ─── validatePuzzleLichessId ──────────────────────────────────────────

  describe('validatePuzzleLichessId', () => {
    test('Deve aceitar ID curto válido', () => {
      expect(validatePuzzleLichessId('00008')).toBeNull();
    });

    test('Deve aceitar "daily" como identificador especial', () => {
      expect(validatePuzzleLichessId('daily')).toBeNull();
    });

    test('Deve recusar string vazia', () => {
      expect(validatePuzzleLichessId('')).toBe(
        'ID do puzzle deve ter de 1 a 40 caracteres.'
      );
    });

    test('Deve recusar ID com mais de 40 caracteres', () => {
      expect(validatePuzzleLichessId('a'.repeat(41))).toBe(
        'ID do puzzle deve ter de 1 a 40 caracteres.'
      );
    });

    test('Deve recusar tipos não-string', () => {
      expect(validatePuzzleLichessId(null)).toBe('ID do puzzle inválido.');
      expect(validatePuzzleLichessId(42)).toBe('ID do puzzle inválido.');
    });
  });

});
