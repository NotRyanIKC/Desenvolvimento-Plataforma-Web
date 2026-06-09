import React from 'react';
import Link from 'next/link';
import PlayableGame from '@/components/game/PlayableGame';
import styles from '@/styles/Game.module.css';

export default function PvpLocalPage() {
  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}><span className={styles.logoIcon}>♟</span><span>Cesu<span className={styles.logoAccent}>Chess</span></span></Link>
        <div className={styles.navLinks}><Link href="/routes/play" className={styles.navLink}>← Modos</Link><Link href="/routes/play/history" className={styles.navLink}>Histórico</Link></div>
      </nav>
      <main className={styles.main}>
        <h1 className={styles.title}>Partida 1v1 local</h1>
        <p className={styles.sub}>Cada jogador realiza seu próprio lance no mesmo dispositivo. As brancas começam.</p>
        <PlayableGame mode="pvp-local" />
      </main>
    </div>
  );
}
