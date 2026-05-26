import { describe, test, expect } from 'vitest';
import {
  validateEmail,
  validateSenha,
  validateNome,
  validateSobrenome,
  validateUsername,
  validatePuzzleNome,
  validateFen,
  validateSolucao,
  validateFase,
  validateRating,
  validateBotNome,
  validateNivelDificuldade,
  firstError,
} from '../../../src/lib/validation';

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

  // ─── validatePuzzleNome ──────────────────────────────────────────────────

  describe('validatePuzzleNome', () => {
    test('Deve aceitar nome de puzzle válido', () => {
      expect(validatePuzzleNome('Mate em 2 — sacrifício de dama')).toBeNull();
    });

    test('Deve recusar nome curto, longo ou não-string', () => {
      expect(validatePuzzleNome('A')).toBe('Nome do puzzle deve ter no mínimo 2 caracteres.');
      expect(validatePuzzleNome('A'.repeat(121))).toBe('Nome do puzzle deve ter no máximo 120 caracteres.');
      expect(validatePuzzleNome(undefined)).toBe('Nome do puzzle inválido.');
    });
  });

  // ─── validateFen ─────────────────────────────────────────────────────────

  describe('validateFen', () => {
    test('Deve aceitar um FEN válido', () => {
      expect(validateFen('r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25')).toBeNull();
    });

    test('Deve recusar FEN curto, longo ou não-string', () => {
      expect(validateFen('8/8 w')).toBe('FEN muito curto.');
      expect(validateFen('a'.repeat(101))).toBe('FEN muito longo.');
      expect(validateFen(123)).toBe('FEN inválido.');
    });
  });

  // ─── validateSolucao ─────────────────────────────────────────────────────

  describe('validateSolucao', () => {
    test('Deve aceitar lista de lances UCI', () => {
      expect(validateSolucao(['e2e4', 'e7e5'])).toBeNull();
    });

    test('Deve recusar lista vazia, não-array ou com lance inválido', () => {
      expect(validateSolucao([])).toBe('Solução deve ter ao menos um lance.');
      expect(validateSolucao('e2e4')).toBe('Solução deve ter ao menos um lance.');
      expect(validateSolucao(['e2e4', ''])).toBe(
        'Cada lance da solução deve ser um texto não vazio (UCI).'
      );
      expect(validateSolucao(['e2e4', 42])).toBe(
        'Cada lance da solução deve ser um texto não vazio (UCI).'
      );
    });
  });

  // ─── validateFase ────────────────────────────────────────────────────────

  describe('validateFase', () => {
    test('Deve aceitar inteiro >= 1', () => {
      expect(validateFase(1)).toBeNull();
      expect(validateFase(10)).toBeNull();
    });

    test('Deve recusar zero, negativo, não-inteiro ou não-numérico', () => {
      expect(validateFase(0)).toBe('Fase deve ser um inteiro maior ou igual a 1.');
      expect(validateFase(-3)).toBe('Fase deve ser um inteiro maior ou igual a 1.');
      expect(validateFase(1.5)).toBe('Fase deve ser um inteiro maior ou igual a 1.');
      expect(validateFase('1')).toBe('Fase deve ser um inteiro maior ou igual a 1.');
    });
  });

  // ─── validateRating ──────────────────────────────────────────────────────

  describe('validateRating', () => {
    test('Deve aceitar rating dentro de 0-4000', () => {
      expect(validateRating(1200)).toBeNull();
      expect(validateRating(0)).toBeNull();
      expect(validateRating(4000)).toBeNull();
    });

    test('Deve recusar fora do intervalo, não-finito ou não-numérico', () => {
      expect(validateRating(-1)).toBe('Rating deve estar entre 0 e 4000.');
      expect(validateRating(4001)).toBe('Rating deve estar entre 0 e 4000.');
      expect(validateRating(NaN)).toBe('Rating inválido.');
      expect(validateRating('1200')).toBe('Rating inválido.');
    });
  });

  // ─── validateBotNome ─────────────────────────────────────────────────────

  describe('validateBotNome', () => {
    test('Deve aceitar nome de bot válido', () => {
      expect(validateBotNome('Maia 1')).toBeNull();
    });

    test('Deve recusar nome curto, longo ou não-string', () => {
      expect(validateBotNome('A')).toBe('Nome do bot deve ter no mínimo 2 caracteres.');
      expect(validateBotNome('A'.repeat(61))).toBe('Nome do bot deve ter no máximo 60 caracteres.');
      expect(validateBotNome(null)).toBe('Nome do bot inválido.');
    });
  });

  // ─── validateNivelDificuldade ────────────────────────────────────────────

  describe('validateNivelDificuldade', () => {
    test('Deve aceitar os níveis válidos', () => {
      expect(validateNivelDificuldade('facil')).toBeNull();
      expect(validateNivelDificuldade('medio')).toBeNull();
      expect(validateNivelDificuldade('dificil')).toBeNull();
    });

    test('Deve recusar nível desconhecido ou não-string', () => {
      expect(validateNivelDificuldade('impossivel')).toBe(
        "Nível deve ser 'facil', 'medio' ou 'dificil'."
      );
      expect(validateNivelDificuldade(2)).toBe(
        "Nível deve ser 'facil', 'medio' ou 'dificil'."
      );
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
