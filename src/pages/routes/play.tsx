import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Play.module.css';

const MODES = [
  {
    icon: '⚔',
    title: 'PvP Local',
    desc: 'Dois jogadores no mesmo dispositivo, passando o turno um ao outro.',
    disabled: false,
    href: '/routes/play/pvp',
  },
  {
    icon: '🤖',
    title: 'Jogar contra o Bot',
    desc: 'Treine contra o computador em diferentes níveis de dificuldade.',
    disabled: true,
    href: null,
  },
];

export default function Play() {
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
          <Link href="/routes/puzzles" className={styles.navLink}>Problemas</Link>
          <Link href="/routes/login" className={styles.navLink}>Entrar</Link>
          <Link href="/routes/register" className={styles.btnPrimary}>Criar Conta</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Jogar</h1>
          <p className={styles.sub}>Escolha um modo de jogo para começar sua partida.</p>
        </div>

        <div className={styles.modes}>
          {MODES.map((mode) =>
            mode.disabled ? (
              <div
                key={mode.title}
                className={`${styles.modeCard} ${styles.modeDisabled}`}
              >
                <span className={styles.modeIcon}>{mode.icon}</span>
                <div className={styles.modeBody}>
                  <h2 className={styles.modeTitle}>{mode.title}</h2>
                  <p className={styles.modeDesc}>{mode.desc}</p>
                </div>
                <span className={styles.modeBadge}>Em breve</span>
              </div>
            ) : (
              <Link
                key={mode.title}
                href={mode.href!}
                className={styles.modeCard}
              >
                <span className={styles.modeIcon}>{mode.icon}</span>
                <div className={styles.modeBody}>
                  <h2 className={styles.modeTitle}>{mode.title}</h2>
                  <p className={styles.modeDesc}>{mode.desc}</p>
                </div>
                <span className={styles.modeArrow}>→</span>
              </Link>
            )
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.hint}>
          <p>Quer afiar sua tática antes de jogar?</p>
          <Link href="/routes/puzzles" className={styles.btnHint}>
            Resolver Problemas →
          </Link>
        </div>
      </main>
    </div>
  );
}