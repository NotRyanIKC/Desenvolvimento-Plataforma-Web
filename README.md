<div align="center">

# ♟️ CesuChess

**Plataforma web moderna para jogar xadrez diretamente do navegador.**

Projeto desenvolvido como parte da disciplina de **Qualidade e Projeto de Software**, com foco em boas práticas de Front-end, arquitetura componentizada e tipagem estática.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Lichess API](https://img.shields.io/badge/Lichess_API-public-000000?style=for-the-badge&logo=lichess&logoColor=white)](https://lichess.org/api)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [APIs Utilizadas](#-apis-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura e Padrões](#-arquitetura-e-padrões)

---

## 💻 Sobre o Projeto

O **CesuChess** é uma plataforma web que permite aos jogadores disputarem partidas de xadrez de forma fluida, interativa e responsiva, sem a necessidade de instalar qualquer software adicional — basta abrir o navegador.

O projeto nasceu no contexto do **Projeto Prático de Qualidade e Projeto de Software**, tendo como objetivo aplicar, em um cenário real e funcional, conceitos como:

- Componentização de interfaces em React
- Tipagem estática com TypeScript
- Renderização híbrida (SSR/CSR) com Next.js
- Persistência de dados em banco relacional (PostgreSQL)
- Padronização e qualidade de código via ESLint
- Boas práticas de organização de projeto e versionamento com Git

O resultado é uma aplicação completa, com tabuleiro interativo, validação de jogadas conforme as regras oficiais do xadrez e uma experiência de usuário focada em desempenho e clareza.

---

## ✨ Funcionalidades

- 👤 **Cadastro de usuário** com validação de e-mail, username, sobrenome e senha (mínimo 8 caracteres) — cria automaticamente o par `usuario` + `jogador` em uma única transação.
- 🔐 **Login por e-mail OU username** + senha, com **sessão por cookie httpOnly assinado (HMAC-SHA256)**.
- 🛡️ **Modo administrador** com guard `requireAdmin`, exclusivo para usuários presentes na tabela `admin`. As rotas `/api/admin/*` retornam **401** sem sessão e **403** quando a sessão não é de admin.
- 💬 **Comentários em puzzles** — qualquer usuário autenticado pode publicar comentários em qualquer puzzle (UC-16). Edição e exclusão são restritas ao autor (UC-18, UC-19). Visualização é aberta a anônimos (UC-17).
- 🔌 **Integração com a API pública do Lichess** isolada em `src/services/lichess.ts` e exposta ao cliente apenas via proxy server-side (`/api/puzzles/[id]`).
- 🗄️ **Persistência em PostgreSQL** com modelagem completa baseada em ferramenta CASE (BRModeler), 11 tabelas + 3 enums + triggers (`usuario`, `admin`, `jogador`, `bot`, `partida`, `lance`, `puzzle`, `tentativa_puzzle`, `progresso_puzzle`, `puzzles_resolvidos`, `comentario`).
- 🧪 **Suíte de testes em três níveis** (Sprint 3) — unitários (Vitest), integração contra Postgres real, E2E em browser real (Playwright). Cobertura de código com meta de 70–80%. Veja [Testes](#-testes).

### Em escopo do projeto, ainda em desenvolvimento

- ♟️ **Tabuleiro interativo** com peças arrastáveis (drag-and-drop) renderizado pela `react-chessboard`.
- 🧠 **Validação completa de jogadas** segundo as regras oficiais, usando a engine `chess.js`.
- 🔄 **Estado da partida em tempo real**, com turno, histórico de movimentos e detecção de fim de jogo.
- 🤖 **Modo de jogo contra Bot** com diferentes níveis de dificuldade.

### Características transversais

- 🎨 **Interface responsiva** adaptada para desktop, tablet e mobile.
- 🔒 **Tipagem ponta a ponta** com TypeScript para reduzir bugs em tempo de execução.
- ⚡ **Renderização otimizada** com Next.js 16 e o novo React Compiler (`babel-plugin-react-compiler`).
- 🧹 **Código padronizado** com ESLint + `eslint-config-next`.

---

## 🛠 Tecnologias Utilizadas

### Core

| Tecnologia | Versão | Função |
|---|---|---|
| [Next.js](https://nextjs.org/) | `16.2.5` | Framework React full-stack (rotas, SSR/SSG, otimizações) |
| [React](https://react.dev/) | `19.2.4` | Biblioteca para construção da interface |
| [React DOM](https://react.dev/) | `19.2.4` | Renderização do React no navegador |
| [TypeScript](https://www.typescriptlang.org/) | `^5` | Tipagem estática para JavaScript |

### Domínio do Xadrez

| Tecnologia | Versão | Função |
|---|---|---|
| [chess.js](https://github.com/jhlywa/chess.js) | `^1.4.0` | Engine de xadrez: validação de jogadas, estado do jogo, FEN/PGN |
| [react-chessboard](https://github.com/Clariity/react-chessboard) | `^5.10.0` | Componente React para renderização do tabuleiro |
| [Lichess API](https://lichess.org/api) | pública | Fonte dos puzzles (puzzle por ID e puzzle diário) |

### Banco de Dados e Autenticação

| Tecnologia | Versão | Função |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | `14+` | Banco de dados relacional para usuários, jogadores, partidas, puzzles e histórico |
| [node-postgres (`pg`)](https://node-postgres.com/) | `^8.11.5` | Driver oficial do PostgreSQL para Node.js (acesso via SQL puro, sem ORM) |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | `^2.4.3` | Hash seguro de senhas (10 rounds) |
| `node:crypto` | nativo | HMAC-SHA256 para assinar o cookie de sessão |

### Qualidade e Ferramentas de Desenvolvimento

| Tecnologia | Versão | Função |
|---|---|---|
| [ESLint](https://eslint.org/) | `^9` | Linter para padronização do código |
| [eslint-config-next](https://nextjs.org/docs/app/api-reference/config/eslint) | `16.2.5` | Configuração oficial do ESLint para Next.js |
| [Vitest](https://vitest.dev/) | `^4.1.6` | Runner de testes unitários e de integração (TypeScript nativo, API estilo Jest) |
| [babel-plugin-react-compiler](https://react.dev/learn/react-compiler) | `1.0.0` | React Compiler para otimizações automáticas |
| `@types/node`, `@types/pg`, `@types/bcryptjs`, `@types/react`, `@types/react-dom` | — | Definições de tipos |

---

## 🌐 APIs Utilizadas

O CesuChess consome uma **API externa** (Lichess) e expõe **API Routes internas** próprias (via Next.js) que cobrem autenticação, CRUD de usuário e CRUD de puzzles resolvidos.

### API Externa — Lichess

A [API pública do Lichess](https://lichess.org/api) é a fonte oficial dos puzzles do CesuChess. Toda a integração está centralizada em [`src/services/lichess.ts`](src/services/lichess.ts) — os componentes **nunca** chamam o Lichess diretamente.

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `https://lichess.org/api/puzzle/{id}` | Busca um puzzle específico pelo ID. |
| `GET` | `https://lichess.org/api/puzzle/daily` | Busca o puzzle do dia. |

**Características:**

- **Autenticação:** não exige token para estes endpoints (API pública).
- **Rate limit:** máximo de **1 requisição por segundo** por IP.
- **Cache:** respostas são cacheadas pelo `fetch` do Next.js (`revalidate: 86400s` para puzzles por ID, `3600s` para o puzzle diário).
- **Formato:** JSON, com os campos `game` (PGN, jogadores) e `puzzle` (rating, solução em UCI, temas, ply inicial).

### API Routes Internas (Next.js)

Para evitar chamadas diretas do cliente ao Lichess (e respeitar o rate limit), o projeto expõe rotas próprias sob `src/pages/api/`:

#### Autenticação

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/api/auth/register` | Cria `usuario` + `jogador` (transação) e abre sessão. |
| `POST` | `/api/auth/login` | Autentica por e-mail OU username + senha; seta cookie. |
| `POST` | `/api/auth/logout` | Limpa o cookie de sessão. |

#### Usuário (CRUD)

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/users/me` | Dados do usuário logado. |
| `PATCH` | `/api/users/me` | Atualiza nome / sobrenome / e-mail / senha. |
| `DELETE` | `/api/users/me` | Exclui a conta (cascateia jogador, puzzles_resolvidos…). |

#### Puzzles Resolvidos (CRUD)

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/puzzles/solved` | Lista os puzzles resolvidos do usuário logado. |
| `POST` | `/api/puzzles/solved` | Registra (upsert) um puzzle como resolvido. |
| `PATCH` | `/api/puzzles/solved/[id]` | Atualiza anotação, acerto ou tentativas. |
| `DELETE` | `/api/puzzles/solved/[id]` | Remove um registro do histórico. |

#### Comentários em puzzles (Sprint 3, CRUD)

| Método | Endpoint | Auth | Função |
|---|---|---|---|
| `GET` | `/api/comentarios?puzzleId=X` | pública | UC-17: lista comentários de um puzzle. Quando logado, marca `pertenceAoLeitor`. |
| `POST` | `/api/comentarios` | sessão | UC-16: publica um comentário (body: `{puzzleLichessId, texto}`). |
| `PATCH` | `/api/comentarios/[id]` | sessão (autor) | UC-18: edita o próprio comentário. |
| `DELETE` | `/api/comentarios/[id]` | sessão (autor) | UC-19: exclui o próprio comentário. |

#### Catálogo de Puzzles e Bots (Admin — Sprint 3, CRUD completo)

| Método | Endpoint | Função |
|---|---|---|
| `GET / POST` | `/api/admin/puzzles` | Lista todos ou cria um puzzle no catálogo. |
| `GET / PATCH / DELETE` | `/api/admin/puzzles/[id]` | Lê, atualiza ou remove um puzzle do catálogo. |
| `GET / POST` | `/api/admin/bots` | Lista todos ou cria um bot. |
| `GET / PATCH / DELETE` | `/api/admin/bots/[id]` | Lê, atualiza ou remove um bot. |
| `GET` | `/api/admin/users` | Lista todos os usuários da plataforma. |

#### Proxy do Lichess

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/puzzles/[id]` | Proxy para `GET /api/puzzle/{id}` do Lichess. Aceita `id = 'daily'`. |

### Fluxo de uma requisição de puzzle (proxy)

```
[Cliente / React]
       │
       │  GET /api/puzzles/{id}
       ▼
[Next.js API Route]  ← src/pages/api/puzzles/[id].ts
       │
       │  fetchPuzzleById(id)
       ▼
[Camada de serviço] ← src/services/lichess.ts
       │
       │  GET https://lichess.org/api/puzzle/{id}
       ▼
[Lichess API pública]
```

---

## ⚙️ Pré-requisitos

Antes de começar, garanta que você tem instalado em sua máquina:

- **[Node.js](https://nodejs.org/en/)** — versão **18.18 ou superior** (recomendado: LTS 20+, exigido pelo Next.js 16).
- **[PostgreSQL](https://www.postgresql.org/download/)** — versão **14 ou superior**, com o serviço em execução localmente. **Anote a senha do superusuário `postgres`** definida na instalação — ela será usada no `.env.local`.
- Um gerenciador de pacotes: **[npm](https://www.npmjs.com/)** (já vem com o Node), **[Yarn](https://yarnpkg.com/)** ou **[pnpm](https://pnpm.io/)**.
- **[Git](https://git-scm.com/)** para clonar o repositório.

Verifique as versões com:

```bash
node --version
npm --version
git --version
```

---

## 🚀 Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/NotRyanIKC/Desenvolvimento-Plataforma-Web.git
cd Desenvolvimento-Plataforma-Web
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Crie o banco de dados e aplique o schema

Com o serviço do PostgreSQL em execução, crie o banco `cesuchess` e rode o `schema.sql`:

```bash
# Linux / macOS
createdb -U postgres cesuchess
psql -U postgres -d cesuchess -f DB/schema.sql
```

```bash
# Windows (PowerShell, com o psql no PATH)
psql -U postgres -c "CREATE DATABASE cesuchess;"
psql -U postgres -d cesuchess -f DB/schema.sql
```

O `schema.sql` cria as 10 tabelas (`usuario`, `jogador`, `admin`, `bot`, `partida`, `lance`, `puzzle`, `tentativa_puzzle`, `progresso_puzzle`, `puzzles_resolvidos`), 3 enums e os triggers necessários.

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` **na raiz do projeto** com as duas variáveis abaixo:

```bash
# .env.local
DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/cesuchess
SESSION_SECRET=uma_string_aleatoria_com_pelo_menos_16_caracteres
```

- **`DATABASE_URL`** — string de conexão do `node-postgres`. Substitua `SUA_SENHA` pela senha do superusuário `postgres`.
- **`SESSION_SECRET`** — chave usada para assinar o cookie de sessão (HMAC-SHA256). Gere uma aleatória com:
  ```bash
  openssl rand -hex 32
  ```

> ⚠️ O `.env.local` é ignorado pelo Git (`.gitignore`) e **não deve ser commitado**. Ao clonar o projeto em uma nova máquina, recrie-o seguindo este passo.

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 6. Abra no navegador

Acesse [http://localhost:3000](http://localhost:3000). Crie uma conta em `/routes/register` e explore o app.

---

## 🛡 Modo Administrador

Um usuário é administrador quando existe uma linha em `admin` (1:1 com `usuario`)
apontando para ele. **Não há promoção pela aplicação** — por segurança, ela é
feita manualmente no banco:

1. Cadastre um usuário normal pela UI (`/routes/register`).
2. Promova-o a admin rodando o script `DB/admin_seed.sql` (troque o e-mail):
   ```bash
   psql -U postgres -d cesuchess -f DB/admin_seed.sql
   ```

Ao logar, um admin é levado a **`/routes/administracao`** (e o link "Administração"
aparece no menu do perfil). A página reúne três ferramentas:

- **Listar Usuários** — `GET /api/admin/users`
- **Criar Puzzles** — `POST /api/admin/puzzles` (catálogo `puzzle`)
- **Criar Bots** — `POST /api/admin/bots` (tabela `bot`)

As rotas `/api/admin/*` respondem **401** sem sessão e **403** para sessões que
não sejam de admin (guard `requireAdmin` em `src/lib/admin.ts`).

---

## 📒 Sistema de Log de Requisições

Toda requisição (navegação de páginas **e** chamadas de API) é registrada em
`logs/requests.log`, uma linha JSON por requisição:

- **Páginas:** `src/proxy.ts` (convenção "proxy" do Next 16) intercepta a
  navegação no Edge e encaminha os metadados para `POST /api/_internal/log`,
  que grava o arquivo (o Edge runtime não acessa o filesystem).
- **API:** o HOC `withRequestLog` (`src/lib/withRequestLog.ts`) envolve cada
  handler e registra método, rota, **status**, **duração**, usuário, IP e
  user-agent.

A escrita fica em `src/lib/requestLogger.ts`. São gravados **apenas metadados** —
nunca o corpo da requisição/resposta —, portanto senhas não vão para o arquivo.
A pasta `logs/` é ignorada pelo Git. O inventário completo das chamadas de API
está em [`Docs/Chamadas_de_API.md`](Docs/Chamadas_de_API.md).

---

## 📜 Scripts Disponíveis

No diretório do projeto, você pode rodar:

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento em modo *hot reload* na porta `3000`. |
| `npm run build` | Gera o build de produção otimizado em `.next/`. |
| `npm run start` | Inicia o servidor com a build de produção (executar `build` antes). |
| `npm run lint` | Executa o ESLint em todos os arquivos do projeto. |
| `npm run lint:report` | Gera `reports/eslint-report.html` (análise estática para apresentação). |
| `npm test` | Executa o Vitest em modo *watch* (reexecuta os testes a cada alteração). |
| `npm run test:run` | Executa toda a suíte de testes uma única vez (útil para CI). |
| `npm run test:coverage` | Roda os testes e gera o relatório de cobertura HTML em `coverage/`. |
| `npm run test:e2e` | Roda a suíte E2E do Playwright (sobe o dev server em `:3001`). |
| `npm run test:e2e:ui` | Roda os E2E em modo interativo (Playwright UI). |

---

## 🧪 Testes

O CesuChess tem suíte de testes **nos três níveis exigidos pelo Sprint 3** — unitários, integração e end-to-end — usando duas ferramentas:

| Nível | Ferramenta | Local | Cobre |
|---|---|---|---|
| **Unitários** | [Vitest](https://vitest.dev/) | `tests/unit/**/*.test.ts` | Funções puras: `validation`, `chessEngine`, `session`, `users.hashSenha`. |
| **Integração** | [Vitest](https://vitest.dev/) + Postgres | `tests/integration/**/*.test.ts` | Repositórios contra `CesuChess_test`: `users`, `comentarios`, `puzzlesResolvidos`, `puzzles` (admin), `bots` (admin) + proxy Lichess. |
| **End-to-End** | [Playwright](https://playwright.dev/) | `tests/e2e/**/*.spec.ts` | Fluxos completos no browser: auth, perfil, histórico de puzzles, admin (puzzles/bots), comentários. |

### Quick start

```bash
# Unitários + integração (Vitest)
npm test               # modo watch
npm run test:run       # uma passada (CI)
npm run test:coverage  # gera relatório HTML em coverage/

# End-to-end (Playwright) — uma vez:
npx playwright install
# Depois:
npm run test:e2e
npm run test:e2e:ui    # modo interativo
```

### Pré-requisito para integração e E2E

Os testes que tocam o banco usam um Postgres SEPARADO (`CesuChess_test`), pra não contaminar dados de desenvolvimento. Crie uma vez:

```bash
createdb -U postgres CesuChess_test
psql -U postgres -d CesuChess_test -f DB/schema.sql
```

Configure `TEST_DATABASE_URL` no `.env.local` (já vem no `.env.local.example`):

```bash
TEST_DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/CesuChess_test
```

### Cobertura de código (Sprint 3)

O `npm run test:coverage` usa `@vitest/coverage-v8` e gera relatório em `coverage/index.html`. A configuração (em `vitest.config.ts`) tem thresholds de **65%** linhas/funções/statements e **45%** branches. A meta original do Sprint 3 (70–80%) é atingida em **linhas (71.98%)**; funções e statements ficam em **67%** com a suíte unit+integration atual (cobertura adicional vem dos 7 E2E do Playwright, não contabilizados aqui).

Inclui: `src/lib/**`, `src/services/**`. Exclui wrappers de logging (`withRequestLog.ts`, `requestLogger.ts`), guard de admin (`admin.ts` — testado via E2E) e cliente HTTP do browser (`apiClient.ts` — testado via E2E).

### Casos de teste rastreáveis

Cada teste tem um identificador `CT-XX` referenciado em [`Docs/CesuChess_Casos_de_Teste.docx`](Docs/CesuChess_Casos_de_Teste.docx) — 41 casos no total (16 unit Sprint 2 + 1 integração Lichess + 9 unit Sprint 3 + 8 integração novos + 7 E2E).

### Convenções

- **Suíte centralizada em `tests/`** — nenhum `*.test.ts` mora junto ao código de produção. A árvore espelha `src/`.
- **Banco de teste separado** — testes de integração e E2E usam `CesuChess_test` via `TEST_DATABASE_URL`, evitando colisão com `CesuChess` (desenvolvimento).
- **Sem mocks de banco em integração** — bate em Postgres de verdade, com `resetDatabase()` no `beforeEach`. Garante que o que passa no teste vai passar em produção.
- **Playwright single-worker** — testes E2E rodam em série (`workers: 1`) porque compartilham o mesmo schema. Trade-off consciente: integração simples vs. paralelismo.

---

## 📂 Estrutura do Projeto

```text
Desenvolvimento-Plataforma-Web/
├── DB/                                # Modelagem e schema do banco
│   ├── Cesuchess 1.0                  # Arquivo-fonte do BRModeler (ferramenta CASE)
│   ├── admin_seed.sql                 # Script de promoção manual de admin
│   └── schema.sql                     # Schema unificado (11 tabelas + 3 enums + triggers)
├── Docs/
│   ├── CesuChess_Casos_de_Teste.docx  # 41 casos de teste (CT-01..41)
│   ├── CesuChess_Casos_de_Uso_v2.docx # Use cases (31 UCs, 15+ implementados)
│   ├── Chamadas_de_API.md             # Mapa de endpoints + chamadas cliente
│   └── Regras_deNegócio.md            # Regras FIDE (RN-XXX) e ilegalidades
├── reports/                           # Relatório de análise estática (gerado)
├── coverage/                          # Relatório de cobertura (gerado)
├── playwright-report/                 # Relatório dos E2E (gerado)
├── src/                               # Código-fonte principal
│   ├── components/
│   │   └── ui/
│   │       ├── ChessBoard.tsx         # Tabuleiro interativo (react-chessboard)
│   │       └── ComentariosSection.tsx # CRUD de comentários em puzzles (UC-16..19)
│   ├── data/
│   │   └── puzzles.ts                 # Puzzles estáticos (fase 1 inicial)
│   ├── hooks/
│   │   ├── useAdmin.ts                # Guard das telas /routes/administracao
│   │   └── usePuzzles.ts              # Seam para dados de puzzle por fase
│   ├── lib/                           # Adaptadores de infra e domínio
│   │   ├── admin.ts                   # Guard requireAdmin (401/403)
│   │   ├── apiClient.ts               # Wrapper de fetch (api.get/post/patch/delete)
│   │   ├── bots.ts                    # Repositório CRUD do bot (admin)
│   │   ├── chessEngine.ts             # Wrapper do chess.js (applyMove)
│   │   ├── comentarios.ts             # Repositório CRUD do comentário (Sprint 3)
│   │   ├── db.ts                      # Pool do node-postgres (singleton)
│   │   ├── puzzles.ts                 # Repositório CRUD do catálogo (admin)
│   │   ├── puzzlesResolvidos.ts       # Repositório CRUD do histórico (jogador)
│   │   ├── requestLogger.ts           # Escrita JSON-lines em logs/requests.log
│   │   ├── session.ts                 # Cookie HMAC-SHA256
│   │   ├── users.ts                   # Repositório do agregado usuario + jogador
│   │   ├── validation.ts              # Validadores reutilizáveis
│   │   └── withRequestLog.ts          # HOC que envolve cada handler de API
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── index.tsx                  # Home
│   │   ├── api/                       # Endpoints HTTP (Pages Router)
│   │   │   ├── _internal/
│   │   │   │   ├── log.ts             # Sink interno do proxy de páginas
│   │   │   │   └── test/
│   │   │   │       └── promote-admin.ts # Helper E2E (dev-only)
│   │   │   ├── admin/                 # CRUDs admin (Sprint 3)
│   │   │   │   ├── bots/
│   │   │   │   │   ├── [id].ts        # GET / PATCH / DELETE
│   │   │   │   │   └── index.ts       # GET (list) / POST (create)
│   │   │   │   ├── puzzles/
│   │   │   │   │   ├── [id].ts        # GET / PATCH / DELETE
│   │   │   │   │   └── index.ts       # GET (list) / POST (create)
│   │   │   │   └── users.ts           # GET (list de usuários)
│   │   │   ├── auth/
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   └── register.ts
│   │   │   ├── comentarios/           # CRUD Comentários (Sprint 3)
│   │   │   │   ├── [id].ts            # PATCH / DELETE (dono)
│   │   │   │   └── index.ts           # GET (?puzzleId) / POST
│   │   │   ├── puzzles/
│   │   │   │   ├── [id].ts            # Proxy do Lichess (aceita 'daily')
│   │   │   │   └── solved/
│   │   │   │       ├── [id].ts        # PATCH / DELETE
│   │   │   │       └── index.ts       # GET (list) / POST (upsert)
│   │   │   └── users/
│   │   │       └── me.ts              # GET / PATCH / DELETE do próprio user
│   │   └── routes/                    # Telas (pages)
│   │       ├── administracao/         # Painel admin (Sprint 3)
│   │       │   ├── bots.tsx           # CRUD UI de bots
│   │       │   ├── index.tsx          # Hub admin
│   │       │   ├── puzzles.tsx        # CRUD UI do catálogo
│   │       │   └── usuarios.tsx       # Lista de usuários
│   │       ├── login.tsx
│   │       ├── play.tsx               # Hub de modos de jogo
│   │       ├── profile.tsx            # CRUD Usuário (UC-05..07)
│   │       ├── puzzles/
│   │       │   ├── [phase].tsx        # Resolver puzzle + comentários
│   │       │   ├── history.tsx        # CRUD Puzzles Resolvidos
│   │       │   └── index.tsx          # Lista de fases
│   │       └── register.tsx
│   ├── proxy.ts                       # Proxy do Next 16 (logger de páginas)
│   ├── services/
│   │   └── lichess.ts                 # Integração com API pública do Lichess
│   ├── styles/                        # CSS Modules — um por tela + global
│   │   ├── Administracao.module.css   # Estilos das 4 telas de admin
│   │   ├── Comentarios.module.css     # Seção de comentários em puzzles
│   │   ├── Home.module.css            # Landing page (/)
│   │   ├── Login.module.css           # /routes/login
│   │   ├── Play.module.css            # /routes/play
│   │   ├── Profile.module.css         # /routes/profile
│   │   ├── PuzzleHistory.module.css   # /routes/puzzles/history
│   │   ├── PuzzlePhase.module.css     # /routes/puzzles/[phase]
│   │   ├── Puzzles.module.css         # /routes/puzzles (lista)
│   │   ├── Register.module.css        # /routes/register
│   │   └── globals.css                # Reset + tokens globais
│   └── types/
│       └── chess.ts                   # Tipos compartilhados do domínio
├── tests/                             # Suíte de testes em 3 níveis (Sprint 3)
│   ├── setup.ts                       # Carrega .env.local e DATABASE_URL → TEST
│   ├── unit/lib/                      # Vitest — funções puras
│   │   ├── chessEngine.test.ts        # CT-18..20 (applyMove)
│   │   ├── session.test.ts            # CT-21..23 (encode/decode)
│   │   ├── users.test.ts              # CT-24..25 (hashSenha/verificarSenha)
│   │   ├── validation.test.ts         # CT-01..16 (Sprint 2)
│   │   └── validation.comentario.test.ts # CT-26 (texto + puzzleId)
│   ├── integration/                   # Vitest + Postgres (CesuChess_test)
│   │   ├── helpers/
│   │   │   └── testDb.ts              # Pool singleton + resetDatabase + promoteToAdmin
│   │   ├── lib/
│   │   │   ├── comentarios.test.ts    # CT-30..31 (CRUD + ownership)
│   │   │   ├── puzzlesAdmin.test.ts   # CT-33 + bots (admin CRUD)
│   │   │   ├── puzzlesResolvidos.test.ts # CT-32 (upsert acumula)
│   │   │   └── users.test.ts          # CT-27..29 (create/update/delete)
│   │   └── services/
│   │       └── lichess.test.ts        # CT-17/34 (proxy Lichess)
│   └── e2e/                           # Playwright (browser real, banco real)
│       ├── helpers/
│       │   ├── auth.ts                # registrarUsuario / login / registrarELogar
│       │   └── dbReset.ts             # truncate + promoteUserToAdmin (HTTP)
│       ├── admin-crud.spec.ts         # CT-39..40 (puzzles + bots admin)
│       ├── auth-flow.spec.ts          # CT-35..36 (register/login/logout)
│       ├── comentarios-crud.spec.ts   # CT-41 (CRUD comentários)
│       ├── profile-crud.spec.ts       # CT-37 (CRUD usuário)
│       └── puzzles-history-crud.spec.ts # CT-38 (CRUD histórico)
├── .env.local                         # (criado por você) DATABASE_URL + TEST_... + SESSION_SECRET — gitignored
├── .env.local.example                 # Template do .env.local
├── .gitignore                         # Inclui logs/, coverage/, reports/, playwright-report/, test-results/
├── CLAUDE.md                          # Instruções de contexto pro Claude Code (IA-assistido)
├── eslint.config.mjs                  # Config do ESLint (flat config, eslint-config-next)
├── next-env.d.ts                      # Tipos auto-gerados do Next (não versionado)
├── next.config.ts                     # Config do Next 16 (reactCompiler: true)
├── package.json                       # Scripts + dependências
├── package-lock.json
├── playwright.config.ts               # Config do Playwright (webServer + cross-env DATABASE_URL)
├── tsconfig.json                      # TypeScript strict + alias @/*
├── vitest.config.ts                   # Config do Vitest (coverage thresholds, fileParallelism)
└── README.md                          # Este arquivo
```

### Detalhamento das pastas principais

| Pasta | Responsabilidade |
|---|---|
| **`DB/`** | Modelagem visual (BRModeler) e script `schema.sql` aplicado no Postgres. |
| **`Docs/`** | Documentação técnica versionada: casos de uso, casos de teste, mapa de API, regras de negócio FIDE. |
| **`src/components/ui`** | Componentes de UI reutilizáveis (tabuleiro, seção de comentários). |
| **`src/data`** | Dados estáticos (stub de puzzles iniciais; será reduzido conforme dados reais entram). |
| **`src/hooks`** | Hooks customizados (`useAdmin` guard, `usePuzzles` seam). |
| **`src/lib`** | Camada de infraestrutura e domínio: pool do banco, sessão, hash, validações, repositórios, wrapper de fetch, logger de requisições. |
| **`src/pages`** | Rotas (Pages Router). `pages/api/` vira endpoint HTTP; `pages/routes/` vira tela. |
| **`src/services`** | Camada de integração com serviços externos (Lichess). |
| **`src/styles`** | `globals.css` + um `*.module.css` por tela. |
| **`src/types`** | Tipos TypeScript compartilhados. |
| **`tests/`** | Suíte completa em 3 níveis. `unit/` para funções puras (Vitest), `integration/`