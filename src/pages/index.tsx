import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';

const BOARD_PIECES: (string | null)[][] = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

export default function Home() {
  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.gradientOrb} aria-hidden="true" />

      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>♟</span>
          <span className={styles.logoText}>
            Cesu<span className={styles.logoAccent}>Chess</span>
          </span>
        </div>
        <div className={styles.navActions}>
          <Link href="/routes/login" className={styles.btnOutline}>
            Entrar
          </Link>
          <Link href="/routes/register" className={styles.btnPrimary}>
            Criar Conta
          </Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Plataforma acadêmica de xadrez
          </div>

          <h1 className={styles.heroTitle}>
            Jogue, aprenda<br />
            e evolua no{' '}
            <span className={styles.titleAccent}>xadrez</span>
          </h1>

          <p className={styles.heroSub}>
            Uma plataforma completa para estudar xadrez, resolver problemas
            táticos e acompanhar sua evolução passo a passo.
          </p>

          <div className={styles.heroActions}>
            <Link href="/routes/play" className={styles.btnHero}>
              Jogar Agora
            </Link>
            <Link href="/routes/puzzles" className={styles.btnHeroGhost}>
              Ver Problemas
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>16.4k</span>
              <span className={styles.statLabel}>Problemas</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>842</span>
              <span className={styles.statLabel}>Usuários</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>5</span>
              <span className={styles.statLabel}>Modos de jogo</span>
            </div>
          </div>
        </div>

        <div className={styles.boardWrapper}>
          <div className={styles.boardGlow} aria-hidden="true" />
          <div className={styles.board} aria-label="Tabuleiro de xadrez decorativo">
            {BOARD_PIECES.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${styles.cell} ${isLight ? styles.cellLight : styles.cellDark}`}
                  >
                    {piece && (
                      <span
                        className={`${styles.piece} ${r < 2 ? styles.pieceDark : styles.pieceLight}`}
                      >
                        {piece}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <section className={styles.cards} aria-label="Ações principais">
        <Link href="/routes/register" className={styles.card}>
          <span className={styles.cardIcon}>✦</span>
          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Criar Conta</h2>
            <p className={styles.cardDesc}>
              Registre-se gratuitamente e comece a acompanhar seu progresso.
            </p>
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>

        <Link href="/routes/login" className={styles.card}>
          <span className={styles.cardIcon}>◈</span>
          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Realizar Login</h2>
            <p className={styles.cardDesc}>
              Acesse sua conta e continue de onde parou.
            </p>
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>

        <Link href="/routes/play" className={styles.card}>
          <span className={styles.cardIcon}>⬡</span>
          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Jogar</h2>
            <p className={styles.cardDesc}>
              Inicie uma partida contra outro jogador ou contra o computador.
            </p>
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>

        <Link href="/routes/puzzles" className={styles.card}>
          <span className={styles.cardIcon}>◎</span>
          <div className={styles.cardBody}>
            <h2 className={styles.cardTitle}>Problemas</h2>
            <p className={styles.cardDesc}>
              Resolva exercícios táticos e afie sua visão de jogo.
            </p>
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>
      </section>
    </div>
  );
}