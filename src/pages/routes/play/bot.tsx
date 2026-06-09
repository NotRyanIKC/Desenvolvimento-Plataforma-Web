import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PlayableGame from '@/components/game/PlayableGame';
import { api, ApiError } from '@/lib/apiClient';
import type { NivelDificuldade } from '@/lib/bots';
import styles from '@/styles/Game.module.css';

interface BotDTO {
  id: string;
  nome: string;
  nivelDificuldade: NivelDificuldade;
  descricao: string | null;
}

export default function BotGamePage() {
  const [bots, setBots] = useState<BotDTO[]>([]);
  const [botId, setBotId] = useState('');
  const [selected, setSelected] = useState<BotDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ bots: BotDTO[] }>('/api/bots')
      .then(({ bots: loaded }) => {
        setBots(loaded);
        setBotId(loaded[0]?.id ?? '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Falha ao carregar bots.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}><span className={styles.logoIcon}>♟</span><span>Cesu<span className={styles.logoAccent}>Chess</span></span></Link>
        <div className={styles.navLinks}><Link href="/routes/play" className={styles.navLink}>← Modos</Link><Link href="/routes/play/history" className={styles.navLink}>Histórico</Link></div>
      </nav>
      <main className={styles.main}>
        <h1 className={styles.title}>Partida contra bot</h1>
        <p className={styles.sub}>Escolha um oponente cadastrado pelo administrador. Você joga com as peças brancas.</p>
        {loading ? <p className={styles.empty}>Carregando bots…</p> : error ? <p className={styles.empty}>{error}</p> : bots.length === 0 ? <div className={styles.empty}>Nenhum bot ativo está disponível. Use o modo <Link href="/routes/play/pvp">PvP local</Link>.</div> : !selected ? (
          <section className={styles.selector}>
            <label htmlFor="botId">Oponente</label>
            <select id="botId" className={styles.select} value={botId} onChange={(e) => setBotId(e.target.value)}>
              {bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.nome} ({bot.nivelDificuldade})</option>)}
            </select>
            <button type="button" className={styles.primary} onClick={() => setSelected(bots.find((bot) => bot.id === botId) ?? null)}>Iniciar partida</button>
          </section>
        ) : <PlayableGame mode="bot" bot={selected} />}
      </main>
    </div>
  );
}
