/**
 * src/lib/puzzleLichess.ts
 *
 * Converte a resposta crua da API do Lichess (`{ game, puzzle }`) no formato
 * que o tabuleiro precisa: um FEN jogável + a lista de lances da solução.
 *
 * O Lichess entrega o PGN do jogo + `initialPly` + a solução em UCI, mas NÃO
 * um FEN. A posição que o jogador enfrenta é a de depois do "lance de armação"
 * (o último meio-lance antes da solução). Validado contra o puzzle 00008:
 * `solution` é usada inteira (sem fatiar) e o FEN é a posição após `initialPly+1`
 * meios-lances. Para não depender de uma contagem exata de ply, tentamos alguns
 * candidatos e escolhemos aquele em que a solução inteira é legal.
 */

import { Chess } from 'chess.js';
import type { LichessPuzzleResponse } from '@/services/lichess';

export interface PuzzleLichess {
  id: string;
  fen: string;
  solution: string[]; // UCI, na ordem em que devem ser jogados
  rating: number;
  themes: string[];
}

/** Aplica um lance UCI (ex.: "e2e4", "e7e8q") num Chess. Retorna false se ilegal. */
function aplicarUci(c: Chess, uci: string): boolean {
  try {
    const mv = c.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] ?? 'q',
    });
    return mv !== null;
  } catch {
    return false;
  }
}

/** Reproduz os primeiros `n` meios-lances (SAN) e devolve o FEN, ou null se algum for ilegal. */
function fenAposPlies(sanMoves: string[], n: number): string | null {
  const c = new Chess();
  const limite = Math.min(n, sanMoves.length);
  for (let i = 0; i < limite; i++) {
    try {
      if (c.move(sanMoves[i]) === null) return null;
    } catch {
      return null;
    }
  }
  return c.fen();
}

/** A solução inteira é legal a partir deste FEN? */
function solucaoLegal(fen: string, solution: string[]): boolean {
  const c = new Chess(fen);
  for (const uci of solution) {
    if (!aplicarUci(c, uci)) return false;
  }
  return true;
}

export function converterPuzzleLichess(resp: LichessPuzzleResponse): PuzzleLichess {
  const { game, puzzle } = resp;

  // PGN do Lichess vem como SAN separado por espaço, sem números de lance.
  // Filtramos eventuais tokens de numeração ("1.", "2...") por segurança.
  const sanMoves = game.pgn
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && !/^\d+\.+$/.test(t));

  // Candidatos de FEN, em ordem de preferência; escolhemos o que torna a
  // solução inteira legal (resolve a convenção de ply sem chutes frágeis).
  const candidatos = [puzzle.initialPly + 1, puzzle.initialPly, sanMoves.length];
  for (const n of candidatos) {
    const fen = fenAposPlies(sanMoves, n);
    if (fen && solucaoLegal(fen, puzzle.solution)) {
      return {
        id: puzzle.id,
        fen,
        solution: puzzle.solution,
        rating: puzzle.rating,
        themes: puzzle.themes,
      };
    }
  }

  throw new Error(
    `Puzzle ${puzzle.id}: não foi possível derivar um FEN em que a solução seja legal.`
  );
}
