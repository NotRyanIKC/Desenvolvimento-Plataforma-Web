import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from '@/types/chess';

// Cast necessário enquanto o pacote não possui tipos completos
const Board = Chessboard as any;

interface ChessBoardProps {
  position: string; // FEN string
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
}

export default function ChessBoard({ position, onPieceDrop }: ChessBoardProps) {
  return (
    <div style={{ width: '500px', margin: '20px' }}>
      <Board position={position} onPieceDrop={onPieceDrop} />
    </div>
  );
}