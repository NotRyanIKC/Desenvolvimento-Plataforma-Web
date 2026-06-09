import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GAME_HISTORY_KEY, parseGameHistory, type LocalGameRecord } from '@/lib/gameHistory';
import styles from '@/styles/Game.module.css';

const RESULT_LABEL: Record<LocalGameRecord['result'], string> = {
  brancas: 'Vitória das brancas',
  pretas: 'Vitória das pretas',
  empate: 'Empate',
  abandono: 'Abandono',
};

export default function GameHistoryPage() {
  const [records, setRecords] = useState<LocalGameRecord[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecords(parseGameHistory(window.localStorage.getItem(GAME_HISTORY_KEY)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}><span className={styles.logoIcon}>♟</span><span>Cesu<span className={styles.logoAccent}>Chess</span></span></Link>
        <div className={styles.navLinks}><Link href="/routes/play" className={styles.navLink}>← Modos</Link></div>
      </nav>
      <main className={styles.main}>
        <h1 className={styles.title}>Histórico de partidas</h1>
        <p className={styles.sub}>As partidas jogáveis desta versão ficam armazenadas neste navegador.</p>
        {records.length === 0 ? <p className={styles.empty}>Nenhuma partida registrada neste navegador.</p> : <div className={styles.boardCard}>
          <table className={styles.history}>
            <thead><tr><th>Data</th><th>Modo</th><th>Adversário</th><th>Resultado</th><th>Lances</th></tr></thead>
            <tbody>{records.map((record) => <tr key={record.id}><td>{new Date(record.finishedAt).toLocaleString('pt-BR')}</td><td>{record.mode === 'bot' ? 'Bot' : 'PvP local'}</td><td>{record.opponent}</td><td>{RESULT_LABEL[record.result]}</td><td>{record.moves.join(' ') || '—'}</td></tr>)}</tbody>
          </table>
        </div>}
      </main>
    </div>
  );
}
