import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Move } from 'chess.js';
import ChessBoard from '@/components/ui/ChessBoard';
import { chooseBotMove } from '@/lib/botEngine';
import { addGameRecord, GAME_HISTORY_KEY, parseGameHistory, type GameMode, type GameResult, type LocalGameRecord } from '@/lib/gameHistory';
import { getGameOutcome } from '@/lib/gameRules';
import type { NivelDificuldade } from '@/lib/bots';
import type { Square } from '@/types/chess';
import styles from '@/styles/Game.module.css';

interface BotConfig {
  nome: string;
  nivelDificuldade: NivelDificuldade;
}

interface PlayableGameProps {
  mode: GameMode;
  bot?: BotConfig;
}

function moveToUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ''}`;
}

function createRecordId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PlayableGame({ mode, bot }: PlayableGameProps) {
  const [game, setGame] = useState(() => new Chess());
  const [moves, setMoves] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [abandoned, setAbandoned] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const savedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outcome = useMemo(() => getGameOutcome(game), [game]);
  const opponent = mode === 'bot' ? bot?.nome ?? 'Bot' : 'Jogador local';

  const persist = useCallback((result: GameResult, currentGame: Chess, currentMoves: string[]) => {
    if (savedRef.current || typeof window === 'undefined') return;
    savedRef.current = true;
    const record: LocalGameRecord = {
      id: createRecordId(),
      mode,
      opponent,
      result,
      moves: currentMoves,
      finalFen: currentGame.fen(),
      finishedAt: new Date().toISOString(),
    };
    const records = parseGameHistory(window.localStorage.getItem(GAME_HISTORY_KEY));
    window.localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(addGameRecord(records, record)));
  }, [mode, opponent]);

  useEffect(() => {
    if (outcome.finished && outcome.result) persist(outcome.result, game, moves);
  }, [game, moves, outcome, persist]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const applyBotTurn = useCallback((afterHuman: Chess, nextMoves: string[]) => {
    if (!bot || afterHuman.isGameOver()) return;
    setThinking(true);
    timerRef.current = setTimeout(() => {
      const botGame = new Chess(afterHuman.fen());
      const selected = chooseBotMove(botGame, bot.nivelDificuldade);
      if (!selected) {
        setThinking(false);
        return;
      }
      const applied = botGame.move({ from: selected.from, to: selected.to, promotion: selected.promotion ?? 'q' });
      if (!applied) {
        setThinking(false);
        return;
      }
      setMoves([...nextMoves, moveToUci(applied)]);
      setGame(botGame);
      setThinking(false);
    }, 450);
  }, [bot]);

  const handlePieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    if (thinking || abandoned || outcome.finished) return false;
    if (mode === 'bot' && game.turn() !== 'w') return false;
    const copy = new Chess(game.fen());
    try {
      const move = copy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!move) return false;
      const nextMoves = [...moves, moveToUci(move)];
      setNotice(null);
      setMoves(nextMoves);
      setGame(copy);
      if (mode === 'bot') applyBotTurn(copy, nextMoves);
      return true;
    } catch {
      setNotice('Lance inválido. O turno permanece com o mesmo jogador.');
      return false;
    }
  }, [abandoned, applyBotTurn, game, mode, moves, outcome.finished, thinking]);

  function resetGame() {
    if (timerRef.current) clearTimeout(timerRef.current);
    savedRef.current = false;
    setGame(new Chess());
    setMoves([]);
    setThinking(false);
    setAbandoned(false);
    setNotice(null);
  }

  function abandonGame() {
    if (outcome.finished || abandoned) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setThinking(false);
    setAbandoned(true);
    setNotice('Partida encerrada por abandono.');
    persist('abandono', game, moves);
  }

  const status = abandoned
    ? 'Partida encerrada por abandono.'
    : thinking
      ? `${opponent} está calculando o lance.`
      : outcome.message;

  return (
    <section className={styles.gameArea}>
      <div className={styles.boardCard}>
        <ChessBoard position={game.fen()} onPieceDrop={handlePieceDrop} />
      </div>
      <aside className={styles.sidebar}>
        <div className={styles.card}>
          <span className={styles.label}>Modo</span>
          <strong>{mode === 'bot' ? `Contra ${opponent}` : 'PvP local'}</strong>
          {bot && <span className={styles.small}>Dificuldade: {bot.nivelDificuldade}</span>}
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Situação</span>
          <strong data-testid="game-status">{status}</strong>
          {notice && <span className={styles.warning}>{notice}</span>}
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Lances</span>
          {moves.length === 0 ? <span className={styles.small}>Nenhum lance realizado.</span> : <ol className={styles.moves}>{moves.map((move, index) => <li key={`${move}-${index}`}>{move}</li>)}</ol>}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={resetGame}>Nova partida</button>
          <button type="button" className={styles.danger} onClick={abandonGame} disabled={outcome.finished || abandoned}>Abandonar</button>
        </div>
      </aside>
    </section>
  );
}
