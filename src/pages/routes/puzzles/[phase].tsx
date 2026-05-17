import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ChessBoard from '@/components/ui/ChessBoard';
import { usePuzzle } from '@/hooks/usePuzzles';
import styles from '@/styles/PuzzlePhase.module.css';

export default function PuzzlePhase() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!router.isReady || !isClient) return null;

  const phase = Number(router.query.phase);
  const { puzzle, notFound } = usePuzzle(phase);

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
          <Link href="/routes/puzzles" className={styles.btnBack}>
            ← Voltar aos problemas
          </Link>
        </div>
      </div>
    );
  }

  if (!puzzle) return null;

  console.log('FEN:', puzzle.fen);
  console.log('puzzle:', puzzle);

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
          <Link href="/routes/puzzles" className={styles.navLink}>
            ← Problemas
          </Link>
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
            <span className={styles.infoLabel}>Temas</span>
            <div className={styles.themes}>
              {puzzle.themes.map((t) => (
                <span key={t} className={styles.theme}>{t}</span>
              ))}
            </div>
          </div>

          <div className={styles.instructionCard}>
            <p className={styles.instructionText}>
              Encontre o melhor lance para as peças escuras.
            </p>
          </div>

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
          <ChessBoard
            position={puzzle.fen}
            onPieceDrop={() => false}
          />
        </div>
      </main>
    </div>
  );
}