import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Puzzles.module.css';

const PUZZLE_PHASES = Array.from({ length: 10 }, (_, i) => ({
  phase: i + 1,
  title: `Fase ${i + 1}`,
  count: 10,
  locked: i > 0,
}));

export default function Puzzles() {
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
          <Link href="/routes/play" className={styles.navLink}>Jogar</Link>
          <Link href="/routes/login" className={styles.navLink}>Entrar</Link>
          <Link href="/routes/register" className={styles.btnPrimary}>Criar Conta</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Problemas</h1>
          <p className={styles.sub}>
            Resolva puzzles táticos e evolua fase por fase.
          </p>
        </div>

        {/* Fase ativa — destaque */}
        <div className={styles.activePhase}>
          <div className={styles.activeLeft}>
            <span className={styles.activeBadge}>Fase atual</span>
            <h2 className={styles.activeTitle}>Fase 1</h2>
            <p className={styles.activeDesc}>
              10 puzzles de nível iniciante para aquecer sua visão tática.
            </p>
            <Link href="/routes/puzzles/1" className={styles.btnStart}>
              Iniciar Fase →
            </Link>
          </div>
          <div className={styles.activeBoard} aria-hidden="true">
            {Array.from({ length: 64 }).map((_, i) => {
              const r = Math.floor(i / 8);
              const c = i % 8;
              const isLight = (r + c) % 2 === 0;
              return (
                <div
                  key={i}
                  className={`${styles.cell} ${isLight ? styles.cellLight : styles.cellDark}`}
                />
              );
            })}
          </div>
        </div>

        {/* Grade de fases */}
        <div className={styles.phasesGrid}>
          {PUZZLE_PHASES.map((p) => (
            <div
              key={p.phase}
              className={`${styles.phaseCard} ${p.locked ? styles.phaseLocked : styles.phaseOpen}`}
            >
              <div className={styles.phaseNumber}>
                {p.locked ? '🔒' : p.phase}
              </div>
              <div className={styles.phaseInfo}>
                <span className={styles.phaseTitle}>{p.title}</span>
                <span className={styles.phaseCount}>{p.count} puzzles</span>
              </div>
              {!p.locked && (
                <Link href={`/routes/puzzles/${p.phase}`} className={styles.phaseArrow}>
                  →
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.hint}>
          <p>Pronto para uma partida completa?</p>
          <Link href="/routes/play" className={styles.btnHint}>
            Jogar Agora →
          </Link>
        </div>
      </main>
    </div>
  );
}