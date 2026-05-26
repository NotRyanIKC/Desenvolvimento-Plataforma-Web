import { describe, test, expect, vi, afterEach } from 'vitest';
import {
  fetchPuzzleById,
  fetchDailyPuzzle,
  fetchNextPuzzle,
} from '../../../src/services/lichess';

/**
 * Testes unitários do cliente do Lichess com `fetch` mockado — exercita as URLs
 * montadas e os caminhos de erro (res.ok === false) sem tocar a rede. O caminho
 * feliz contra a API real fica no teste de integração (services/lichess.test.ts).
 */
const RESP = { game: { id: 'g', pgn: 'e4 e5', players: [] }, puzzle: { id: 'p' } };

function mockFetch(ok: boolean, status = 200) {
  const fn = vi.fn(async () => ({
    ok,
    status,
    json: async () => RESP,
  }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('🧪 Testes Unitários - Cliente do Lichess (fetch mockado)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('fetchPuzzleById monta a URL por ID e devolve o JSON', async () => {
    const fn = mockFetch(true);
    const data = await fetchPuzzleById('00008');
    expect(data).toEqual(RESP);
    expect(fn.mock.calls[0][0]).toBe('https://lichess.org/api/puzzle/00008');
  });

  test('Propaga erro com o status quando a resposta não é ok', async () => {
    // Mesmo guard (`if (!res.ok) throw ...`) compartilhado pelos três fetchs;
    // um caso representativo basta. É o que faz o proxy responder 502.
    mockFetch(false, 429);
    await expect(fetchPuzzleById('00008')).rejects.toThrow(/429/);
  });

  test('fetchDailyPuzzle usa o endpoint /daily', async () => {
    const fn = mockFetch(true);
    await fetchDailyPuzzle();
    expect(fn.mock.calls[0][0]).toBe('https://lichess.org/api/puzzle/daily');
  });

  test('fetchNextPuzzle inclui angle e difficulty na query', async () => {
    const fn = mockFetch(true);
    await fetchNextPuzzle('fork', 'normal');
    const url = String(fn.mock.calls[0][0]);
    expect(url).toContain('/puzzle/next?');
    expect(url).toContain('angle=fork');
    expect(url).toContain('difficulty=normal');
  });

  test('fetchNextPuzzle sem parâmetros não adiciona query string', async () => {
    const fn = mockFetch(true);
    await fetchNextPuzzle();
    expect(fn.mock.calls[0][0]).toBe('https://lichess.org/api/puzzle/next');
  });
});
