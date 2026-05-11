import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/ui/ChessBoard';
import { applyMove } from '@/lib/chessEngine';
import type { Square } from '@/types/chess';

export default function Home() {
  const [game, setGame] = useState(new Chess());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    const updatedGame = applyMove(game, sourceSquare, targetSquare);
    if (!updatedGame) return false;

    setGame(updatedGame);
    return true;
  }

  if (!isClient) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '50px',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>Plataforma de Xadrez ♟️</h1>
      <p>Arraste as peças para jogar!</p>
      <p style={{ color: 'red', fontWeight: 'bold' }}>
        Lembre-se: As peças brancas começam!
      </p>
      <ChessBoard position={game.fen()} onPieceDrop={onDrop} />
    </div>
  );
}