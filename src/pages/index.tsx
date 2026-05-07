import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';


const Board = Chessboard as any;

export default function Home() {
  const [game, setGame] = useState(new Chess());
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  function onDrop(sourceSquare: string, targetSquare: string) {
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;
      
      setGame(gameCopy);
      return true;
    } catch (error) {

      return false; 
    }
  }

  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>Plataforma de Xadrez ♟️</h1>
      <p>Arraste as peças para jogar!</p>
      <p style={{ color: 'red', fontWeight: 'bold' }}>Lembre-se: As peças brancas começam!</p>
      
      <div style={{ width: '500px', margin: '20px' }}>
        {}
        <Board 
          position={game.fen()} 
          onPieceDrop={onDrop} 
        />
      </div>
    </div>
  );
}
