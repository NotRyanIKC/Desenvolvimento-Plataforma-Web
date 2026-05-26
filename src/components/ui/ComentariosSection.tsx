/**
 * src/components/ui/ComentariosSection.tsx
 *
 * Seção de comentários que aparece na página de resolução de puzzle.
 * Implementa o CRUD completo de comentários (UC-16 a UC-19) consumindo
 * /api/comentarios. Funciona em modo anônimo (só leitura, UC-17) ou
 * autenticado (publicar / editar próprios / excluir próprios).
 */

import React, { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/apiClient';
import styles from '@/styles/Comentarios.module.css';

interface ComentarioDTO {
  id: string;
  puzzleLichessId: string;
  texto: string;
  autor: {
    jogadorId: string;
    nome: string;
    username: string;
  };
  criadoEm: string;
  atualizadoEm: string;
  pertenceAoLeitor: boolean;
}

interface Props {
  puzzleLichessId: string;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ComentariosSection({ puzzleLichessId }: Props) {
  const [comentarios, setComentarios] = useState<ComentarioDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [novoTexto, setNovoTexto] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [erroPub, setErroPub] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTexto, setEditTexto] = useState('');
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    setErroLista(null);
    try {
      const data = await api.get<{ comentarios: ComentarioDTO[] }>(
        `/api/comentarios?puzzleId=${encodeURIComponent(puzzleLichessId)}`
      );
      setComentarios(data.comentarios);
    } catch (err) {
      setErroLista(
        err instanceof ApiError ? err.message : 'Falha ao carregar comentários.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleLichessId]);

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setErroPub(null);

    if (novoTexto.trim().length === 0) {
      setErroPub('O comentário não pode estar vazio.');
      return;
    }
    if (novoTexto.trim().length > 1000) {
      setErroPub('O comentário deve ter no máximo 1000 caracteres.');
      return;
    }

    setPublicando(true);
    try {
      await api.post('/api/comentarios', {
        puzzleLichessId,
        texto: novoTexto,
      });
      setNovoTexto('');
      carregar();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setErroPub('Você precisa estar logado para publicar comentários.');
      } else {
        setErroPub(err instanceof ApiError ? err.message : 'Falha ao publicar.');
      }
    } finally {
      setPublicando(false);
    }
  }

  function iniciarEdicao(c: ComentarioDTO) {
    setEditandoId(c.id);
    setEditTexto(c.texto);
    setErroEdit(null);
  }
  function cancelarEdicao() {
    setEditandoId(null);
    setEditTexto('');
    setErroEdit(null);
  }

  async function salvarEdicao() {
    if (!editandoId) return;
    setErroEdit(null);

    if (editTexto.trim().length === 0) {
      setErroEdit('O comentário não pode estar vazio.');
      return;
    }

    setSalvandoEdit(true);
    try {
      await api.patch(`/api/comentarios/${editandoId}`, { texto: editTexto });
      cancelarEdicao();
      carregar();
    } catch (err) {
      setErroEdit(err instanceof ApiError ? err.message : 'Falha ao salvar edição.');
    } finally {
      setSalvandoEdit(false);
    }
  }

  async function excluir(c: ComentarioDTO) {
    const ok = window.confirm('Excluir este comentário?');
    if (!ok) return;
    try {
      await api.delete(`/api/comentarios/${c.id}`);
      carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Falha ao excluir.');
    }
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          Comentários
          <span className={styles.count}>{comentarios.length}</span>
        </h2>
      </header>

      <form className={styles.composer} onSubmit={publicar}>
        <textarea className={styles.textarea}
          placeholder="Compartilhe sua análise ou tática usada nesse puzzle…"
          value={novoTexto}
          onChange={(e) => setNovoTexto(e.target.value)}
          maxLength={1000}
          rows={3}
          disabled={publicando} />
        <div className={styles.composerFoot}>
          <span className={styles.charCount}>{novoTexto.trim().length}/1000</span>
          <button type="submit" className={styles.btnPrimary}
            disabled={publicando || novoTexto.trim().length === 0}>
            {publicando ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
        {erroPub && <p className={styles.msgErr} role="alert">{erroPub}</p>}
      </form>

      {carregando ? (
        <div className={styles.empty}>Carregando comentários…</div>
      ) : erroLista ? (
        <div className={styles.msgErr}>{erroLista}</div>
      ) : comentarios.length === 0 ? (
        <div className={styles.empty}>
          Ainda não há comentários neste puzzle. Seja o primeiro!
        </div>
      ) : (
        <ul className={styles.lista}>
          {comentarios.map((c) => {
            const editado = c.criadoEm !== c.atualizadoEm;
            const editandoEste = editandoId === c.id;
            return (
              <li key={c.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <span className={styles.autor}>
                    {c.autor.nome}{' '}
                    <span className={styles.username}>@{c.autor.username}</span>
                  </span>
                  <span className={styles.data}>
                    {formatarData(c.criadoEm)}
                    {editado && <span className={styles.editadoTag}> · editado</span>}
                  </span>
                </div>

                {editandoEste ? (
                  <div className={styles.editArea}>
                    <textarea className={styles.textarea}
                      value={editTexto}
                      onChange={(e) => setEditTexto(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      disabled={salvandoEdit} />
                    <div className={styles.editActions}>
                      <button className={styles.btnSmall}
                        onClick={salvarEdicao}
                        disabled={salvandoEdit}>
                        {salvandoEdit ? 'Salvando…' : 'Salvar'}
                      </button>
                      <button className={`${styles.btnSmall} ${styles.btnGhost}`}
                        onClick={cancelarEdicao}
                        disabled={salvandoEdit}>
                        Cancelar
                      </button>
                    </div>
                    {erroEdit && <p className={styles.msgErr} role="alert">{erroEdit}</p>}
                  </div>
                ) : (
                  <p className={styles.texto}>{c.texto}</p>
                )}

                {c.pertenceAoLeitor && !editandoEste && (
                  <div className={styles.itemActions}>
                    <button className={styles.btnSmall} onClick={() => iniciarEdicao(c)}>
                      Editar
                    </button>
                    <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => excluir(c)}>
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
