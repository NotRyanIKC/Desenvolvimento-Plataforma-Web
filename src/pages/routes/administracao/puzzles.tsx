/**
 * Administração → Catálogo de Puzzles (CRUD completo).
 *
 * UC-20 Cadastrar puzzle, UC-21 Consultar puzzles,
 * UC-22 Editar puzzle, UC-23 Excluir puzzle.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { api, ApiError } from '@/lib/apiClient';

interface PuzzleDTO {
  id: string;
  lichessId: string | null;
  fen: string;
  solucao: string[];
  rating: number;
  temas: string[];
  fase: number;
  ativo: boolean;
  criadoEm: string;
}

interface FormState {
  fen: string;
  solucao: string;
  fase: string;
  rating: string;
  temas: string;
  lichessId: string;
}

const FORM_VAZIO: FormState = {
  fen: '',
  solucao: '',
  fase: '1',
  rating: '',
  temas: '',
  lichessId: '',
};

function formStateFromPuzzle(p: PuzzleDTO): FormState {
  return {
    fen: p.fen,
    solucao: p.solucao.join(' '),
    fase: String(p.fase),
    rating: String(p.rating),
    temas: (p.temas ?? []).join(', '),
    lichessId: p.lichessId ?? '',
  };
}

function parseFormState(s: FormState): {
  body: Record<string, unknown>;
  erro: string | null;
} {
  const solucaoArr = s.solucao.trim().split(/\s+/).filter(Boolean);
  if (solucaoArr.length === 0) {
    return { body: {}, erro: 'Informe ao menos um lance na solução (UCI, separados por espaço).' };
  }
  const faseNum = Number(s.fase);
  if (!Number.isInteger(faseNum) || faseNum < 1) {
    return { body: {}, erro: 'Fase deve ser um inteiro maior ou igual a 1.' };
  }
  const ratingNum = s.rating.trim() === '' ? null : Number(s.rating);
  if (ratingNum !== null && !Number.isFinite(ratingNum)) {
    return { body: {}, erro: 'Rating inválido.' };
  }
  const temasArr = s.temas.split(',').map((t) => t.trim()).filter(Boolean);

  return {
    body: {
      fen: s.fen.trim(),
      solucao: solucaoArr,
      fase: faseNum,
      rating: ratingNum,
      temas: temasArr.length > 0 ? temasArr : null,
      lichessId: s.lichessId.trim() || null,
    },
    erro: null,
  };
}

export default function AdminPuzzles() {
  const { carregando, user } = useAdmin();

  const [puzzles, setPuzzles] = useState<PuzzleDTO[]>([]);
  const [listaLoading, setListaLoading] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [criarForm, setCriarForm] = useState<FormState>(FORM_VAZIO);
  const [criarErr, setCriarErr] = useState<string | null>(null);
  const [criarOk, setCriarOk] = useState<string | null>(null);
  const [salvandoCriar, setSalvandoCriar] = useState(false);

  const [editando, setEditando] = useState<PuzzleDTO | null>(null);
  const [editForm, setEditForm] = useState<FormState>(FORM_VAZIO);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [salvandoEdit, setSalvandoEdit] = useState(false);

  async function carregarLista() {
    setListaLoading(true);
    setErroLista(null);
    try {
      const data = await api.get<{ puzzles: PuzzleDTO[] }>('/api/admin/puzzles');
      setPuzzles(data.puzzles);
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

  async function criarPuzzle(e: React.FormEvent) {
    e.preventDefault();
    setCriarErr(null);
    setCriarOk(null);

    const { body, erro } = parseFormState(criarForm);
    if (erro) {
      setCriarErr(erro);
      return;
    }

    setSalvandoCriar(true);
    try {
      await api.post('/api/admin/puzzles', body);
      setCriarOk('Puzzle criado com sucesso.');
      setCriarForm(FORM_VAZIO);
      carregarLista();
    } catch (err) {
      setCriarErr(err instanceof ApiError ? err.message : 'Falha ao criar puzzle.');
    } finally {
      setSalvandoCriar(false);
    }
  }

  function abrirEditor(p: PuzzleDTO) {
    setEditando(p);
    setEditForm(formStateFromPuzzle(p));
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

    const { body, erro } = parseFormState(editForm);
    if (erro) {
      setEditErr(erro);
      return;
    }

    setSalvandoEdit(true);
    try {
      await api.patch(`/api/admin/puzzles/${editando.id}`, body);
      fecharEditor();
      carregarLista();
    } catch (err) {
      setEditErr(err instanceof ApiError ? err.message : 'Falha ao salvar alterações.');
    } finally {
      setSalvandoEdit(false);
    }
  }

  async function excluirPuzzle(p: PuzzleDTO) {
    const ok = window.confirm(
      `Excluir o puzzle ${p.lichessId ?? p.id.slice(0, 8)}? Esta ação não pode ser desfeita.`
    );
    if (!ok) return;

    try {
      await api.delete(`/api/admin/puzzles/${p.id}`);
      carregarLista();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao excluir puzzle.');
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
          <span>Cesu<span className={styles.logoAccent}>Chess</span></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/routes/administracao" className={styles.navLink}>← Administração</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Catálogo de Puzzles</h1>
          <p className={styles.sub}>Cadastre, edite e remova puzzles do catálogo da plataforma.</p>
        </div>

        <form className={styles.card} onSubmit={criarPuzzle}>
          <h2 className={styles.cardTitle}>Novo puzzle</h2>
          <p className={styles.cardSub}>Preencha os campos abaixo e clique em &ldquo;Criar puzzle&rdquo;.</p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="fen">FEN da posição</label>
            <input id="fen" className={styles.input}
              placeholder="r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2bR/PqP3PP/7K w - - 0 25"
              value={criarForm.fen}
              onChange={(e) => setCriarForm((f) => ({ ...f, fen: e.target.value }))}
              disabled={salvandoCriar} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="solucao">Solução (lances UCI)</label>
            <input id="solucao" className={styles.input}
              placeholder="e6e7 b2b1 b3c1"
              value={criarForm.solucao}
              onChange={(e) => setCriarForm((f) => ({ ...f, solucao: e.target.value }))}
              disabled={salvandoCriar} />
            <p className={styles.hint}>Lances separados por espaço, em UCI (ex.: e2e4).</p>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fase">Fase</label>
              <input id="fase" type="number" min={1} className={styles.input}
                value={criarForm.fase}
                onChange={(e) => setCriarForm((f) => ({ ...f, fase: e.target.value }))}
                disabled={salvandoCriar} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rating">Rating (opcional)</label>
              <input id="rating" type="number" min={0} max={4000} className={styles.input}
                placeholder="1200"
                value={criarForm.rating}
                onChange={(e) => setCriarForm((f) => ({ ...f, rating: e.target.value }))}
                disabled={salvandoCriar} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="temas">Temas (opcional)</label>
            <input id="temas" className={styles.input}
              placeholder="fork, middlegame, short"
              value={criarForm.temas}
              onChange={(e) => setCriarForm((f) => ({ ...f, temas: e.target.value }))}
              disabled={salvandoCriar} />
            <p className={styles.hint}>Separados por vírgula.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="lichessId">ID do Lichess (opcional)</label>
            <input id="lichessId" className={styles.input}
              placeholder="00008"
              value={criarForm.lichessId}
              onChange={(e) => setCriarForm((f) => ({ ...f, lichessId: e.target.value }))}
              disabled={salvandoCriar} />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary} disabled={salvandoCriar}>
              {salvandoCriar ? 'Salvando…' : 'Criar puzzle'}
            </button>
          </div>

          {criarErr && <p className={styles.msgErr} role="alert">{criarErr}</p>}
          {criarOk && <p className={styles.msgOk} role="status">{criarOk}</p>}
        </form>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Puzzles cadastrados</h2>
          <p className={styles.cardSub}>
            {puzzles.length} puzzle{puzzles.length === 1 ? '' : 's'} no catálogo.
          </p>

          {listaLoading ? (
            <div className={styles.loading}>Carregando…</div>
          ) : erroLista ? (
            <p className={styles.msgErr}>{erroLista}</p>
          ) : puzzles.length === 0 ? (
            <p className={styles.empty}>Nenhum puzzle cadastrado ainda.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Lichess ID</th>
                    <th>FEN</th>
                    <th>Fase</th>
                    <th>Rating</th>
                    <th>Ativo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {puzzles.map((p) => (
                    <tr key={p.id}>
                      <td>{p.lichessId ?? '—'}</td>
                      <td className={styles.cellMono} title={p.fen}>{p.fen}</td>
                      <td>{p.fase}</td>
                      <td>{p.rating}</td>
                      <td>
                        <span className={p.ativo ? `${styles.pill} ${styles.pillOn}` : `${styles.pill} ${styles.pillOff}`}>
                          {p.ativo ? 'sim' : 'não'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.btnSmall} onClick={() => abrirEditor(p)}>Editar</button>
                          <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => excluirPuzzle(p)}>Excluir</button>
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
              <h2 className={styles.modalTitle}>
                Editar puzzle {editando.lichessId ?? editando.id.slice(0, 8)}
              </h2>

              <div className={styles.field}>
                <label className={styles.label}>FEN da posição</label>
                <input className={styles.input}
                  value={editForm.fen}
                  onChange={(e) => setEditForm((f) => ({ ...f, fen: e.target.value }))}
                  disabled={salvandoEdit} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Solução (lances UCI)</label>
                <input className={styles.input}
                  value={editForm.solucao}
                  onChange={(e) => setEditForm((f) => ({ ...f, solucao: e.target.value }))}
                  disabled={salvandoEdit} />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Fase</label>
                  <input type="number" min={1} className={styles.input}
                    value={editForm.fase}
                    onChange={(e) => setEditForm((f) => ({ ...f, fase: e.target.value }))}
                    disabled={salvandoEdit} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Rating</label>
                  <input type="number" min={0} max={4000} className={styles.input}
                    value={editForm.rating}
                    onChange={(e) => setEditForm((f) => ({ ...f, rating: e.target.value }))}
                    disabled={salvandoEdit} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Temas</label>
                <input className={styles.input}
                  value={editForm.temas}
                  onChange={(e) => setEditForm((f) => ({ ...f, temas: e.target.value }))}
                  disabled={salvandoEdit} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>ID do Lichess</label>
                <input className={styles.input}
                  value={editForm.lichessId}
                  onChange={(e) => setEditForm((f) => ({ ...f, lichessId: e.target.value }))}
                  disabled={salvandoEdit} />
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
