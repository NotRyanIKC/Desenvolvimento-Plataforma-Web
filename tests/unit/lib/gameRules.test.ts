import { describe, expect, test } from 'vitest';
import { Chess } from 'chess.js';
import { getGameOutcome } from '../../../src/lib/gameRules';

describe('gameRules', () => {
  test('informa o turno enquanto a partida está ativa', () => {
    expect(getGameOutcome(new Chess())).toEqual({
      finished: false,
      result: null,
      message: 'Vez das brancas.',
    });
  });

  test('identifica a vitória das pretas por xeque-mate', () => {
    const game = new Chess();
    game.move('f3');
    game.move('e5');
    game.move('g4');
    game.move('Qh4#');
    expect(getGameOutcome(game)).toEqual({
      finished: true,
      result: 'pretas',
      message: 'Xeque-mate. Pretas venceram.',
    });
  });

  test('identifica empate', () => {
    const game = new Chess('7k/5Q2/7K/8/8/8/8/8 b - - 0 1');
    expect(getGameOutcome(game)).toEqual({
      finished: true,
      result: 'empate',
      message: 'Partida encerrada em empate.',
    });
  });
});

test('informa o turno das pretas após lance das brancas', () => {
  const game = new Chess();
  game.move('e4');
  expect(getGameOutcome(game).message).toBe('Vez das pretas.');
});

test('identifica a vitória das brancas por xeque-mate', () => {
  const game = new Chess();
  game.move('e4');
  game.move('f6');
  game.move('Bc4');
  game.move('g5');
  game.move('Qh5#');
  expect(getGameOutcome(game)).toEqual({
    finished: true,
    result: 'brancas',
    message: 'Xeque-mate. Brancas venceram.',
  });
});
