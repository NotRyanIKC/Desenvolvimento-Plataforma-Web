/**
 * Administração → Gerenciar Bots (CRUD completo).
 *
 * UC-24 Cadastrar bot, UC-25 Consultar bots,
 * UC-26 Editar bot, UC-27 Excluir bot.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { api, ApiError } from '@/lib/apiClient';

type Nivel = 'facil' | 'medio' | 'dificil';

interface BotDTO {
  id: string;
  nome: string;
  nivelDificuldade: Nivel;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
}

const LABEL_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

export default function AdminBots() {
  const { carregando, user } = useAdmin();

  const [bots, setBots] = useState<BotDTO[]>([]);
  const [listaLoading, setListaLoading] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [cNome, setCNome] = useState('');
  const [cNivel, setCNivel] = useState<Nivel>('facil');
  const [cDescricao, setCDescricao] = useState('');
  const [criarErr, setCriarErr] = useState<string | null>(null);
  const [criarOk, setCriarOk] = useState<string | null>(null);
  const [salvandoCriar, setSalvandoCriar] = useState(false);

  const [editando, setEditando] = useState<BotDTO | null>(null);
  const [eNome, setENome] = useState('');
  const [eNivel, setENivel] = useState<Nivel>('facil');
  const [eDescricao, setEDescricao] = useState('');
  const [eAtivo, setEAtivo] = useState(true);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [salvandoEdit, setSalvandoEdit] = useState(false);

  async function carregarLista() {
    setListaLoading(true);
    setErroLista(null);
    try {
      const data = await api.get<{ bots: BotDTO[] }>('/api/admin/bots');
      setBots(data.bots);
    } catch (err) {
      setErroLista(err instanceof ApiError ? err.message : 'Falha ao carregar lista.');
    } finally {
      setListaLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!carregando && user) carregarLista();
  }, [carregando, user]);

  async function criarBot(e: React.FormEvent) {
    e.preventDefault();
    setCriarErr(null);
    setCriarOk(null);

    if (cNome.trim().length < 2) {
      setCriarErr('Nome do bot deve ter no mínimo 2 caracteres.');
      return;
    }

    setSalvandoCriar(true);
    try {
      await api.post('/api/admin/bots', {
        nome: cNome.trim(),
        nivelDificuldade: cNivel,
        descricao: cDescricao.trim() || null,
      });
      setCriarOk('Bot criado com sucesso.');
      setCNome('');
      setCDescricao('');
      setCNivel('facil');
      carregarLista();
    } catch (err) {
      setCriarErr(err instanceof ApiError ? err.message : 'Falha ao criar bot.');
    } finally {
      setSalvandoCriar(false);
    }
  }

  function abrirEditor(b: BotDTO) {
    setEditando(b);
    setENome(b.nome);
    setENivel(b.nivelDificuldade);
    setEDescricao(b.descricao ?? '');
    setEAtivo(b.ativo);
    setEditErr(null);
  }
  function fecharEditor() {
    setEditando(null);
    setEditErr(null);
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setEditErr(null);

    if (eNome.trim().length < 2) {
      setEditErr('Nome do bot deve ter no mínimo 2 caracteres.');
      return;
    }

    setSalvandoEdit(true);
    try {
      await api.patch(`/api/admin/bots/${editando.id}`, {
        nome: eNome.trim(),
        nivelDificuldade: eNivel,
        descricao: eDescricao.trim() || null,
        ativo: eAtivo,
      });
      fecharEditor();
      carregarLista();
    } catch (err) {
      setEditErr(err instanceof ApiError ? err.message : 'Falha ao salvar alterações.');
    } finally {
      setSalvandoEdit(false);
    }
  }

  async function excluirBot(b: BotDTO) {
    const ok = window.confirm(`Excluir o bot "${b.nome}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    try {
      await api.delete(`/api/admin/bots/${b.id}`);
      carregarLista();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao excluir bot.');
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
          <h1 className={styles.title}>Gerenciar Bots</h1>
          <p className={styles.sub}>Cadastre, edite e remova oponentes artificiais.</p>
        </div>

        <form className={styles.card} onSubmit={criarBot}>
          <h2 className={styles.cardTitle}>Novo bot</h2>
          <p className={styles.cardSub}>Preencha os dados e clique em &ldquo;Criar bot&rdquo;.</p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cNome">Nome</label>
            <input id="cNome" className={styles.input}
              placeholder="Maia 1"
              value={cNome}
              onChange={(e) => setCNome(e.target.value)}
              disabled={salvandoCriar} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cNivel">Nível de dificuldade</label>
            <select id="cNivel" className={styles.select}
              value={cNivel}
              onChange={(e) => setCNivel(e.target.value as Nivel)}
              disabled={salvandoCriar}>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cDescricao">Descrição (opcional)</label>
            <textarea id="cDescricao" className={styles.textarea}
              placeholder="Bot iniciante, joga aberturas clássicas…"
              value={cDescricao}
              onChange={(e) => setCDescricao(e.target.value)}
              disabled={salvandoCriar} />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary} disabled={salvandoCriar}>
              {salvandoCriar ? 'Salvando…' : 'Criar bot'}
            </button>
          </div>

          {criarErr && <p className={styles.msgErr} role="alert">{criarErr}</p>}
          {criarOk && <p className={styles.msgOk} role="status">{criarOk}</p>}
        </form>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Bots cadastrados</h2>
          <p className={styles.cardSub}>
            {bots.length} bot{bots.length === 1 ? '' : 's'} no total.
          </p>

          {listaLoading ? (
            <div className={styles.loading}>Carregando…</div>
          ) : erroLista ? (
            <p className={styles.msgErr}>{erroLista}</p>
          ) : bots.length === 0 ? (
            <p className={styles.empty}>Nenhum bot cadastrado ainda.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Nível</th>
                    <th>Descrição</th>
                    <th>Ativo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((b) => (
                    <tr key={b.id}>
                      <td>{b.nome}</td>
                      <td>{LABEL_NIVEL[b.nivelDificuldade]}</td>
                      <td>{b.descricao ?? '—'}</td>
                      <td>
                        <span className={b.ativo ? `${styles.pill} ${styles.pillOn}` : `${styles.pill} ${styles.pillOff}`}>
                          {b.ativo ? 'sim' : 'não'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.btnSmall} onClick={() => abrirEditor(b)}>Editar</button>
                          <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => excluirBot(b)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editando && (
          <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && fecharEditor()}>
            <form className={styles.modal} onSubmit={salvarEdicao}>
              <h2 className={styles.modalTitle}>Editar bot {editando.nome}</h2>

              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input className={styles.input}
                  value={eNome}
                  onChange={(e) => setENome(e.target.value)}
                  disabled={salvandoEdit} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nível</label>
                <select className={styles.select}
                  value={eNivel}
                  onChange={(e) => setENivel(e.target.value as Nivel)}
                  disabled={salvandoEdit}>
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Descrição</label>
                <textarea className={styles.textarea}
                  value={eDescricao}
                  onChange={(e) => setEDescricao(e.target.value)}
                  disabled={salvandoEdit} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <input type="checkbox"
                    checked={eAtivo}
                    onChange={(e) => setEAtivo(e.target.checked)}
                    disabled={salvandoEdit} /> Ativo
                </label>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.btnPrimary} disabled={salvandoEdit}>
                  {salvandoEdit ? 'Salvando…' : 'Salvar alterações'}
                </button>
                <button type="button" className={styles.btnGhost} onClick={fecharEditor} disabled={salvandoEdit}>
                  Cancelar
                </button>
              </div>

              {editErr && <p className={styles.msgErr} role="alert">{editErr}</p>}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
