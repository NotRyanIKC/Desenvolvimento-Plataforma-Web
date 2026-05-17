/**
 * src/data/puzzles.ts
 *
 * Dados estáticos dos puzzles utilizados na plataforma.
 * Fonte: banco público do Lichess (database.lichess.org)
 *
 * IMPORTANTE sobre o FEN:
 *   O Lichess armazena o FEN antes do lance do adversário.
 *   O campo `fen` aqui já tem o primeiro lance aplicado,
 *   ou seja, é a posição real que o jogador vai ver no tabuleiro.
 *
 * solution → lances restantes em UCI (sem o primeiro lance do adversário)
 */

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  rating: number;
  themes: string[];
  phase: number;
}

export const PUZZLES: Puzzle[] = [
  {
    id: '00008',
    // FEN após aplicar f2g3 (primeiro lance do adversário)
    fen: 'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25',
    solution: ['e6e7', 'b2b1', 'b3c1', 'b1c1', 'h6c1'],
    rating: 1830,
    themes: ['crushing', 'hangingPiece', 'long', 'middlegame'],
    phase: 1,
  },
];

/**
 * Retorna o puzzle de uma fase específica.
 * Retorna null se a fase não existir.
 */
export function getPuzzleByPhase(phase: number): Puzzle | null {
  return PUZZLES.find((p) => p.phase === phase) ?? null;
}