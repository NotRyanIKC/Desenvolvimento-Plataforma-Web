import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Puzzles.module.css';

const TOTAL_NIVEIS = 10;

// Trilha de níveis no estilo seletor de fases de jogo mobile.
// Hoje só o nível 1 tem puzzle real (src/data/puzzles.ts); os demais
// ficam bloqueados até haver mais conteúdo cadastrado.
const NIVEIS = Array.from({ length: TOTAL_NIVEIS }, (_, i) => ({
  nivel: i + 1,
  desbloqueado: i === 0,
}));

// Deslocamento horizontal suave pra dar o aspecto de trilha sinuosa.
// Mantido menor que o raio do node (40px) pra cada node continuar tocando
// a linha tracejada central.
function weave(i: number): number {
  return Math.round(Math.sin(i * 0.7) * 34);
}

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
          <Link href="/routes/puzzles/mestres" className={styles.navLink}>Puzzles dos Mestres</Link>
          <Link href="/routes/puzzles/lichess" className={styles.navLink}>Puzzles do Lichess</Link>
          <Link href="/routes/play" className={styles.navLink}>Jogar</Link>
          <Link href="/routes/login" className={styles.navLink}>Entrar</Link>
          <Link href="/routes/register" className={styles.btnPrimary}>Criar Conta</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Problemas</h1>
          <p className={styles.sub}>
            Complete os níveis para desbloquear novos desafios táticos.
          </p>
        </div>

        {/* Trilha de níveis */}
        <div className={styles.trail}>
          {NIVEIS.map((n, i) => {
            const conteudo = (
              <div className={styles.levelInner}>
                <div
                  className={`${styles.node} ${
                    n.desbloqueado ? styles.nodeOpen : styles.nodeLocked
                  }`}
                >
                  {n.desbloqueado ? n.nivel : <span className={styles.lock}>🔒</span>}
                </div>
                <span className={styles.levelLabel}>
                  {n.desbloqueado ? 'Começar' : `Nível ${n.nivel}`}
                </span>
                {n.desbloqueado && (
                  <div className={styles.stars} aria-hidden="true">
                    <span>☆</span>
                    <span>☆</span>
                    <span>☆</span>
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={n.nivel}
                className={styles.level}
                style={{ transform: `translateX(${weave(i)}px)` }}
              >
                {n.desbloqueado ? (
                  <Link href={`/routes/puzzles/${n.nivel}`} className={styles.levelLink}>
                    {conteudo}
                  </Link>
                ) : (
                  <div
                    className={styles.levelLink}
                    aria-disabled="true"
                    title="Bloqueado"
                  >
                    {conteudo}
                  </div>
                )}
              </div>
            );
          })}

          {/* Node final — mais conteúdo a caminho */}
          <div
            className={styles.level}
            style={{ transform: `translateX(${weave(TOTAL_NIVEIS)}px)` }}
          >
            <div className={`${styles.levelLink} ${styles.soonLink}`} aria-disabled="true">
              <div className={styles.levelInner}>
                <div className={`${styles.node} ${styles.nodeSoon}`}>
                  <span className={styles.soonIcon}>+</span>
                </div>
                <span className={styles.soonLabel}>Mais puzzles em breve</span>
              </div>
            </div>
          </div>
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
