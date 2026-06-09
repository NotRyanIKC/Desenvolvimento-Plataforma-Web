import { Chess } from 'chess.js';
import type { GameResult } from './gameHistory';

export interface GameOutcome {
  finished: boolean;
  result: GameResult | null;
  message: string;
}

export function getGameOutcome(game: Chess): GameOutcome {
  if (!game.isGameOver()) {
    return {
      finished: false,
      result: null,
      message: game.turn() === 'w' ? 'Vez das brancas.' : 'Vez das pretas.',
    };
  }
  if (game.isCheckmate()) {
    const result = game.turn() === 'w' ? 'pretas' : 'brancas';
    return {
      finished: true,
      result,
      message: result === 'brancas' ? 'Xeque-mate. Brancas venceram.' : 'Xeque-mate. Pretas venceram.',
    };
  }
  return {
    finished: true,
    result: 'empate',
    message: 'Partida encerrada em empate.',
  };
}
