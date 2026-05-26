import { describe, test, expect } from 'vitest';
import { Chess } from 'chess.js';
import { converterPuzzleLichess } from '../../../src/lib/puzzleLichess';
import type { LichessPuzzleResponse } from '../../../src/services/lichess';

/**
 * Testa a conversão da resposta crua do Lichess (`{ game, puzzle }`) no formato
 * jogável (`{ id, fen, solution, rating, themes }`). O Lichess não manda o FEN:
 * o conversor reproduz o PGN e escolhe a posição em que a solução inteira é legal.
 */
describe('🧪 Testes Unitários - Conversão de Puzzle do Lichess', () => {

  function resposta(over: Partial<LichessPuzzleResponse['puzzle']> & { pgn?: string } = {}): LichessPuzzleResponse {
    const { pgn = 'e4 e5 Nf3 Nc6 Bc4 Bc5', ...puzzle } = over;
    return {
      game: {
        id: 'game01',
        pgn,
        players: [
          { name: 'Brancas', color: 'white' },
          { name: 'Pretas', color: 'black' },
        ],
      },
      puzzle: {
        id: 'tst001',
        rating: 1500,
        plays: 100,
        solution: ['e1g1', 'g8f6'],
        themes: ['opening', 'short'],
        initialPly: 5,
        ...puzzle,
      },
    };
  }

  test('Converte e devolve um FEN em que a solução inteira é legal', () => {
    const out = converterPuzzleLichess(resposta());

    expect(out.id).toBe('tst001');
    expect(out.rating).toBe(1500);
    expect(out.themes).toEqual(['opening', 'short']);
    expect(out.solution).toEqual(['e1g1', 'g8f6']); // passthrough, sem fatiar

    // O contrato central: a solução inteira é legal a partir do FEN devolvido.
    const c = new Chess(out.fen);
    for (const uci of out.solution) {
      const mv = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: 'q' });
      expect(mv).not.toBeNull();
    }
  });

  test('Ignora tokens de numeração no PGN ("1.", "2...")', () => {
    const out = converterPuzzleLichess(
      resposta({ pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5' })
    );
    expect(out.fen).toBeTruthy();
    expect(new Chess(out.fen).turn()).toBe('w'); // brancas no lance (O-O)
  });

  test('Lança erro quando nenhuma posição torna a solução legal', () => {
    expect(() =>
      converterPuzzleLichess(
        resposta({ pgn: 'e4 e5', solution: ['h4h5'], initialPly: 1 })
      )
    ).toThrow(/não foi possível derivar um FEN/i);
  });
});
