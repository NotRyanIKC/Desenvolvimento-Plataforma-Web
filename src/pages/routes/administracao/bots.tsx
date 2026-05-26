/**
 * Administração → Criar Bots.
 * Formulário que envia POST /api/admin/bots (protegido por admin).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { api, ApiError } from '@/lib/apiClient';

type Nivel = 'facil' | 'medio' | 'dificil';

export default function CriarBot() {
  const { carregando, user } = useAdmin();

  const [nome, setNome] = useState('');
  const [nivelDificuldade, setNivelDificuldade] = useState<Nivel>('facil');
  const [descricao, setDescricao] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (nome.trim().length < 2) {
      setErro('Nome do bot deve ter no mínimo 2 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      await api.post('/api/admin/bots', {
        nome: nome.trim(),
        nivelDificuldade,
        descricao: descricao.trim() || null,
      });
      setOk('Bot criado com sucesso.');
      setNome('');
      setDescricao('');
      setNivelDificuldade('facil');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha ao criar bot.');
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
          <h1 className={styles.title}>Criar Bot</h1>
          <p className={styles.sub}>Cadastre um oponente artificial.</p>
        </div>

        <form className={styles.card} onSubmit={salvar}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nome">Nome</label>
            <input
              id="nome"
              className={styles.input}
              placeholder="Maia 1"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={salvando}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nivel">Nível de dificuldade</label>
            <select
              id="nivel"
              className={styles.select}
              value={nivelDificuldade}
              onChange={(e) => setNivelDificuldade(e.target.value as Nivel)}
              disabled={salvando}
            >
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="descricao">Descrição (opcional)</label>
            <textarea
              id="descricao"
              className={styles.textarea}
              placeholder="Bot iniciante, joga aberturas clássicas…"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={salvando}
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Criar bot'}
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
