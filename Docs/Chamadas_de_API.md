# Mapa de Chamadas de API — CesuChess

Documento de referência das chamadas de API do projeto: onde elas acontecem no
código (servidor, cliente e serviços externos) e como são registradas pelo
sistema de log.

> **Versão:** Sprint 3 (26/05/2026) — atualizado com os 5 CRUDs (Usuário,
> Puzzles Resolvidos, Puzzle admin, Bot admin, Comentário).
>
> **Fonte de verdade em runtime:** desde a introdução do sistema de log, toda
> requisição (páginas + API) é gravada em `logs/requests.log` (JSON-lines).
> Veja a seção [Sistema de Log](#sistema-de-log).

---

## 1. Handlers de API (servidor) — `src/pages/api/`

Todos os handlers seguem o mesmo padrão: checagem por `req.method`, autenticação
via `getSessionUserId(req)` (ou `requireAdmin(req)` nas rotas admin) e são
envolvidos por `withRequestLog(...)` no `export default`.

### 1.1 Autenticação

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `api/auth/register.ts` | pública |
| POST | `/api/auth/login` | `api/auth/login.ts` | pública |
| POST | `/api/auth/logout` | `api/auth/logout.ts` | pública |

### 1.2 CRUD Usuário (self)

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET / PATCH / DELETE | `/api/users/me` | `api/users/me.ts` | sessão |

### 1.3 CRUD Puzzles Resolvidos (histórico do jogador)

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET / POST | `/api/puzzles/solved` | `api/puzzles/solved/index.ts` | sessão |
| PATCH / DELETE | `/api/puzzles/solved/[id]` | `api/puzzles/solved/[id].ts` | sessão |

### 1.4 CRUD Comentários em puzzle (Sprint 3)

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET | `/api/comentarios?puzzleId=<id>` | `api/comentarios/index.ts` | pública (UC-17) |
| POST | `/api/comentarios` | `api/comentarios/index.ts` | sessão (UC-16) |
| PATCH / DELETE | `/api/comentarios/[id]` | `api/comentarios/[id].ts` | sessão (autor — UC-18, UC-19) |

### 1.5 CRUD Catálogo de Puzzles (admin — Sprint 3, completo)

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET / POST | `/api/admin/puzzles` | `api/admin/puzzles/index.ts` | **admin** (UC-20, UC-21) |
| GET / PATCH / DELETE | `/api/admin/puzzles/[id]` | `api/admin/puzzles/[id].ts` | **admin** (UC-22, UC-23) |

### 1.6 CRUD Bots (admin — Sprint 3, completo)

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET / POST | `/api/admin/bots` | `api/admin/bots/index.ts` | **admin** (UC-24, UC-25) |
| GET / PATCH / DELETE | `/api/admin/bots/[id]` | `api/admin/bots/[id].ts` | **admin** (UC-26, UC-27) |

### 1.7 Listagem de usuários (admin)

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET | `/api/admin/users` | `api/admin/users.ts` | **admin** |

### 1.8 Proxy do Lichess

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| GET | `/api/puzzles/[id]` | `api/puzzles/[id].ts` | pública (proxy Lichess; aceita `daily`) |

### 1.9 Rotas internas

| Método | Rota | Arquivo | Auth |
|---|---|---|---|
| POST | `/api/_internal/log` | `api/_internal/log.ts` | interna (sink de log do proxy de páginas) |
| POST | `/api/_internal/test/promote-admin` | `api/_internal/test/promote-admin.ts` | **dev-only** (helper para suíte E2E; retorna 404 em produção) |

Rotas admin retornam **401** sem sessão e **403** quando a sessão não é de
administrador (ver `requireAdmin` em `src/lib/admin.ts`). `GET /api/users/me` e
`POST /api/auth/login` incluem `isAdmin` no payload para a UI.

---

## 2. Chamadas cliente → API interna

O cliente **nunca** usa `fetch` direto: tudo passa por `src/lib/apiClient.ts`
(`api.get/post/patch/delete`), que injeta o cookie de sessão (`credentials:
'include'`) e lança `ApiError` com a mensagem do servidor.

| Arquivo | Chamadas | Endpoints |
|---|---|---|
| `routes/login.tsx` | `api.post` | `POST /api/auth/login` |
| `routes/register.tsx` | `api.post` | `POST /api/auth/register` |
| `routes/profile.tsx` | `api.get` / `api.patch` / `api.delete` / `api.post` | `/api/users/me`, `POST /api/auth/logout` |
| `routes/puzzles/history.tsx` | `api.get` / `api.post` / `api.patch` / `api.delete` | `/api/puzzles/solved` (+ `/[id]`) |
| `routes/puzzles/[phase].tsx` | (via componente `ComentariosSection`) | `/api/comentarios` (+ `/[id]`) |
| `components/ui/ComentariosSection.tsx` | `api.get` / `api.post` / `api.patch` / `api.delete` | `/api/comentarios` (+ `/[id]`) |
| `hooks/useAdmin.ts` | `api.get` | `GET /api/users/me` (guarda das telas admin) |
| `routes/administracao/usuarios.tsx` | `api.get` | `GET /api/admin/users` |
| `routes/administracao/puzzles.tsx` | `api.get` / `api.post` / `api.patch` / `api.delete` | `/api/admin/puzzles` (+ `/[id]`) |
| `routes/administracao/bots.tsx` | `api.get` / `api.post` / `api.patch` / `api.delete` | `/api/admin/bots` (+ `/[id]`) |

`routes/puzzles/[phase].tsx` também renderiza dados estáticos de
`src/data/puzzles.ts` via `usePuzzle`; a chamada ao Lichess fica para uso
futuro do hook (Sprint posterior).

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

## 4. Chamadas usadas pela suíte de testes E2E

A suíte Playwright (Sprint 3) bate em todos os endpoints públicos via UI do
browser. Adicionalmente, faz uma única chamada HTTP "interna" para promover um
usuário a admin durante o setup do teste:

| Quem chama | Endpoint | Função |
|---|---|---|
| `tests/e2e/admin-crud.spec.ts` (helper `registrarComoAdmin`) | `POST /api/_internal/test/promote-admin` | Promove o usuário recém-cadastrado a admin (rota dev-only) |
| Todos os specs | endpoints públicos via UI | Exercita o fluxo completo no browser |

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

A rota `/api/_internal/log` é a única que **NÃO** é envolvida em
`withRequestLog` (para evitar self-logging recursivo). A
`/api/_internal/test/promote-admin` segue o padrão normal (`withRequestLog`).

---

## Resumo: contagem de endpoints

- **17 handlers** servindo **24 combinações método+rota**.
- **5 CRUDs completos:** Usuário (3), Puzzles Resolvidos (4), Comentários (4),
  Puzzle admin (5), Bot admin (5).
- **2 endpoints de proxy/integração:** Lichess proxy + sink de log.
- **2 endpoints auxiliares:** log interno + promote-admin (dev-only).
