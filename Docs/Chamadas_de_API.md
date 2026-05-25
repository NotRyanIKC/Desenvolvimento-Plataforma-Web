# Mapa de Chamadas de API — CesuChess

Documento de referência das chamadas de API do projeto: onde elas acontecem no
código (servidor, cliente e serviços externos) e como são registradas pelo
sistema de log.

> **Fonte de verdade em runtime:** desde a introdução do sistema de log, toda
> requisição (páginas + API) é gravada em `logs/requests.log` (JSON-lines).
> Veja a seção [Sistema de Log](#sistema-de-log).

---

## 1. Handlers de API (servidor) — `src/pages/api/`

Todos os handlers seguem o mesmo padrão: checagem por `req.method`, autenticação
via `getSessionUserId(req)` (ou `requireAdmin(req)` nas rotas admin) e são
envolvidos por `withRequestLog(...)` no `export default`.

| Método(s) | Rota | Arquivo | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | `api/auth/login.ts` | pública |
| POST | `/api/auth/logout` | `api/auth/logout.ts` | pública |
| POST | `/api/auth/register` | `api/auth/register.ts` | pública |
| GET | `/api/puzzles/[id]` | `api/puzzles/[id].ts` | pública (proxy Lichess; aceita `daily`) |
| GET / POST | `/api/puzzles/solved` | `api/puzzles/solved/index.ts` | sessão |
| PATCH / DELETE | `/api/puzzles/solved/[id]` | `api/puzzles/solved/[id].ts` | sessão |
| GET / PATCH / DELETE | `/api/users/me` | `api/users/me.ts` | sessão |
| GET | `/api/admin/users` | `api/admin/users.ts` | **admin** |
| POST | `/api/admin/puzzles` | `api/admin/puzzles.ts` | **admin** |
| POST | `/api/admin/bots` | `api/admin/bots.ts` | **admin** |
| POST | `/api/_internal/log` | `api/_internal/log.ts` | interna (sink de log do proxy) |

Rotas admin retornam **401** sem sessão e **403** quando a sessão não é de
administrador (ver `requireAdmin` em `src/lib/admin.ts`). `GET /api/users/me` e
`POST /api/auth/login` incluem `isAdmin` no payload para a UI.

---

## 2. Chamadas cliente → API interna

O cliente **nunca** usa `fetch` direto: tudo passa por `src/lib/apiClient.ts`
(`api.get/post/patch/delete`), que injeta o cookie de sessão (`credentials:
'include'`) e lança `ApiError` com a mensagem do servidor.

| Arquivo | Chamada | Endpoint |
|---|---|---|
| `routes/login.tsx` | `api.post` | `POST /api/auth/login` |
| `routes/register.tsx` | `api.post` | `POST /api/auth/register` |
| `routes/profile.tsx` | `api.get` / `api.patch` / `api.delete` / `api.post` | `/api/users/me`, `POST /api/auth/logout` |
| `routes/puzzles/history.tsx` | `api.get` / `api.post` / `api.patch` / `api.delete` | `/api/puzzles/solved` (+ `/[id]`) |
| `hooks/useAdmin.ts` | `api.get` | `GET /api/users/me` (guarda das telas admin) |
| `routes/administracao/usuarios.tsx` | `api.get` | `GET /api/admin/users` |
| `routes/administracao/puzzles.tsx` | `api.post` | `POST /api/admin/puzzles` |
| `routes/administracao/bots.tsx` | `api.post` | `POST /api/admin/bots` |

`routes/puzzles/[phase].tsx` **não** chama API — usa `usePuzzle` com dados
estáticos de `src/data/puzzles.ts`.

---

## 3. Chamadas a serviços externos — `src/services/`

| Arquivo | Função | URL externa |
|---|---|---|
| `services/lichess.ts` | `fetchPuzzleById(id)` | `GET https://lichess.org/api/puzzle/{id}` |
| `services/lichess.ts` | `fetchDailyPuzzle()` | `GET https://lichess.org/api/puzzle/daily` |

Ambas são chamadas **apenas server-side**, a partir do proxy
`/api/puzzles/[id]`. Os componentes nunca falam com o Lichess diretamente
(respeita o rate-limit de 1 req/s e mantém o cache do `fetch` no servidor).

---

## Sistema de Log

Duas camadas gravam linhas JSON em `logs/requests.log` (uma por requisição):

- **Páginas** — `src/proxy.ts` (convenção "proxy" do Next 16, no Edge runtime)
  intercepta cada navegação que não seja `/api/*`, `_next/*` ou estático. Como o
  Edge não acessa o filesystem, ele encaminha os metadados (fire-and-forget via
  `event.waitUntil`) para `POST /api/_internal/log`, que grava o arquivo:
  `{ type:'page', method, path, ip, userAgent, referer, ts }`.
- **API** — `src/lib/withRequestLog.ts` envolve cada handler e registra
  `{ type:'api', method, path, status, durationMs, usuarioId, ip, userAgent, ts }`.

O utilitário de escrita é `src/lib/requestLogger.ts`. **Apenas metadados são
gravados — nunca o corpo da requisição/resposta**, então senhas de login/registro
não chegam ao arquivo. A pasta `logs/` é ignorada pelo Git. Não há rotação de
arquivo (limitação conhecida).
