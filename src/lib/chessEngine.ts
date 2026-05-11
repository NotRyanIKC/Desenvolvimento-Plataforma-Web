import { Chess } from 'chess.js';

/**
 * Tenta realizar um movimento no tabuleiro.
 * Retorna uma nova instância de Chess com o movimento aplicado,
 * ou null se o movimento for inválido.
 */
export function applyMove(
  game: Chess,
  sourceSquare: string,
  targetSquare: string
): Chess | null {
  const gameCopy = new Chess(game.fen());

  try {
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return null;
    return gameCopy;
  } catch {
    return null;
  }
}