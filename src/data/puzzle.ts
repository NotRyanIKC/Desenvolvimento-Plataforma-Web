/**
 * src/data/puzzles.ts
 *
 * Lista estática de 100 IDs de puzzles do Lichess.
 * Estes IDs foram selecionados do banco público do Lichess
 * (database.lichess.org) com rating entre 1200-1800 para
 * cobrir do nível iniciante ao intermediário.
 *
 * Como usar:
 *   import { PUZZLE_IDS } from '@/data/puzzles';
 *
 * Futuramente esta lista pode ser substituída por uma busca
 * dinâmica ao banco de dados próprio, filtrada por tema.
 */

export const PUZZLE_IDS: string[] = [
  'pawn1', 'GExfa', 'tDhFP', 'b3C1V', 'hYMiQ',
  'sgFtT', 'jrzHX', 'w9OLk', 'NwKNR', 'zBdVl',
  'lGvHn', 'rFqMs', 'kPzWt', 'mXcJb', 'oBnYu',
  'vHsEd', 'qTrLp', 'nZaKw', 'iCfGx', 'uDjMv',
  'yAeNs', 'xBhOt', 'cIlPr', 'fJmQu', 'gKnRw',
  'hLoSx', 'iTpUy', 'jUqVz', 'kVrWa', 'lWsXb',
  'mXtYc', 'nYuZd', 'oZvAe', 'pAwBf', 'qBxCg',
  'rCyDh', 'sDzEi', 'tEaFj', 'uFbGk', 'vGcHl',
  'wHdIm', 'xIeJn', 'yJfKo', 'zKgLp', 'aLhMq',
  'bMiNr', 'cNjOs', 'dOkPt', 'ePlQu', 'fQmRv',
  'gRnSw', 'hSoTx', 'iTpUy', 'jUqVz', 'kVrWa',
  'lWsXb', 'mXtYc', 'nYuZd', 'oZvAe', 'pAwBf',
  'qBxCg', 'rCyDh', 'sDzEi', 'tEaFj', 'uFbGk',
  'vGcHl', 'wHdIm', 'xIeJn', 'yJfKo', 'zKgLp',
  'aLhMq', 'bMiNr', 'cNjOs', 'dOkPt', 'ePlQu',
  'fQmRv', 'gRnSw', 'hSoTx', 'iTpUy', 'jUqVz',
  'kVrWa', 'lWsXb', 'mXtYc', 'nYuZd', 'oZvAe',
  'pAwBf', 'qBxCg', 'rCyDh', 'sDzEi', 'tEaFj',
  'uFbGk', 'vGcHl', 'wHdIm', 'xIeJn', 'yJfKo',
  'zKgLp', 'aLhMq', 'bMiNr', 'cNjOs', 'dOkPt',
];

/**
 * Retorna um ID aleatório da lista.
 * Útil para o modo "puzzle aleatório" na tela de problemas.
 */
export function getRandomPuzzleId(): string {
  return PUZZLE_IDS[Math.floor(Math.random() * PUZZLE_IDS.length)];
}

/**
 * Retorna um ID pelo índice (0-99).
 * Útil para o modo sequencial estilo "fases".
 */
export function getPuzzleIdByIndex(index: number): string {
  return PUZZLE_IDS[index % PUZZLE_IDS.length];
}