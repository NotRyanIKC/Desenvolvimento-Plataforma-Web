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
- 🪪 **Perfil do usuário** (`/routes/profile`) com **CRUD completo**:
  - **Read** — exibe nome, sobrenome, username, e-mail e data de criação.
  - **Update** — edição de dados pessoais e troca de senha (exige senha atual para alterar e-mail/senha, por segurança).
  - **Delete** — exclusão da conta, que cascateia para `jogador`, `puzzles_resolvidos` e demais agregados.
- 📚 **Histórico de Puzzles** (`/routes/puzzles/history`) com **CRUD completo**:
  - **Create** — registrar um puzzle resolvido (ID do Lichess, fase, rating, tentativas, anotação).
  - **Read** — listar todos os puzzles que o usuário resolveu, mais recentes primeiro.
  - **Update** — editar anotação, acerto e número de tentativas.
  - **Delete** — remover um registro do histórico.
- 🔌 **Integração com a API pública do Lichess** isolada em `src/services/lichess.ts` e exposta ao cliente apenas via proxy server-side (`/api/puzzles/[id]`).
- 🗄️ **Persistência em PostgreSQL** com modelagem completa baseada em ferramenta CASE (BRModeler), incluindo 9 entidades do domínio + tabela auxiliar `puzzles_resolvidos`.

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
| `npm test` | Executa o Vitest em modo *watch* (reexecuta os testes a cada alteração). |
| `npm run test:run` | Executa toda a suíte de testes uma única vez (útil para CI). |

---

## 🧪 Testes

O CesuChess usa **[Vitest](https://vitest.dev/)** como runner único de testes — mesma API estilo Jest (`describe` / `test` / `expect`), porém com suporte nativo a TypeScript e execução muito mais rápida via Vite. Não há configuração extra: o Vitest descobre automaticamente arquivos `*.test.ts` em todo o projeto.

### Organização

A suíte é dividida em duas camadas, posicionadas conforme a natureza do teste:

| Camada | Local | Objetivo |
|---|---|---|
| **Unitários** | `tests/unit/**/*.test.ts` | Validar funções puras da camada de domínio/infra (ex.: validação de e-mail, senha, username). A árvore dentro de `tests/unit/` espelha a árvore dentro de `src/`. |
| **Integração** | `tests/integration/**/*.test.ts` | Validar fluxos que cruzam fronteiras (serviços externos, banco, proxies). A árvore dentro de `tests/integration/` espelha a árvore dentro de `src/`. |

### Cobertura atual (Sprint 2)

- **`tests/unit/lib/validation.test.ts`** — 16 casos cobrindo `validateEmail`, `validateSenha`, `validateNome`, `validateSobrenome`, `validateUsername` e `firstError`.
- **`tests/integration/services/lichess.test.ts`** — smoke test do proxy do Lichess via `fetchPuzzleById('daily')`, com fallback gracioso para rate limit.

### Como rodar

```bash
# modo watch (re-executa ao salvar)
npm test

# uma única passada (CI, pré-commit)
npm run test:run
```

Saída esperada na suíte atual: **2 arquivos, 17 testes, todos passando**.

### Convenções

- **Suíte centralizada em `tests/`**: nenhum `*.test.ts` mora junto ao código de produção. Unitários ficam em `tests/unit/<caminho-do-módulo>.test.ts` e integração em `tests/integration/<caminho-do-módulo>.test.ts`, espelhando a árvore de `src/`. Isso mantém o código de produção limpo e deixa óbvio o que é puro vs. o que cruza fronteiras.
- **Pasta dedicada para integração**: `tests/integration/` agrupa testes que dependem de I/O externo (rede, banco, sistema de arquivos), tornando explícito o que não é puro.
- **Sem mocks de banco em testes unitários**: funções que tocam o PostgreSQL são testadas via integração contra um banco real configurado em `.env.local`, evitando divergência entre mock e produção.

---

## 📂 Estrutura do Projeto

```text
Desenvolvimento-Plataforma-Web/
├── DB/                          # Modelagem e schema do banco
│   ├── Cesuchess 1.0            # Arquivo-fonte do BRModeler (ferramenta CASE)
│   └── schema.sql               # Schema unificado (10 tabelas + 3 enums + triggers)
├── Docs/
│   ├── CesuChess_Casos_de_Teste.docx     
│   └── CesuChess_Casos_de_Uso.docx
├── src/                         # Código-fonte principal da aplicação
│   ├── components/
│   │   └── ui/                  # Componentes de UI reutilizáveis
│   │       └── ChessBoard.tsx
│   ├── data/                    # Dados estáticos (puzzles iniciais)
│   │   └── puzzles.ts
│   ├── hooks/                   # Hooks customizados
│   │   └── usePuzzles.ts
│   ├── lib/                     # Adaptadores de infraestrutura e domínio
│   │   ├── apiClient.ts         # Wrapper de fetch p/ chamar APIs internas
│   │   ├── chessEngine.ts       # Integração com chess.js (applyMove)
│   │   ├── db.ts                # Pool do node-postgres (singleton)
│   │   ├── puzzlesResolvidos.ts # Repositório do CRUD de Puzzles Resolvidos
│   │   ├── session.ts           # Cookie assinado HMAC-SHA256
│   │   ├── users.ts             # Repositório do agregado usuário + jogador  
│   │   └── validation.ts        # Validadores reutilizáveis (e-mail, senha, etc.)
│   ├── pages/                   # Rotas (Pages Router do Next.js)
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── api/                 # Endpoints HTTP do back-end
│   │   │   ├── auth/
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   └── register.ts
│   │   │   ├── puzzles/
│   │   │   │   ├── [id].ts      # Proxy do Lichess
│   │   │   │   └── solved/
│   │   │   │       ├── [id].ts  # PATCH / DELETE
│   │   │   │       └── index.ts # GET / POST
│   │   │   └── users/
│   │   │       └── me.ts        # GET / PATCH / DELETE do próprio usuário
│   │   └── routes/              # Páginas visíveis
│   │       ├── login.tsx
│   │       ├── play.tsx
│   │       ├── profile.tsx      # Tela de perfil (CRUD do usuário)
│   │       ├── register.tsx
│   │       └── puzzles/
│   │           ├── [phase].tsx
│   │           ├── history.tsx  # Tela de histórico (CRUD de puzzles resolvidos)
│   │           └── index.tsx
│   ├── services/                # Integração com APIs externas
│   │   └── lichess.ts
│   ├── styles/                  # CSS Modules + globals.css
│   └── types/                   # Tipos compartilhados
│       └── chess.ts
├── tests/                       # Suíte de testes automatizados do sistema
│   ├── integration/             # Testes de integração (cruzam fronteiras externas)
│   │   └── services/
│   │       └── lichess.test.ts  # Smoke test do proxy da API do Lichess
│   └── unit/                    # Testes unitários (funções puras)
│       └── lib/
│           └── validation.test.ts  # Testes da camada de validação
├── .env.local                   # (criado por você) DATABASE_URL + SESSION_SECRET — não versionado
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Detalhamento das pastas principais

| Pasta | Responsabilidade |
|---|---|
| **`DB/`** | Modelagem visual (BRModeler) e script `schema.sql` aplicado no Postgres. |
| **`src/components/ui`** | Componentes de interface reutilizáveis (tabuleiro, botões). |
| **`src/data`** | Dados estáticos / mocks (será reduzido conforme as fontes reais são plugadas). |
| **`src/hooks`** | Hooks customizados encapsulando lógica reutilizável. |
| **`src/lib`** | Camada de infraestrutura e domínio: pool do banco, sessão, hash, validações, repositórios e wrapper de fetch. |
| **`src/pages`** | Rotas da aplicação (Pages Router). Arquivos em `pages/api/` viram endpoints HTTP; arquivos em `pages/routes/` viram telas. |
| **`src/services`** | Camada de integração com serviços externos (atualmente: Lichess). |
| **`src/styles`** | `globals.css` + um `*.module.css` por tela. |
| **`src/types`** | Tipos TypeScript compartilhados. |
| **`tests/`** | Toda a suíte de testes (Vitest). Subdividida em `tests/unit/` (funções puras) e `tests/integration/` (serviços externos, banco, proxies); ambas espelham a árvore de `src/`. |

---

## 🏗 Arquitetura e Padrões

- **Separação de responsabilidades:** a lógica de xadrez (regras, estado, validação) é encapsulada em `lib/`, `hooks/` e na biblioteca `chess.js`; os componentes em `components/ui` cuidam apenas da apresentação e interação.
- **Componentes funcionais com Hooks:** todo o estado é gerenciado com `useState`, `useEffect` e hooks customizados centralizados em `hooks/`.
- **Tipagem estrita:** o `tsconfig.json` está configurado para máxima segurança (`strict: true`), com todos os tipos compartilhados centralizados em `types/`.
- **Camada de persistência:** o acesso ao PostgreSQL é feito via `node-postgres` com SQL puro — o pool de conexões vive em `lib/` e as queries ficam em `lib/` (repositórios), mantendo a separação entre infraestrutura e regras de negócio.
- **Lint contínuo:** o ESLint é executado durante o desenvolvimento e antes dos commits para manter a base de código consistente.
- **React Compiler:** com o `babel-plugin-react-compiler` ativo, otimizações como memoização automática são aplicadas em tempo de build, simplificando o código de aplicação.

---

<div align="center">

Feito com ♟️ e ☕ para a disciplina de Qualidade e Projeto de Software.

</div>
