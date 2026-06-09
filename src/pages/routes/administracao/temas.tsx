import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { api, ApiError } from '@/lib/apiClient';

interface TemaDTO {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  puzzlesAssociados: number;
  criadoEm: string;
  atualizadoEm: string;
}

export default function AdminTemas() {
  const { carregando, user } = useAdmin();
  const [temas, setTemas] = useState<TemaDTO[]>([]);
  const [listaLoading, setListaLoading] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [criarErr, setCriarErr] = useState<string | null>(null);
  const [criarOk, setCriarOk] = useState<string | null>(null);
  const [salvandoCriar, setSalvandoCriar] = useState(false);
  const [editando, setEditando] = useState<TemaDTO | null>(null);
  const [eNome, setENome] = useState('');
  const [eDescricao, setEDescricao] = useState('');
  const [eAtivo, setEAtivo] = useState(true);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [salvandoEdit, setSalvandoEdit] = useState(false);

  async function carregarLista() {
    setListaLoading(true);
    setErroLista(null);
    try {
      const data = await api.get<{ temas: TemaDTO[] }>('/api/admin/temas');
      setTemas(data.temas);
    } catch (err) {
      setErroLista(err instanceof ApiError ? err.message : 'Falha ao carregar temas.');
    } finally {
      setListaLoading(false);
    }
  }

  useEffect(() => {
    if (carregando || !user) return;
    const timer = window.setTimeout(() => void carregarLista(), 0);
    return () => window.clearTimeout(timer);
  }, [carregando, user]);

  const temasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return temas;
    return temas.filter((tema) =>
      `${tema.nome} ${tema.descricao ?? ''}`.toLowerCase().includes(termo)
    );
  }, [busca, temas]);

  async function criarTema(e: React.FormEvent) {
    e.preventDefault();
    setCriarErr(null);
    setCriarOk(null);
    setSalvandoCriar(true);
    try {
      await api.post('/api/admin/temas', {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        ativo,
      });
      setNome('');
      setDescricao('');
      setAtivo(true);
      setCriarOk('Tema criado com sucesso.');
      await carregarLista();
    } catch (err) {
      setCriarErr(err instanceof ApiError ? err.message : 'Falha ao criar tema.');
    } finally {
      setSalvandoCriar(false);
    }
  }

  function abrirEditor(tema: TemaDTO) {
    setEditando(tema);
    setENome(tema.nome);
    setEDescricao(tema.descricao ?? '');
    setEAtivo(tema.ativo);
    setEditErr(null);
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setSalvandoEdit(true);
    setEditErr(null);
    try {
      await api.patch(`/api/admin/temas/${editando.id}`, {
        nome: eNome.trim(),
        descricao: eDescricao.trim() || null,
        ativo: eAtivo,
      });
      setEditando(null);
      await carregarLista();
    } catch (err) {
      setEditErr(err instanceof ApiError ? err.message : 'Falha ao atualizar tema.');
    } finally {
      setSalvandoEdit(false);
    }
  }

  async function excluirTema(tema: TemaDTO) {
    if (!window.confirm(`Excluir o tema "${tema.nome}"?`)) return;
    try {
      await api.delete(`/api/admin/temas/${tema.id}`);
      await carregarLista();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao excluir tema.');
    }
  }

  if (carregando || !user) {
    return <div className={styles.root}><div className={styles.loading}>Carregando…</div></div>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}><span className={styles.logoIcon}>♟</span><span>Cesu<span className={styles.logoAccent}>Chess</span></span></Link>
        <div className={styles.navLinks}>
          <Link href="/routes/administracao" className={styles.navLink}>← Administração</Link>
          <Link href="/routes/administracao/puzzles" className={styles.navLink}>Puzzles</Link>
          <Link href="/routes/profile" className={styles.navLink}>Perfil</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gerenciar Temas</h1>
          <p className={styles.sub}>Cadastre classificações táticas para os puzzles.</p>
        </div>

        <form className={styles.card} onSubmit={criarTema}>
          <h2 className={styles.cardTitle}>Novo tema</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="temaNome">Nome</label>
            <input id="temaNome" className={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Garfo" disabled={salvandoCriar} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="temaDescricao">Descrição</label>
            <textarea id="temaDescricao" className={styles.textarea} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ataque simultâneo a duas peças." disabled={salvandoCriar} />
          </div>
          <label className={styles.label}><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={salvandoCriar} /> Ativo</label>
          <div className={styles.actions}><button className={styles.btnPrimary} type="submit" disabled={salvandoCriar}>{salvandoCriar ? 'Salvando…' : 'Criar tema'}</button></div>
          {criarErr && <p className={styles.msgErr} role="alert">{criarErr}</p>}
          {criarOk && <p className={styles.msgOk} role="status">{criarOk}</p>}
        </form>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Temas cadastrados</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="temaBusca">Pesquisar</label>
            <input id="temaBusca" className={styles.input} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite parte do nome ou descrição" />
          </div>
          {listaLoading ? <p className={styles.loading}>Carregando…</p> : erroLista ? <p className={styles.msgErr}>{erroLista}</p> : temasFiltrados.length === 0 ? <p className={styles.empty}>Nenhum tema encontrado.</p> : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Nome</th><th>Descrição</th><th>Puzzles</th><th>Ativo</th><th>Ações</th></tr></thead>
                <tbody>{temasFiltrados.map((tema) => <tr key={tema.id}>
                  <td>{tema.nome}</td><td>{tema.descricao ?? '—'}</td><td>{tema.puzzlesAssociados}</td>
                  <td><span className={tema.ativo ? `${styles.pill} ${styles.pillOn}` : `${styles.pill} ${styles.pillOff}`}>{tema.ativo ? 'sim' : 'não'}</span></td>
                  <td><div className={styles.rowActions}><button className={styles.btnSmall} onClick={() => abrirEditor(tema)}>Editar</button><button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => void excluirTema(tema)}>Excluir</button></div></td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </div>

        {editando && <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && setEditando(null)}>
          <form className={styles.modal} onSubmit={salvarEdicao}>
            <h2 className={styles.modalTitle}>Editar tema</h2>
            <div className={styles.field}><label className={styles.label}>Nome</label><input className={styles.input} value={eNome} onChange={(e) => setENome(e.target.value)} /></div>
            <div className={styles.field}><label className={styles.label}>Descrição</label><textarea className={styles.textarea} value={eDescricao} onChange={(e) => setEDescricao(e.target.value)} /></div>
            <label className={styles.label}><input type="checkbox" checked={eAtivo} onChange={(e) => setEAtivo(e.target.checked)} /> Ativo</label>
            <div className={styles.actions}><button type="submit" className={styles.btnPrimary} disabled={salvandoEdit}>Salvar alterações</button><button type="button" className={styles.btnGhost} onClick={() => setEditando(null)}>Cancelar</button></div>
            {editErr && <p className={styles.msgErr} role="alert">{editErr}</p>}
          </form>
        </div>}
      </main>
    </div>
  );
}
