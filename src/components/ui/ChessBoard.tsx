import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from '@/types/chess';

interface PieceDropArgs {
  sourceSquare: string;
  targetSquare: string | null;
  piece: unknown;
}

interface ChessBoardProps {
  position: string;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
}

export default function ChessBoard({ position, onPieceDrop }: ChessBoardProps) {
  return (
    <div style={{ width: '500px', margin: '20px' }}>
      <Chessboard
        options={{
          position,
          onPieceDrop: ({ sourceSquare, targetSquare }: PieceDropArgs) => {
            if (!targetSquare) return false;
            return onPieceDrop(sourceSquare as Square, targetSquare as Square);
          },
        }}
      />
    </div>
  );
}
