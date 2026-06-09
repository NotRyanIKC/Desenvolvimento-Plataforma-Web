import { Chess, type Move } from 'chess.js';
import type { NivelDificuldade } from './bots';

const VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

function scoreMove(game: Chess, move: Move, nivel: NivelDificuldade): number {
  if (nivel === 'facil') return 0;
  let score = move.captured ? VALUES[move.captured] ?? 0 : 0;
  if (move.promotion) score += VALUES[move.promotion] ?? 0;
  if (nivel === 'dificil') {
    const copy = new Chess(game.fen());
    copy.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
    if (copy.isCheckmate()) score += 1000;
    else if (copy.inCheck()) score += 2;
  }
  return score;
}

export function chooseBotMove(
  game: Chess,
  nivel: NivelDificuldade,
  random: () => number = Math.random
): Move | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  if (nivel === 'facil') return moves[Math.floor(random() * moves.length)];

  const scored = moves.map((move) => ({ move, score: scoreMove(game, move, nivel) }));
  const best = Math.max(...scored.map(({ score }) => score));
  const finalists = scored.filter(({ score }) => score === best).map(({ move }) => move);
  return finalists[Math.floor(random() * finalists.length)];
}
