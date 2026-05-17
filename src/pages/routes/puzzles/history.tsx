/**
 * Tela de Histórico — CRUD de Puzzles Resolvidos.
 *
 *   CREATE  → POST   /api/puzzles/solved                 (modal "Registrar puzzle")
 *   READ    → GET    /api/puzzles/solved                 (lista ao montar)
 *   UPDATE  → PATCH  /api/puzzles/solved/[id]            (editar anotação/status)
 *   DELETE  → DELETE /api/puzzles/solved/[id]            (botão remover)
 *
 * Tudo passa pelo cookie de sessão; quem não está logado é redirecionado.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/PuzzleHistory.module.css';
import { api, ApiError, type PuzzleResolvido } from '@/lib/apiClient';

type EditState =
  | { tipo: 'create' }
  | { tipo: 'edit'; puzzle: PuzzleResolvido }
  | null;

export default function PuzzleHistory() {
  const router = useRouter();

  const [puzzles, setPuzzles] = useState<PuzzleResolvido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<EditState>(null);

  async function recarregar() {
    try {
      const { puzzles } = await api.get<{ puzzles: PuzzleResolvido[] }>(
        '/api/puzzles/solved'
      );
      setPuzzles(puzzles);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/routes/login');
        return;
      }
      setErro(err instanceof Error ? err.message : 'Falha ao carregar.');
    }
  }

  useEffect(() => {
    (async () => {
      await recarregar();
      setCarregando(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remover(id: number) {
    if (!window.confirm('Remover este registro do histórico?')) return;
    try {
      await api.delete(`/api/puzzles/solved/${id}`);
      setPuzzles((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha ao remover.');
    }
  }

  if (carregando) {
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
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>♟</span>
          <span>
            Cesu<span className={styles.logoAccent}>Chess</span>
          </span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/routes/puzzles" className={styles.navLink}>Problemas</Link>
          <Link href="/routes/profile" className={styles.navLink}>Perfil</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Meu histórico de puzzles</h1>
            <p className={styles.sub}>
              {puzzles.length} {puzzles.length === 1 ? 'registro' : 'registros'}.
            </p>
          </div>
          <button
            className={styles.btnAdd}
            onClick={() => setEditando({ tipo: 'create' })}
          >
            + Registrar puzzle
          </button>
        </div>

        {erro && <p className={styles.msgErr} role="alert">{erro}</p>}

        {puzzles.length === 0 ? (
          <div className={styles.empty}>
            <p>Você ainda não registrou nenhum puzzle.</p>
            <p>
              Clique em <strong>Registrar puzzle</strong> para começar a
              acompanhar seu progresso.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {puzzles.map((p) => (
              <article key={p.id} className={styles.item}>
                <div className={styles.fase}>{p.fase}</div>
                <div className={styles.meta}>
                  <div className={styles.metaTop}>
                    <span className={styles.puzzleId}>#{p.puzzleId}</span>
                    {p.rating !== null && (
                      <span className={styles.rating}>
                        rating {p.rating}
                      </span>
                    )}
                    <span className={styles.rating}>
                      {p.tentativas}{' '}
                      {p.tentativas === 1 ? 'tentativa' : 'tentativas'}
                    </span>
                    <span
                      className={`${styles.status} ${
                        p.acertou ? styles.statusOk : styles.statusFail
                      }`}
                    >
                      {p.acertou ? 'Resolvido' : 'Não resolvido'}
                    </span>
                  </div>
                  {p.anotacao && (
                    <div className={styles.anotacao}>“{p.anotacao}”</div>
                  )}
                  <div className={styles.rating}>
                    em {new Date(p.resolvidoEm).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className={styles.acoes}>
                  <button
                    className={styles.btnSm}
                    onClick={() => setEditando({ tipo: 'edit', puzzle: p })}
                  >
                    Editar
                  </button>
                  <button
                    className={`${styles.btnSm} ${styles.btnDanger}`}
                    onClick={() => remover(p.id)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {editando && (
        <EditModal
          state={editando}
          onClose={() => setEditando(null)}
          onSaved={async () => {
            setEditando(null);
            await recarregar();
          }}
        />
      )}
    </div>
  );
}

/* ─── Modal compartilhado para create/edit ────────────────── */

interface EditModalProps {
  state: NonNullable<EditState>;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

function EditModal({ state, onClose, onSaved }: EditModalProps) {
  const isCreate = state.tipo === 'create';

  const [puzzleId, setPuzzleId] = useState(
    isCreate ? '' : state.puzzle.puzzleId
  );
  const [fase, setFase] = useState<number>(isCreate ? 1 : state.puzzle.fase);
  const [rating, setRating] = useState<string>(
    isCreate ? '' : state.puzzle.rating?.toString() ?? ''
  );
  const [tentativas, setTentativas] = useState<number>(
    isCreate ? 1 : state.puzzle.tentativas
  );
  const [acertou, setAcertou] = useState<boolean>(
    isCreate ? true : state.puzzle.acertou
  );
  const [anotacao, setAnotacao] = useState<string>(
    isCreate ? '' : state.puzzle.anotacao ?? ''
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (isCreate && !puzzleId.trim()) {
      setErro('Informe o ID do puzzle (Lichess).');
      return;
    }
    const ratingNum = rating.trim() === '' ? null : Number(rating);
    if (ratingNum !== null && !Number.isFinite(ratingNum)) {
      setErro('Rating inválido.');
      return;
    }

    setSalvando(true);
    try {
      if (isCreate) {
        await api.post('/api/puzzles/solved', {
          puzzleId: puzzleId.trim(),
          fase,
          rating: ratingNum,
          tentativas,
          acertou,
          anotacao: anotacao || null,
        });
      } else {
        await api.patch(`/api/puzzles/solved/${state.puzzle.id}`, {
          acertou,
          tentativas,
          anotacao: anotacao || null,
        });
      }
      await onSaved();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={salvar}
      >
        <h2 className={styles.modalTitle}>
          {isCreate ? 'Registrar puzzle' : `Editar puzzle #${state.puzzle.puzzleId}`}
        </h2>

        {isCreate && (
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="puzzleId">
                ID do puzzle (Lichess)
              </label>
              <input
                id="puzzleId"
                className={styles.input}
                value={puzzleId}
                onChange={(e) => setPuzzleId(e.target.value)}
                placeholder="00008"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fase">Fase</label>
              <input
                id="fase"
                type="number"
                min={1}
                className={styles.input}
                value={fase}
                onChange={(e) => setFase(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className={styles.row}>
          {isCreate && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rating">Rating</label>
              <input
                id="rating"
                type="number"
                className={styles.input}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="1830"
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tentativas">Tentativas</label>
            <input
              id="tentativas"
              type="number"
              min={1}
              className={styles.input}
              value={tentativas}
              onChange={(e) => setTentativas(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.checkRow}>
          <input
            id="acertou"
            type="checkbox"
            checked={acertou}
            onChange={(e) => setAcertou(e.target.checked)}
          />
          <label htmlFor="acertou">Resolvido com sucesso</label>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="anotacao">
            Anotação (opcional)
          </label>
          <textarea
            id="anotacao"
            className={styles.textarea}
            value={anotacao}
            onChange={(e) => setAnotacao(e.target.value)}
            placeholder="Ex.: errei o sacrifício de dama, revisar tática de fork"
          />
        </div>

        {erro && <p className={styles.msgErr}>{erro}</p>}

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={salvando}
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
