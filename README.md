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
- 🧩 **Puzzles táticos em três trilhas** — fases estáticas (`/routes/puzzles`), **Puzzles do Lichess** ao vivo e **Puzzles dos Mestres** (catálogo cadastrado pelo admin, com nome/FEN/solução/tema/dificuldade). A resolução no tabuleiro registra o resultado no histórico do jogador (UC-12, UC-32).
- 🔌 **Integração com a API pública do Lichess** isolada em `src/services/lichess.ts` e exposta ao cliente apenas via proxy server-side (`/api/puzzles/[id]`, que aceita `daily`, `next` ou um ID e já devolve o puzzle convertido em FEN + solução).
- 🗄️ **Persistência em PostgreSQL** com modelagem completa baseada em ferramenta CASE (BRModeler), 12 tabelas + 3 enums + triggers (`usuario`, `admin`, `jogador`, `bot`, `tema`, `partida`, `lance`, `puzzle`, `tentativa_puzzle`, `progresso_puzzle`, `puzzles_resolvidos`, `comentario`).
- 🧪 **Suíte de testes em três níveis** (Sprint 3) — unitários (Vitest), integração contra Postgres real, E2E em browser real (Playwright). Cobertura de código com meta de 70–80%. Veja [Testes](#-testes).

### Partidas jogaveis entregues na versao 0.2.0

- ♟️ **Partida 1v1 local** no mesmo dispositivo, com alternancia obrigatoria de turnos.
- 🤖 **Partida contra bot** selecionado no catalogo ativo, com resposta automatica em tres niveis de dificuldade.
- 🧠 **Validacao de jogadas** e deteccao de fim de jogo pela engine `chess.js`.
- 📚 **Historico local de partidas** encerradas ou abandonadas, armazenado no navegador.

> Nesta versao, as novas partidas jogaveis sao um arquetipo funcional no navegador. A persistencia relacional em `partida` e `lance` permanece como evolucao futura.

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
| [Lichess API](https://lichess.org/api) | pública | Fonte dos puzzles (por ID, diário e próximo/aleatório) |

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
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | `^4.1.6` | Provedor de cobertura de código (v8) |
| [Playwright](https://playwright.dev/) | `^1.49.0` | Testes end-to-end em browser real |
| [babel-plugin-react-compiler](https://react.dev/learn/react-compiler) | `1.0.0` | React Compiler para otimizações automáticas |
| `@types/node`, `@types/pg`, `@types/bcryptjs`, `@types/react`, `@types/react-dom` | — | Definições de tipos |

---

## 🌐 APIs Utilizadas

O CesuChess consome uma **API externa** (Lichess) e expõe **API Routes internas** próprias (via Next.js) que cobrem autenticação, CRUD de usuário, comentários, histórico de puzzles, os CRUDs de administração (catálogo de puzzles, bots e temas), o catálogo público dos "Puzzles dos Mestres" e as leituras públicas de bots e temas ativos.

### API Externa — Lichess

A [API pública do Lichess](https://lichess.org/api) é a fonte oficial dos puzzles do CesuChess. Toda a integração está centralizada em [`src/services/lichess.ts`](src/services/lichess.ts) — os componentes **nunca** chamam o Lichess diretamente.

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `https://lichess.org/api/puzzle/{id}` | Busca um puzzle específico pelo ID. |
| `GET` | `https://lichess.org/api/puzzle/daily` | Busca o puzzle do dia. |
| `GET` | `https://lichess.org/api/puzzle/next` | Busca um puzzle aleatório (aceita `?angle=<tema>` e `?difficulty=<nível>`). |

**Características:**

- **Autenticação:** não exige token para estes endpoints (API pública).
- **Rate limit:** máximo de **1 requisição por segundo** por IP.
- **Cache:** respostas são cacheadas pelo `fetch` do Next.js (`revalidate: 86400s` para puzzles por ID, `3600s` para o puzzle diário); `next` é sempre buscado fresco (`cache: 'no-store'`).
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

#### Catálogo de Puzzles, Bots e Temas (Admin — v0.2.0, CRUD completo)

| Método | Endpoint | Função |
|---|---|---|
| `GET / POST` | `/api/admin/puzzles` | Lista todos ou cria um puzzle no catálogo. |
| `GET / PATCH / DELETE` | `/api/admin/puzzles/[id]` | Lê, atualiza ou remove um puzzle do catálogo. |
| `GET / POST` | `/api/admin/bots` | Lista todos ou cria um bot. |
| `GET / PATCH / DELETE` | `/api/admin/bots/[id]` | Lê, atualiza ou remove um bot. |
| `GET / POST` | `/api/admin/temas` | Lista todos ou cria um tema. |
| `GET / PATCH / DELETE` | `/api/admin/temas/[id]` | Lê, atualiza ou remove um tema. A exclusão é bloqueada quando houver puzzle associado. |
| `GET` | `/api/admin/users` | Lista todos os usuários da plataforma. |

#### Leituras públicas (puzzles, bots e temas)

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/puzzles/[id]` | Proxy do Lichess. Aceita `daily`, `next` (com `?angle`/`?difficulty`) ou um ID; devolve o puzzle já **convertido** (FEN + solução), com a conversão PGN→FEN feita no servidor por `lib/puzzleLichess.ts`. |
| `GET` | `/api/puzzles/mestres` | Lista pública dos puzzles **ativos** do catálogo (os "Puzzles dos Mestres"). |
| `GET` | `/api/bots` | Lista somente os bots ativos disponíveis no modo contra bot. |
| `GET` | `/api/temas` | Lista somente os temas ativos. |

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

O `schema.sql` cria as 12 tabelas (`usuario`, `jogador`, `admin`, `bot`, `tema`, `partida`, `lance`, `puzzle`, `tentativa_puzzle`, `progresso_puzzle`, `puzzles_resolvidos`, `comentario`), 3 enums e os triggers necessarios.

> Em um banco **já existente**, não re-execute o `schema.sql` (ele começa com `DROP TABLE … CASCADE` e apaga os dados). Para incorporar mudanças após um `git pull`, aplique os scripts aditivos e idempotentes em `DB/migrations/*.sql` — por exemplo `002_add_puzzle_nome.sql`, que adiciona a coluna `nome` ao catalogo de puzzles, e `003_add_tema_e_estrategia_bot.sql`, que inclui temas e parametros de estrategia dos bots.

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
aparece no menu do perfil). A pagina reune quatro ferramentas:

- **Listar Usuarios** - `GET /api/admin/users`
- **Gerenciar Puzzles** - CRUD em `/api/admin/puzzles`
- **Gerenciar Bots** - CRUD em `/api/admin/bots`
- **Gerenciar Temas** - CRUD em `/api/admin/temas`

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
| **Unitários** | [Vitest](https://vitest.dev/) | `tests/unit/**/*.test.ts` | Funções puras e repositórios com banco mockado: validações, CRUDs de bots, temas, puzzles, comentários, puzzles resolvidos e usuários, regras de xadrez, estratégia do bot, histórico local, sessão, senha, conversão PGN→FEN, cliente Lichess mockado e rastreabilidade dos casos de uso. |
| **Integração** | [Vitest](https://vitest.dev/) + Postgres | `tests/integration/**/*.test.ts` | Repositórios contra `CesuChess_test`: usuários, comentários, puzzles resolvidos, catálogo administrativo de puzzles, bots e temas, além do proxy Lichess. |
| **End-to-End** | [Playwright](https://playwright.dev/) | `tests/e2e/**/*.spec.ts` | Fluxos completos no navegador: autenticação, perfil, histórico de puzzles, comentários, CRUDs administrativos de puzzles, bots e temas, partida 1v1 local, partida contra bot e histórico local de partidas. |

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

### Cobertura de código 

O `npm run test:coverage` usa `@vitest/coverage-v8` e gera relatório em `coverage/index.html`. A configuracao em `vitest.config.ts` exige **70%** em linhas, funcoes, statements e branches. A cobertura dos repositorios pode ser medida sem banco local porque a suite inclui testes unitarios com mocks. Quando `TEST_DATABASE_URL` estiver configurada, os testes de integracao com PostgreSQL tambem sao executados. A cobertura adicional do caminho UI -> API -> repositorio vem dos E2E do Playwright e nao e contabilizada pelo Vitest.

Inclui: `src/lib/**`, `src/services/**`. Exclui wrappers de logging (`withRequestLog.ts`, `requestLogger.ts`), guard de admin (`admin.ts` — testado via E2E) e cliente HTTP do browser (`apiClient.ts` — testado via E2E).

### Casos de teste rastreáveis

Os testes e casos de uso estao ligados pela [`Docs/Matriz_de_Rastreabilidade.md`](Docs/Matriz_de_Rastreabilidade.md). O arquivo `tests/unit/requirements.useCases.test.ts` falha quando um caso ativo deixa de apontar para ao menos um arquivo de teste existente.

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
│   ├── migrations/                    # Scripts aditivos idempotentes (001, 002 e 003)
│   └── schema.sql                     # Schema unificado (12 tabelas + 3 enums + triggers)
├── Docs/
│   ├── CesuChess_Casos_de_Teste.docx  # Casos de teste atualizados da versao 0.2.0
│   ├── CesuChess_Casos_de_Uso_v2.docx # 32 casos classificados como ativos ou backlog
│   ├── Chamadas_de_API.md             # Mapa atualizado de endpoints
│   ├── Matriz_de_Rastreabilidade.md   # Ligacao UC -> testes automatizados
│   ├── Relatorio_de_Conformidade_v0.2.0.md # Resultado da auditoria documental
│   └── Regras_deNegócio.md            # Regras FIDE (RN-XXX) e ilegalidades
├── reports/                           # Relatório de análise estática (gerado)
├── coverage/                          # Relatório de cobertura (gerado)
├── playwright-report/                 # Relatório dos E2E (gerado)
├── src/                               # Código-fonte principal
│   ├── components/
│   │   ├── game/
│   │   │   └── PlayableGame.tsx       # Partidas locais e contra bot
│   │   └── ui/
│   │       ├── ChessBoard.tsx         # Tabuleiro interativo (react-chessboard)
│   │       └── ComentariosSection.tsx # CRUD de comentarios em puzzles (UC-16..19)
│   ├── data/
│   │   └── puzzles.ts                 # Puzzles estáticos (fase 1 inicial)
│   ├── hooks/
│   │   ├── useAdmin.ts                # Guard das telas /routes/administracao
│   │   └── usePuzzles.ts              # Seam para dados de puzzle por fase
│   ├── lib/                           # Adaptadores de infra e domínio
│   │   ├── admin.ts                   # Guard requireAdmin (401/403)
│   │   ├── apiClient.ts               # Wrapper de fetch (api.get/post/patch/delete)
│   │   ├── botEngine.ts               # Escolha de jogada do bot por dificuldade
│   │   ├── bots.ts                    # Repositorio CRUD do bot (admin)
│   │   ├── gameHistory.ts             # Historico local das partidas jogaveis
│   │   ├── gameRules.ts               # Resultado e mensagens das partidas
│   │   ├── temas.ts                   # Repositorio CRUD de temas
│   │   ├── chessEngine.ts             # Wrapper do chess.js (applyMove)
│   │   ├── comentarios.ts             # Repositório CRUD do comentário (Sprint 3)
│   │   ├── db.ts                      # Pool do node-postgres (singleton)
│   │   ├── puzzleLichess.ts           # Conversão da resposta do Lichess → FEN + solução (PGN→FEN)
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
│   │   │   │   ├── temas/
│   │   │   │   │   ├── [id].ts        # GET / PATCH / DELETE
│   │   │   │   │   └── index.ts       # GET (list) / POST (create)
│   │   │   │   └── users.ts           # GET (list de usuarios)
│   │   │   ├── auth/
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   └── register.ts
│   │   │   ├── comentarios/           # CRUD Comentários (Sprint 3)
│   │   │   │   ├── [id].ts            # PATCH / DELETE (dono)
│   │   │   │   └── index.ts           # GET (?puzzleId) / POST
│   │   │   ├── puzzles/
│   │   │   │   ├── [id].ts            # Proxy do Lichess (aceita 'daily', 'next' ou ID)
│   │   │   │   ├── mestres.ts         # GET público: catálogo de puzzles ativos
│   │   │   │   └── solved/
│   │   │   │       ├── [id].ts        # PATCH / DELETE
│   │   │   │       └── index.ts       # GET (list) / POST (upsert)
│   │   │   └── users/
│   │   │       └── me.ts              # GET / PATCH / DELETE do próprio user
│   │   └── routes/                    # Telas (pages)
│   │       ├── administracao/         # Painel admin (Sprint 3)
│   │       │   ├── bots.tsx           # CRUD UI de bots
│   │       │   ├── index.tsx          # Hub admin
│   │       │   ├── puzzles.tsx        # CRUD UI do catalogo
│   │       │   ├── temas.tsx          # CRUD UI de temas
│   │       │   └── usuarios.tsx       # Lista de usuarios
│   │       ├── login.tsx
│   │       ├── play.tsx               # Hub de modos de jogo
│   │       ├── play/
│   │       │   ├── bot.tsx            # Partida contra bot
│   │       │   ├── history.tsx        # Historico local de partidas
│   │       │   └── pvp.tsx            # Partida 1v1 local
│   │       ├── play/
│   │       │   ├── bot.tsx            # Partida contra bot
│   │       │   ├── history.tsx        # Historico local de partidas
│   │       │   └── pvp.tsx            # Partida 1v1 local
│   │       ├── profile.tsx            # CRUD Usuário (UC-05..07)
│   │       ├── puzzles/
│   │       │   ├── [phase].tsx        # Resolver puzzle (fases) + comentários
│   │       │   ├── history.tsx        # CRUD Puzzles Resolvidos
│   │       │   ├── index.tsx          # Lista de fases + links p/ Lichess e Mestres
│   │       │   ├── lichess.tsx        # Puzzles do Lichess (ao vivo via proxy)
│   │       │   └── mestres.tsx        # Puzzles dos Mestres (catálogo + resolução)
│   │       └── register.tsx
│   ├── proxy.ts                       # Proxy do Next 16 (logger de páginas)
│   ├── services/
│   │   └── lichess.ts                 # Integração com API pública do Lichess
│   ├── styles/                        # CSS Modules — um por tela + global
│   │   ├── Administracao.module.css   # Estilos das 4 telas de admin
│   │   ├── Comentarios.module.css     # Seção de comentários em puzzles
│   │   ├── Home.module.css            # Landing page (/)
│   │   ├── Login.module.css           # /routes/login
│   │   ├── Game.module.css            # Partidas e historico local
│   │   ├── Game.module.css            # Partidas e historico local
│   │   ├── Play.module.css            # /routes/play
│   │   ├── Profile.module.css         # /routes/profile
│   │   ├── PuzzleHistory.module.css   # /routes/puzzles/history
│   │   ├── PuzzleLichess.module.css   # /routes/puzzles/lichess
│   │   ├── PuzzleMestres.module.css   # /routes/puzzles/mestres
│   │   ├── PuzzlePhase.module.css     # /routes/puzzles/[phase]
│   │   ├── Puzzles.module.css         # /routes/puzzles (lista)
│   │   ├── Register.module.css        # /routes/register
│   │   └── globals.css                # Reset + tokens globais
│   └── types/
│       └── chess.ts                   # Tipos compartilhados do domínio
├── tests/                             # Suíte de testes em 3 níveis (Sprint 3)
│   ├── setup.ts                       # Carrega .env.local e DATABASE_URL → TEST
│   ├── unit/                          # Vitest — funções puras
│   │   ├── lib/
│   │   │   ├── botEngine.test.ts          # Seleção de jogada conforme dificuldade
│   │   │   ├── bots.repository.test.ts    # CRUD de bots com banco mockado
│   │   │   ├── temas.repository.test.ts   # CRUD de temas com banco mockado
│   │   │   ├── puzzles.repository.test.ts # CRUD de puzzles com banco mockado
│   │   │   ├── comentarios.repository.test.ts # CRUD de comentários com banco mockado
│   │   │   ├── puzzlesResolvidos.repository.test.ts # Histórico de puzzles com banco mockado
│   │   │   ├── users.repository.test.ts   # Repositório de usuários com banco mockado
│   │   │   ├── chessEngine.test.ts        # CT-18..20 (applyMove)
│   │   │   ├── gameHistory.test.ts        # Histórico local das partidas
│   │   │   ├── gameRules.test.ts          # Estados ativo, xeque-mate e empate
│   │   │   ├── puzzleLichess.test.ts      # CT-43 (conversão PGN→FEN)
│   │   │   ├── session.test.ts            # CT-21..23 + cookie/HMAC
│   │   │   ├── users.test.ts              # CT-24..25 (hashSenha/verificarSenha)
│   │   │   ├── validation.test.ts         # CT-01..16, CT-42 (validadores)
│   │   │   ├── validation.admin.test.ts   # Validações administrativas de bot e tema
│   │   │   └── validation.comentario.test.ts # CT-26 (texto + puzzleId)
│   │   ├── requirements.useCases.test.ts  # Trava de rastreabilidade dos casos ativos
│   │   └── services/
│   │       └── lichess.test.ts            # CT-45 (cliente Lichess mockado)
│   ├── integration/                   # Vitest + Postgres (CesuChess_test)
│   │   ├── helpers/
│   │   │   └── testDb.ts              # Pool singleton + resetDatabase + promoteToAdmin
│   │   ├── lib/
│   │   │   ├── comentarios.test.ts    # CT-30..31 (CRUD + ownership)
│   │   │   ├── puzzlesAdmin.test.ts   # CT-33, CT-44 (CRUD administrativo de puzzles)
│   │   │   ├── bots.test.ts           # CRUD administrativo de bots e parâmetros
│   │   │   ├── puzzlesResolvidos.test.ts # CT-32 (upsert acumula)
│   │   │   ├── temas.test.ts          # CRUD administrativo de temas e vínculo com puzzles
│   │   │   └── users.test.ts          # CT-27..29 (create/update/delete)
│   │   └── services/
│   │       └── lichess.test.ts        # CT-17/34 (proxy Lichess real)
│   └── e2e/                           # Playwright (browser real, banco real)
│       ├── helpers/
│       │   ├── auth.ts                # registrarUsuario / login / registrarELogar
│       │   └── dbReset.ts             # truncate + promoteUserToAdmin (HTTP)
│       ├── admin-crud.spec.ts         # CRUDs administrativos de puzzles, bots e temas
│       ├── auth-flow.spec.ts          # CT-35..36 (register/login/logout)
│       ├── comentarios-crud.spec.ts   # CT-41 (CRUD comentários)
│       ├── profile-crud.spec.ts       # CT-37 (CRUD usuário)
│       ├── game-archetypes.spec.ts    # Partidas 1v1 local, bot e historico
│       └── puzzles-history-crud.spec.ts # CRUD historico de puzzles
├── tests/requirements/                 # Catálogo versionado dos UC-01 a UC-32
├── .env.local                         # (criado por você) DATABASE_URL + TEST_... + SESSION_SECRET — gitignored
├── .env.local.example                 # Template do .env.local
├── .gitignore                         # Inclui logs/, coverage/, reports/, playwright-report/, test-results/
├── CLAUDE.md                          # Instruções de contexto pro Claude Code (IA-assistido)
├── eslint.config.mjs                  # Config do ESLint (flat config, eslint-config-next)
├── next-env.d.ts                      # Tipos auto-gerados do Next (não versionado)
├── next.config.ts                     # Config do Next 16 (reactCompiler: true)
├── package.json                       # Scripts + dependências
├── package-lock.json
├── playwright.config.ts               # Config do Playwright com DATABASE_URL isolada para E2E
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
## Testes de integração e E2E com banco isolado

Os testes destrutivos usam exclusivamente `TEST_DATABASE_URL`. Não existe senha padrão gravada no código. Antes de executar integração ou Playwright, copie `.env.test.local.example` para `.env.test.local`, informe sua senha local e prepare o banco `cesuchess_test` com `DB/schema.sql`.

```powershell
Copy-Item .env.test.local.example .env.test.local
npm.cmd run test:integration:check
npm.cmd run test:integration
npm.cmd run test:e2e
```

Consulte `TESTES_INTEGRACAO_E2E.md` para o roteiro completo.
