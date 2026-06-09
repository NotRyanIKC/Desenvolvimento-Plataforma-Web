import { describe, expect, test } from 'vitest';
import { Chess } from 'chess.js';
import { chooseBotMove } from '../../../src/lib/botEngine';

describe('botEngine', () => {
  test('nível fácil usa uma jogada legal escolhida pelo sorteio', () => {
    const game = new Chess();
    const moves = game.moves({ verbose: true });
    const selected = chooseBotMove(game, 'facil', () => 0);
    expect(selected).toMatchObject({ from: moves[0].from, to: moves[0].to });
  });

  test('nível médio prioriza captura de maior valor', () => {
    const game = new Chess('7k/8/8/8/8/8/q7/R6K w - - 0 1');
    const selected = chooseBotMove(game, 'medio', () => 0);
    expect(selected).toMatchObject({ from: 'a1', to: 'a2', captured: 'q' });
  });

  test('nível difícil prioriza uma continuação que dá xeque', () => {
    const game = new Chess('7k/8/8/8/8/8/6Q1/7K w - - 0 1');
    const selected = chooseBotMove(game, 'dificil', () => 0);
    expect(selected).not.toBeNull();
    const after = new Chess(game.fen());
    after.move({ from: selected!.from, to: selected!.to, promotion: selected!.promotion ?? 'q' });
    expect(after.inCheck()).toBe(true);
  });

  test('devolve null quando não há lance disponível', () => {
    const game = new Chess('7k/5Q2/7K/8/8/8/8/8 b - - 0 1');
    expect(chooseBotMove(game, 'dificil')).toBeNull();
  });
});

test('nível médio considera promoção como vantagem material', () => {
  const game = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');
  const selected = chooseBotMove(game, 'medio', () => 0);
  expect(selected).toMatchObject({ from: 'a7', to: 'a8', promotion: 'q' });
});

test('nível difícil prioriza xeque-mate acima de outros lances', () => {
  const game = new Chess('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1');
  const selected = chooseBotMove(game, 'dificil', () => 0);
  expect(selected).not.toBeNull();
  const after = new Chess(game.fen());
  after.move({ from: selected!.from, to: selected!.to, promotion: selected!.promotion ?? 'q' });
  expect(after.isCheckmate()).toBe(true);
});
