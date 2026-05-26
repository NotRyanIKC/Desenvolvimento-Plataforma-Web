/**
 * /routes/puzzles/mestres — Puzzles dos Mestres.
 *
 * Resolve puzzles do catálogo da plataforma (cadastrados por administradores
 * em /routes/administracao/puzzles), buscados via GET /api/puzzles/mestres.
 *
 * Fluxo: lista/grade de puzzles ativos → o jogador escolhe um → resolve no
 * tabuleiro. Ao concluir, registra no histórico (POST /api/puzzles/solved,
 * silencioso para visitantes não autenticados). Página separada do fluxo de
 * níveis ([phase].tsx) e da página do Lichess (lichess.tsx) — de propósito,
 * para não tocar nos solvers existentes.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/ui/ChessBoard';
import ComentariosSection from '@/components/ui/ComentariosSection';
import { applyMove } from '@/lib/chessEngine';
import { api, ApiError } from '@/lib/apiClient';
import styles from '@/styles/PuzzleMestres.module.css';
import type { Square } from '@/types/chess';

interface PuzzleMestre {
  id: string;
  nome: string | null;
  fen: string;
  solucao: string[];
  rating: number;
  temas: string[];
  fase: number;
}

type Estado = 'jogando' | 'errou' | 'completou';

/** Registra o puzzle como resolvido. Best-effort: visitante anônimo recebe 401 e é ignorado. */
function registrarResolvido(p: PuzzleMestre, tentativas: number): void {
  api
    .post('/api/puzzles/solved', {
      puzzleId: p.id,
      fase: p.fase,
      rating: p.rating,
      tentativas,
      acertou: true,
    })
    .catch(() => undefined);
}

export default function PuzzlesMestresPage() {
  const [puzzles, setPuzzles] = useState<PuzzleMestre[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [selecionado, setSelecionado] = useState<PuzzleMestre | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [step, setStep] = useState(0);
  const [estado, setEstado] = useState<Estado>('jogando');
  const [tentativas, setTentativas] = useState(1);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregarLista = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await api.get<{ puzzles: PuzzleMestre[] }>('/api/puzzles/mestres');
      setPuzzles(data.puzzles);
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Falha ao carregar os puzzles.'
      );
      setPuzzles([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarLista();
  }, [carregarLista]);

  // Inicializa o tabuleiro quando um puzzle é escolhido.
  useEffect(() => {
    if (!selecionado) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGame(new Chess(selecionado.fen));
    setStep(0);
    setEstado('jogando');
    setMensagem(null);
    setTentativas(1);
  }, [selecionado]);

  const reiniciar = useCallback(() => {
    if (!selecionado) return;
    setGame(new Chess(selecionado.fen));
    setStep(0);
    setEstado('jogando');
    setMensagem(null);
    setTentativas((t) => t + 1);
  }, [selecionado]);

  const voltarLista = useCallback(() => {
    setSelecionado(null);
    setGame(null);
  }, []);

  const handlePieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      if (!selecionado || !game || estado !== 'jogando') return false;

      const tentado = `${sourceSquare}${targetSquare}`;
      const esperado = selecionado.solucao[step];

      if (tentado === esperado) {
        const apos = applyMove(game, sourceSquare, targetSquare);
        if (!apos) return false;
        setGame(apos);

        const novoStep = step + 1;
        const respostaAdv = selecionado.solucao[novoStep];

        if (!respostaAdv) {
          setStep(novoStep);
          setEstado('completou');
          setMensagem('Puzzle resolvido!');
          registrarResolvido(selecionado, tentativas);
          return true;
        }

        setStep(novoStep);

        // Aplica o lance do adversário após pequeno delay visual.
        setTimeout(() => {
          const fromAdv = respostaAdv.slice(0, 2) as Square;
          const toAdv = respostaAdv.slice(2, 4) as Square;
          const aposAdv = applyMove(apos, fromAdv, toAdv);
          if (aposAdv) {
            setGame(aposAdv);
            const stepFinal = novoStep + 1;
            setStep(stepFinal);
            if (stepFinal >= selecionado.solucao.length) {
              setEstado('completou');
              setMensagem('Puzzle resolvido!');
              registrarResolvido(selecionado, tentativas);
            }
          }
        }, 350);

        return true;
      }

      setEstado('errou');
      setMensagem('Não é esse lance. Tente de novo.');
      setTimeout(() => setEstado('jogando'), 1500);
      return false;
    },
    [selecionado, game, step, estado, tentativas]
  );

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />

      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>♟</span>
          <span className={styles.logoText}>
            Cesu<span className={styles.logoAccent}>Chess</span>
          </span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/routes/puzzles" className={styles.navLink}>← Níveis</Link>
          <Link href="/routes/puzzles/lichess" className={styles.navLink}>Puzzles do Lichess</Link>
          <Link href="/routes/play" className={styles.navLink}>Jogar</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Puzzles dos Mestres</h1>
          <p className={styles.sub}>
            Problemas táticos selecionados pela plataforma. Escolha um na lista e resolva.
          </p>
        </div>

        {carregando && (
          <div className={styles.center}>
            <p className={styles.loadingText}>Carregando puzzles…</p>
          </div>
        )}

        {!carregando && erro && (
          <div className={styles.center}>
            <p className={styles.errText}>{erro}</p>
            <button onClick={carregarLista} className={`${styles.btn} ${styles.btnPrimary}`}>
              Tentar de novo
            </button>
          </div>
        )}

        {/* ─── Vista de lista ─── */}
        {!carregando && !erro && !selecionado && (
          puzzles.length === 0 ? (
            <div className={styles.center}>
              <p className={styles.loadingText}>
                Nenhum puzzle cadastrado ainda. Volte mais tarde!
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {puzzles.map((p) => (
                <button
                  key={p.id}
                  className={styles.card}
                  onClick={() => setSelecionado(p)}
                >
                  <span className={styles.cardNome}>
                    {p.nome ?? 'Puzzle sem nome'}
                  </span>
                  <span className={styles.cardRating}>Rating {p.rating}</span>
                  {p.temas.length > 0 && (
                    <div className={styles.themes}>
                      {p.temas.slice(0, 3).map((t) => (
                        <span key={t} className={styles.theme}>{t}</span>
                      ))}
                    </div>
                  )}
                  <span className={styles.cardCta}>Resolver →</span>
                </button>
              ))}
            </div>
          )
        )}

        {/* ─── Vista de resolução ─── */}
        {!carregando && !erro && selecionado && game && (
          <>
            <button onClick={voltarLista} className={`${styles.btn} ${styles.btnBack}`}>
              ← Voltar à lista
            </button>

            <div className={styles.board}>
              <div className={styles.boardArea}>
                <ChessBoard position={game.fen()} onPieceDrop={handlePieceDrop} />
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.sideCard}>
                  <span className={styles.infoLabel}>Puzzle</span>
                  <span className={styles.cardNome}>
                    {selecionado.nome ?? 'Puzzle sem nome'}
                  </span>
                </div>

                <div className={styles.row}>
                  <div className={styles.sideCard}>
                    <span className={styles.infoLabel}>Rating</span>
                    <span className={styles.infoValue}>{selecionado.rating}</span>
                  </div>
                  <div className={styles.sideCard}>
                    <span className={styles.infoLabel}>Progresso</span>
                    <span className={styles.infoValue}>
                      {Math.min(step, selecionado.solucao.length)} / {selecionado.solucao.length}
                    </span>
                  </div>
                </div>

                {selecionado.temas.length > 0 && (
                  <div className={styles.sideCard}>
                    <span className={styles.infoLabel}>Temas</span>
                    <div className={styles.themes}>
                      {selecionado.temas.map((t) => (
                        <span key={t} className={styles.theme}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.sideCard}>
                  <span className={styles.infoLabel}>
                    {estado === 'completou'
                      ? 'Resultado'
                      : `Jogam as ${selecionado.fen.split(' ')[1] === 'w' ? 'brancas' : 'pretas'}`}
                  </span>
                  <span
                    className={`${styles.status} ${
                      estado === 'completou'
                        ? styles.statusOk
                        : estado === 'errou'
                          ? styles.statusErr
                          : styles.statusInfo
                    }`}
                  >
                    {estado === 'completou'
                      ? `${mensagem} (${tentativas} ${tentativas === 1 ? 'tentativa' : 'tentativas'})`
                      : estado === 'errou'
                        ? mensagem
                        : 'Encontre o melhor lance.'}
                  </span>
                </div>

                <div className={styles.actions}>
                  {estado !== 'completou' && (
                    <button onClick={reiniciar} className={styles.btn}>
                      ↺ Reiniciar
                    </button>
                  )}
                  <button onClick={voltarLista} className={`${styles.btn} ${styles.btnPrimary}`}>
                    Outro puzzle →
                  </button>
                </div>
              </aside>
            </div>

            <ComentariosSection puzzleLichessId={selecionado.id} />
          </>
        )}
      </main>
    </div>
  );
}
