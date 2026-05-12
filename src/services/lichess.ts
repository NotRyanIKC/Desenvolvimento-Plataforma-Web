/**
 * src/services/lichess.ts
 *
 * Camada de integração com a API pública do Lichess.
 * Toda comunicação com o Lichess passa por aqui —
 * nunca chame a API do Lichess diretamente nos componentes.
 *
 * Endpoints utilizados:
 *   GET https://lichess.org/api/puzzle/{id}   → puzzle por ID
 *   GET https://lichess.org/api/puzzle/daily  → puzzle do dia
 *
 * A API do Lichess é pública e não exige token para estes endpoints.
 * Rate limit: máximo de 1 req/s. O proxy em /api/puzzle/[id].ts
 * garante que o client-side nunca chame o Lichess diretamente.
 */

const LICHESS_BASE = 'https://lichess.org/api';

/* ─── Tipos ──────────────────────────────────────────────── */

export interface LichessPuzzleGame {
  id: string;
  pgn: string;
  players: Array<{ name: string; color: 'white' | 'black' }>;
}

export interface LichessPuzzle {
  id: string;
  rating: number;
  plays: number;
  solution: string[];   // lista de movimentos UCI (ex: ["e2e4", "e7e5"])
  themes: string[];     // ex: ["fork", "middlegame", "short"]
  initialPly: number;   // ply onde o puzzle começa
}

export interface LichessPuzzleResponse {
  game: LichessPuzzleGame;
  puzzle: LichessPuzzle;
}

/* ─── Funções ─────────────────────────────────────────────── */

/**
 * Busca um puzzle do Lichess pelo ID.
 * Chamada server-side apenas (dentro de /api/puzzle/[id].ts).
 */
export async function fetchPuzzleById(
  id: string
): Promise<LichessPuzzleResponse> {
  const res = await fetch(`${LICHESS_BASE}/puzzle/${id}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, // cache de 24h (Next.js fetch cache)
  });

  if (!res.ok) {
    throw new Error(
      `Lichess API error: ${res.status} ao buscar puzzle "${id}"`
    );
  }

  return res.json() as Promise<LichessPuzzleResponse>;
}

/**
 * Busca o puzzle diário do Lichess.
 * Chamada server-side apenas.
 */
export async function fetchDailyPuzzle(): Promise<LichessPuzzleResponse> {
  const res = await fetch(`${LICHESS_BASE}/puzzle/daily`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 }, // cache de 1h
  });

  if (!res.ok) {
    throw new Error(`Lichess API error: ${res.status} ao buscar puzzle diário`);
  }

  return res.json() as Promise<LichessPuzzleResponse>;
}