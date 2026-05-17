/**
 * src/hooks/usePuzzle.ts
 *
 * Hook responsável por expor os dados de um puzzle pelo número da fase.
 * Como os dados são estáticos (src/data/puzzles.ts), a busca é síncrona —
 * não há necessidade de useEffect ou estado assíncrono.
 *
 * Quando a integração com API ou banco de dados for adicionada,
 * este hook será o único arquivo a mudar.
 */

import { getPuzzleByPhase, type Puzzle } from '@/data/puzzles';

interface UsePuzzleResult {
  puzzle: Puzzle | null;
  notFound: boolean;
}

export function usePuzzle(phase: number): UsePuzzleResult {
  const puzzle = getPuzzleByPhase(phase);

  return {
    puzzle: puzzle ?? null,
    notFound: puzzle === null,
  };
}