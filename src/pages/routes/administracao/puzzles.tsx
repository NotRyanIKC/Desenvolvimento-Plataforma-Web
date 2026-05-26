/**
 * Administração → Criar Puzzles.
 * Formulário que envia POST /api/admin/puzzles (protegido por admin).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { api, ApiError } from '@/lib/apiClient';

export default function CriarPuzzle() {
  const { carregando, user } = useAdmin();

  const [fen, setFen] = useState('');
  const [solucao, setSolucao] = useState('');
  const [fase, setFase] = useState('1');
  const [rating, setRating] = useState('');
  const [temas, setTemas] = useState('');
  const [lichessId, setLichessId] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);

    const solucaoArr = solucao.trim().split(/\s+/).filter(Boolean);
    if (solucaoArr.length === 0) {
      setErro('Informe ao menos um lance na solução (UCI, separados por espaço).');
      return;
    }
    const faseNum = Number(fase);
    if (!Number.isInteger(faseNum) || faseNum < 1) {
      setErro('Fase deve ser um inteiro maior ou igual a 1.');
      return;
    }
    const ratingNum = rating.trim() === '' ? null : Number(rating);
    if (ratingNum !== null && !Number.isFinite(ratingNum)) {
      setErro('Rating inválido.');
      return;
    }
    const temasArr = temas
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSalvando(true);
    try {
      await api.post('/api/admin/puzzles', {
        fen: fen.trim(),
        solucao: solucaoArr,
        fase: faseNum,
        rating: ratingNum,
        temas: temasArr.length > 0 ? temasArr : null,
        lichessId: lichessId.trim() || null,
      });
      setOk('Puzzle criado com sucesso.');
      setFen('');
      setSolucao('');
      setRating('');
      setTemas('');
      setLichessId('');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha ao criar puzzle.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando || !user) {
    return (
      <div className={styles.root}>
        <div className={styles.gridBg} aria-hidden="true" />
        <div className={styles.loading}>Carregando…</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />

      <nav className={styles.nav}>
        <Link href="/routes/administracao" className={styles.logo}>
          <span className={styles.logoIcon}>♟</span>
          <span>
            Cesu<span className={styles.logoAccent}>Chess</span>
          </span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/routes/administracao" className={styles.navLink}>← Administração</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Criar Puzzle</h1>
          <p className={styles.sub}>Adicione um puzzle ao catálogo da plataforma.</p>
        </div>

        <form className={styles.card} onSubmit={salvar}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fen">FEN da posição</label>
            <input
              id="fen"
              className={styles.input}
              placeholder="r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25"
              value={fen}
              onChange={(e) => setFen(e.target.value)}
              disabled={salvando}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="solucao">Solução (lances UCI)</label>
            <input
              id="solucao"
              className={styles.input}
              placeholder="e6e7 b2b1 b3c1"
              value={solucao}
              onChange={(e) => setSolucao(e.target.value)}
              disabled={salvando}
            />
            <p className={styles.hint}>Lances separados por espaço, em UCI (ex.: e2e4).</p>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fase">Fase</label>
              <input
                id="fase"
                type="number"
                min={1}
                className={styles.input}
                value={fase}
                onChange={(e) => setFase(e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rating">Rating (opcional)</label>
              <input
                id="rating"
                type="number"
                min={0}
                max={4000}
                className={styles.input}
                placeholder="1200"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="temas">Temas (opcional)</label>
            <input
              id="temas"
              className={styles.input}
              placeholder="fork, middlegame, short"
              value={temas}
              onChange={(e) => setTemas(e.target.value)}
              disabled={salvando}
            />
            <p className={styles.hint}>Separados por vírgula.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="lichessId">ID do Lichess (opcional)</label>
            <input
              id="lichessId"
              className={styles.input}
              placeholder="00008"
              value={lichessId}
              onChange={(e) => setLichessId(e.target.value)}
              disabled={salvando}
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Criar puzzle'}
            </button>
            <Link href="/routes/administracao" className={styles.btnGhost}>Cancelar</Link>
          </div>

          {erro && <p className={styles.msgErr} role="alert">{erro}</p>}
          {ok && <p className={styles.msgOk} role="status">{ok}</p>}
        </form>
      </main>
    </div>
  );
}
