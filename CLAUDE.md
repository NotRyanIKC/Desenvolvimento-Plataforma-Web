# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CesuChess — a web chess platform (Next.js full-stack) built for a Software Quality course. Users register, solve Lichess puzzles, and track a solved-puzzle history. Interactive play vs. bot is in scope but still in development.

## Language convention

The codebase is **Portuguese**: identifiers, comments, DB columns (`usuario`, `senha_hash`, `criado_em`), API error messages, and route segments are all in Portuguese. Match this — do not introduce English names for new domain code. UI strings and validation messages are user-facing Portuguese.

## Commands

```bash
npm run dev          # dev server with hot reload on :3000
npm run build        # production build to .next/
npm run start        # serve the production build (run build first)
npm run lint         # ESLint (eslint-config-next)
npm test             # Vitest in watch mode
npm run test:run     # Vitest single pass (CI / pre-commit)

# run a single test file or by name
npx vitest run tests/unit/lib/validation.test.ts
npx vitest run -t "validateEmail"
```

Integration tests hit **real** external services (Lichess) and would hit a real DB — they need network access and a configured `.env.local`. There are no DB mocks by design; DB-touching code is meant to be tested via integration against a real Postgres.

## Required setup

The app will not run without:
- A running PostgreSQL (14+) with `DB/schema.sql` applied (creates 10 tables, 3 enums, `set_atualizado_em` triggers; uses `pgcrypto` for `gen_random_uuid()`).
- A `.env.local` (git-ignored) with:
  - `DATABASE_URL=postgres://postgres:PASS@localhost:5432/cesuchess`
  - `SESSION_SECRET=` (≥16 chars; HMAC key for session cookies — `session.ts` throws if missing/short)

## Architecture

Next.js **Pages Router** (not App Router). Layered, with strict direction of dependencies:

```
pages/routes/*.tsx   (UI screens)
  → hooks/           (reusable state/logic seams)
  → lib/apiClient    (typed fetch wrapper → internal API only)
pages/api/*.ts       (HTTP handlers; the only place that reads sessions + does auth)
  → lib/*            (repositories + infra: db, session, users, puzzlesResolvidos, validation)
  → services/*       (external APIs, currently lichess.ts)
```

Key boundary rules (enforced by convention, worth preserving):
- **Components never call Lichess directly.** They hit the internal proxy `GET /api/puzzles/[id]` (accepts `id='daily'`), which calls `services/lichess.ts`. This respects Lichess's 1 req/s rate limit and keeps fetch-caching server-side.
- **All Postgres access goes through `lib/db.ts`** — the singleton `pool` (persisted on `globalThis` to survive hot reload) and the typed `query<T>()` helper. Never import `pg` in a handler. Raw SQL, no ORM.
- `lib/apiClient.ts` (`api.get/post/patch/delete`) is the only client→server fetch path; it sends `credentials: 'include'` and throws `ApiError` carrying the server's `error` message.

### Auth & sessions
Signed-cookie sessions (HMAC-SHA256), **not JWT/next-auth** (see comment in `session.ts` — JWT planned for a later sprint). Cookie format: `<usuarioId>.<expEpoch>.<sig>`. In every protected API handler the pattern is:
```ts
const usuarioId = getSessionUserId(req);
if (!usuarioId) return res.status(401).json({ error: 'Não autenticado.' });
```
Passwords: bcryptjs, 10 rounds (`lib/users.ts`).

### Domain model: usuario / jogador
`usuario` is the root; `jogador` is its 1:1 "competitive" side. Registration creates **both in one transaction** (`createUser`). Child tables (`puzzles_resolvidos`, `partida`, …) reference `jogador.id`, **not** `usuario.id`. Repositories take the session's `usuarioId` and resolve to `jogador.id` internally via `findJogadorIdByUsuarioId` — keep that indirection when adding jogador-scoped features. Account deletion relies on `ON DELETE CASCADE`.

### API handler conventions
- Switch on `req.method`; set `Allow` header and return `405` for unsupported methods.
- Catch Postgres unique-violation `err.code === '23505'` and return `409`.
- Validators in `lib/validation.ts` return `null` when valid or an error string; compose with `firstError(...)` and return the first non-null as a `400`.
- Mutations that change email/password require re-supplying `senhaAtual` (verified before applying).

### Other notes
- Path alias `@/*` → `src/*`.
- TypeScript `strict: true`. Shared types live in `src/types/`; per-feature DTO/Row types live next to their repository.
- **React Compiler is enabled** (`next.config.ts` `reactCompiler: true`). Avoid manual `useMemo`/`useCallback` micro-optimizations — memoization is automatic.
- The puzzle-by-phase data (`src/data/puzzles.ts` + `hooks/usePuzzles.ts`) is a static stub (only phase 1). `usePuzzle` is intentionally the single seam to swap for real API/DB data later.

### Chess rules
When implementing or reviewing chess logic, `Docs/Regras_deNegócio.md` is the normative spec — official FIDE rules tagged `RN-XXX` (movement, castling, en passant, promotion, check/mate, draws, move legality `RN-090`/illegality codes `ILG-XXX`). Reference these IDs in code/tests. Move validation/state uses `chess.js`; `lib/chessEngine.ts` wraps it (`applyMove` returns a new `Chess` or `null`, auto-promotes to queen).

## Tests layout

`tests/unit/**` (pure functions) and `tests/integration/**` (cross external boundaries) each mirror the `src/` tree. No `*.test.ts` lives beside production code.
