/**
 * /routes/puzzles/[phase] — resolver puzzle interativamente.
 *
 * UC-12 Resolver puzzle, UC-13 Avançar para o próximo puzzle.
 *
 * Lógica: jogador faz lance → compara com solution[step] →
 * se acerta, aplica + lance do adversário automático → repete →
 * se completa, registra no histórico via POST /api/puzzles/solved.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/ui/ChessBoard';
import ComentariosSection from '@/components/ui/ComentariosSection';
import { applyMove } from '@/lib/chessEngine';
import { api } from '@/lib/apiClient';
import { usePuzzle } from '@/hooks/usePuzzles';
import styles from '@/styles/PuzzlePhase.module.css';
import type { Square } from '@/types/chess';

type Estado = 'jogando' | 'errou' | 'completou';

function registrarResolvido(
  puzzleId: string,
  fase: number,
  rating: number,
  tentativas: number,
  acertou: boolean,
): void {
  const body = { puzzleId, fase, rating, tentativas, acertou };
  api.post('/api/puzzles/solved', body).catch(() => undefined);
}

export default function PuzzlePhase() {
  const router = useRouter();
  const phase = Number(router.query.phase);
  const { puzzle, notFound } = usePuzzle(Number.isFinite(phase) ? phase : 0);

  const [game, setGame] = useState<Chess | null>(null);
  const [step, setStep] = useState(0);
  const [estado, setEstado] = useState<Estado>('jogando');
  const [tentativas, setTentativas] = useState(1);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // Inicialização: cria o Chess quando o puzzle carrega.
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
          registrarResolvido(puzzle.id, phase, puzzle.rating, tentativas, true);
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
              registrarResolvido(puzzle.id, phase, puzzle.rating, tentativas, true);
            }
          }
        }, 350);

        return true;
      }

      setEstado('errou');
      setMensagem(`Não é esse lance. Esperado: ${esperado}. Tente de novo.`);
      setTimeout(() => setEstado('jogando'), 1500);
      return false;
    },
    [puzzle, game, step, estado, phase, tentativas],
  );

  if (!router.isReady) return null;

  if (notFound) {
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
        </nav>
        <div className={styles.notFound}>
          <p className={styles.notFoundText}>Fase não encontrada.</p>
          <Link href="/routes/puzzles" className={styles.btnBack}>← Voltar aos problemas</Link>
        </div>
      </div>
    );
  }

  if (!puzzle || !game) return null;

  const turno = puzzle.fen.split(' ')[1] === 'w' ? 'claras' : 'escuras';

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
          <Link href="/routes/puzzles" className={styles.navLink}>← Problemas</Link>
          <Link href="/routes/play" className={styles.navLink}>Jogar</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <span className={styles.infoLabel}>Fase</span>
            <span className={styles.infoValue}>{phase}</span>
          </div>

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

          <div className={styles.sideCard}>
            <span className={styles.infoLabel}>Temas</span>
            <div className={styles.themes}>
              {puzzle.themes.map((t) => (
                <span key={t} className={styles.theme}>{t}</span>
              ))}
            </div>
          </div>

          <div className={styles.instructionCard}>
            {estado === 'completou' ? (
              <p className={styles.instructionText} style={{ color: '#7be0a3', fontWeight: 600 }}>
                {mensagem} ({tentativas} {tentativas === 1 ? 'tentativa' : 'tentativas'})
              </p>
            ) : estado === 'errou' ? (
              <p className={styles.instructionText} style={{ color: '#ff8585' }}>{mensagem}</p>
            ) : (
              <p className={styles.instructionText}>
                Encontre o melhor lance para as peças {turno}.
              </p>
            )}
          </div>

          {estado !== 'completou' && (
            <button onClick={reiniciar} className={styles.btnLichess} style={{ marginBottom: 8 }}>
              ↺ Reiniciar puzzle
            </button>
          )}

          <a
            href={`https://lichess.org/training/${puzzle.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnLichess}
          >
            Ver no Lichess ↗
          </a>
        </aside>

        <div className={styles.boardArea}>
          <ChessBoard position={game.fen()} onPieceDrop={handlePieceDrop} />
          <ComentariosSection puzzleLichessId={puzzle.id} />
        </div>
      </main>
    </div>
  );
}
