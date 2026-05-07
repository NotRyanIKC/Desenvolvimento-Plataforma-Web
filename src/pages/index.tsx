import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

// Truque infalível para o TypeScript parar de dar erro na biblioteca
const Board = Chessboard as any;

export default function Home() {
  const [game, setGame] = useState(new Chess());
  const [isClient, setIsClient] = useState(false);

  // Esse useEffect garante que o tabuleiro só seja renderizado no navegador,
  // evitando bugs de "arrastar e soltar" no Next.js
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
      // Se o movimento for inválido (ex: cavalo em linha reta ou mover a preta primeiro)
      return false; 
    }
  }

  // Se a página ainda não carregou no cliente, não mostra nada
  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>Plataforma de Xadrez ♟️</h1>
      <p>Arraste as peças para jogar!</p>
      <p style={{ color: 'red', fontWeight: 'bold' }}>Lembre-se: As peças brancas começam!</p>
      
      <div style={{ width: '500px', margin: '20px' }}>
        {/* Agora usamos nossa versão livre de erros do TypeScript */}
        <Board 
          position={game.fen()} 
          onPieceDrop={onDrop} 
        />
      </div>
    </div>
  );
}