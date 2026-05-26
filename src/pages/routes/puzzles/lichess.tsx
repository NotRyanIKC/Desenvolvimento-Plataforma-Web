/**
 * /routes/puzzles/lichess — resolver puzzles vindos da API do Lichess (ao vivo).
 *
 * Página separada do fluxo mockado (a trilha de níveis em /routes/puzzles):
 * busca um puzzle do Lichess via o proxy /api/puzzles/next, resolve no tabuleiro
 * e oferece "Outro puzzle". Não grava no histórico — é um modo livre.
 *
 * O laço de resolução é parecido com o de [phase].tsx, mas mantido aqui de
 * propósito para não tocar no solver mockado.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/ui/ChessBoard';
import ComentariosSection from '@/components/ui/ComentariosSection';
import { applyMove } from '@/lib/chessEngine';
import { api, ApiError } from '@/lib/apiClient';
import type { PuzzleLichess } from '@/lib/puzzleLichess';
import styles from '@/styles/PuzzleLichess.module.css';
import type { Square } from '@/types/chess';

type Estado = 'jogando' | 'errou' | 'completou';

// Temas variados — sorteamos um a cada busca para puzzles diferentes.
const TEMAS = [
  'fork', 'pin', 'skewer', 'mateIn1', 'mateIn2', 'hangingPiece',
  'discoveredAttack', 'sacrifice', 'deflection', 'backRankMate', 'advancedPawn',
];

function temaAleatorio(): string {
  return TEMAS[Math.floor(Math.random() * TEMAS.length)];
}

export default function PuzzleLichessPage() {
  const [puzzle, setPuzzle] = useState<PuzzleLichess | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [game, setGame] = useState<Chess | null>(null);
  const [step, setStep] = useState(0);
  const [estado, setEstado] = useState<Estado>('jogando');
  const [tentativas, setTentativas] = useState(1);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregarPuzzle = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const p = await api.get<PuzzleLichess>(
        `/api/puzzles/next?angle=${temaAleatorio()}`
      );
      setPuzzle(p);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Falha ao carregar o puzzle do Lichess.'
      );
      setPuzzle(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarPuzzle();
  }, [carregarPuzzle]);

  // Inicializa o tabuleiro quando um puzzle chega.
  useEffect(() => {
    if (!puzzle) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGame(new Chess(puzzle.fen));
    setStep(0);
    setEstado('jogando');
    setMensagem(null);
    setTentativas(1);
  }, [puzzle]);

  const reiniciar = useCallback(() => {
    if (!puzzle) return;
    setGame(new Chess(puzzle.fen));
    setStep(0);
    setEstado('jogando');
    setMensagem(null);
    setTentativas((t) => t + 1);
  }, [puzzle]);

  const handlePieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      if (!puzzle || !game || estado !== 'jogando') return false;

      const tentado = `${sourceSquare}${targetSquare}`;
      const esperado = puzzle.solution[step];

      if (tentado === esperado) {
        const apos = applyMove(game, sourceSquare, targetSquare);
        if (!apos) return false;
        setGame(apos);

        const novoStep = step + 1;
        const respostaAdv = puzzle.solution[novoStep];

        if (!respostaAdv) {
          setStep(novoStep);
          setEstado('completou');
          setMensagem('Puzzle resolvido!');
          return true;
        }

        setStep(novoStep);

        // Aplica o lance do adversário após pequeno delay visual.
        setTimeout(() => {
          const fromAdv = respostaAdv.slice(0, 2) as Square;
          const toAdv = respostaAdv.slice(2, 4) as Square;
          const aposAdv = applyMove(apos, fromAdv, toAdv);
          if (aposAdv) {
            setGame(aposAdv);
            const stepFinal = novoStep + 1;
            setStep(stepFinal);
            if (stepFinal >= puzzle.solution.length) {
              setEstado('completou');
              setMensagem('Puzzle resolvido!');
            }
          }
        }, 350);

        return true;
      }

      setEstado('errou');
      setMensagem('Não é esse lance. Tente de novo.');
      setTimeout(() => setEstado('jogando'), 1500);
      return false;
    },
    [puzzle, game, step, estado]
  );

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />

      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>♟</span>
          <span className={styles.logoText}>
            Cesu<span className={styles.logoAccent}>Chess</span>
          </span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/routes/puzzles" className={styles.navLink}>← Níveis</Link>
          <Link href="/routes/play" className={styles.navLink}>Jogar</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Puzzles do Lichess</h1>
          <p className={styles.sub}>
            Problemas táticos ao vivo da base do Lichess. Modo livre — resolva e
            peça outro.
          </p>
        </div>

        {carregando && (
          <div className={styles.center}>
            <p className={styles.loadingText}>Carregando puzzle do Lichess…</p>
          </div>
        )}

        {!carregando && erro && (
          <div className={styles.center}>
            <p className={styles.errText}>{erro}</p>
            <button onClick={carregarPuzzle} className={`${styles.btn} ${styles.btnPrimary}`}>
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && puzzle && game && (
          <>
            <div className={styles.board}>
              <div className={styles.boardArea}>
                <ChessBoard position={game.fen()} onPieceDrop={handlePieceDrop} />
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.row}>
                  <div className={styles.sideCard}>
                    <span className={styles.infoLabel}>Rating</span>
                    <span className={styles.infoValue}>{puzzle.rating}</span>
                  </div>
                  <div className={styles.sideCard}>
                    <span className={styles.infoLabel}>Progresso</span>
                    <span className={styles.infoValue}>
                      {Math.min(step, puzzle.solution.length)} / {puzzle.solution.length}
                    </span>
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <span className={styles.infoLabel}>Temas</span>
                  <div className={styles.themes}>
                    {puzzle.themes.map((t) => (
                      <span key={t} className={styles.theme}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <span className={styles.infoLabel}>
                    {estado === 'completou'
                      ? 'Resultado'
                      : `Jogam as ${puzzle.fen.split(' ')[1] === 'w' ? 'brancas' : 'pretas'}`}
                  </span>
                  <span
                    className={`${styles.status} ${
                      estado === 'completou'
                        ? styles.statusOk
                        : estado === 'errou'
                          ? styles.statusErr
                          : styles.statusInfo
                    }`}
                  >
                    {estado === 'completou'
                      ? `${mensagem} (${tentativas} ${tentativas === 1 ? 'tentativa' : 'tentativas'})`
                      : estado === 'errou'
                        ? mensagem
                        : 'Encontre o melhor lance.'}
                  </span>
                </div>

                <div className={styles.actions}>
                  {estado !== 'completou' && (
                    <button onClick={reiniciar} className={styles.btn}>
                      ↺ Reiniciar
                    </button>
                  )}
                  <button
                    onClick={carregarPuzzle}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                  >
                    Outro puzzle →
                  </button>
                  <a
                    href={`https://lichess.org/training/${puzzle.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btn}
                  >
                    Ver no Lichess ↗
                  </a>
                </div>
              </aside>
            </div>

            <ComentariosSection puzzleLichessId={puzzle.id} />
          </>
        )}
      </main>
    </div>
  );
}
