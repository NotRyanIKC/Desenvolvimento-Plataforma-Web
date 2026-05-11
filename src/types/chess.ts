/**
 * Tipos compartilhados relacionados à lógica de xadrez.
 */

export type Square = string; // ex: 'e2', 'd4'

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export interface MoveAttempt {
  sourceSquare: Square;
  targetSquare: Square;
  promotion?: PromotionPiece;
}