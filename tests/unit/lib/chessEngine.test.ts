import { describe, test, expect } from 'vitest';
import { Chess } from 'chess.js';
import { applyMove } from '../../../src/lib/chessEngine';

describe('🧪 Testes Unitários - Engine de Xadrez (chessEngine.applyMove)', () => {

  // ─── Lance válido ──────────────────────────────────────────────────────

  describe('applyMove — lances legais', () => {
    test('Deve aplicar a abertura "e2 → e4" e retornar nova instância', () => {
      const game = new Chess();
      const next = applyMove(game, 'e2', 'e4');

      expect(next).not.toBeNull();
      // imutabilidade: game original não foi modificado
      expect(game.history()).toHaveLength(0);
      // nova instância contém o lance
      expect(next!.history()).toContain('e4');
    });

    test('Deve aplicar resposta clássica das pretas (e7 → e5) após e4', () => {
      const game = new Chess();
      const apos_e4 = applyMove(game, 'e2', 'e4')!;
      const apos_e5 = applyMove(apos_e4, 'e7', 'e5');

      expect(apos_e5).not.toBeNull();
      expect(apos_e5!.turn()).toBe('w'); // depois de 1.e4 e5 → vez das brancas
    });

    test('Deve promover peão a Dama automaticamente (regra padrão do applyMove)', () => {
      // FEN com peão branco em a7 prestes a promover
      const fen = '8/P7/8/8/8/8/8/4K2k w - - 0 1';
      const game = new Chess(fen);
      const next = applyMove(game, 'a7', 'a8');

      expect(next).not.toBeNull();
      // Verifica que a peça em a8 virou Dama branca
      const piece = next!.get('a8');
      expect(piece).toBeDefined();
      expect(piece!.type).toBe('q');
      expect(piece!.color).toBe('w');
    });
  });

  // ─── Lance ilegal ──────────────────────────────────────────────────────

  describe('applyMove — lances ilegais', () => {
    test('Deve retornar null para lance impossível (e2 → e5, peão pula 3 casas)', () => {
      const game = new Chess();
      const next = applyMove(game, 'e2', 'e5');
      expect(next).toBeNull();
    });

    test('Deve retornar null para lance de casa vazia', () => {
      const game = new Chess();
      const next = applyMove(game, 'e4', 'e5'); // e4 está vazio no início
      expect(next).toBeNull();
    });

    test('Deve retornar null para lance fora do turno (pretas movendo na vez das brancas)', () => {
      const game = new Chess();
      const next = applyMove(game, 'e7', 'e5'); // vez das brancas
      expect(next).toBeNull();
    });

    test('Deve retornar null para casas inexistentes (notação inválida)', () => {
      const game = new Chess();
      // chess.js levanta exceção → applyMove captura no try/catch
      const next = applyMove(game, 'z9', 'k4');
      expect(next).toBeNull();
    });
  });

  // ─── Imutabilidade ─────────────────────────────────────────────────────

  describe('applyMove — imutabilidade', () => {
    test('A instância original NÃO deve ser modificada após applyMove', () => {
      const game = new Chess();
      const fenAntes = game.fen();
      applyMove(game, 'e2', 'e4');
      expect(game.fen()).toBe(fenAntes);
    });
  });

});
