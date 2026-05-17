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
- [Modelagem do Banco de Dados](#-modelagem-do-banco-de-dados)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
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

### Implementadas no Sprint 2

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

### Sessão (cookie assinado)

O projeto **não usa JWT nem `next-auth` no Sprint 2**. O cookie de sessão (`cesuchess_session`) é uma string `<usuarioId>.<exp>.<assinatura>`, onde `assinatura = HMAC-SHA256(payload, SESSION_SECRET)`. A implementação está em [`src/lib/session.ts`](src/lib/session.ts) e usa `crypto.timingSafeEqual` para evitar timing attacks. Em **Sprint 3** será substituído por JWT.

---

## 🗃️ Modelagem do Banco de Dados

O banco oficial chama-se **"Banco Versão 2034.0"** (identificador técnico no Postgres: `BancoVersao2034` — sem acentos/espaços para evitar problemas de encoding no Windows).

A modelagem nasceu no **BRModeler** ([`DB/Cesuchess 1.0`](DB/Cesuchess%201.0)) e foi exportada para SQL com correções (chaves UNIQUE, CHECK, ON DELETE CASCADE, triggers de `atualizado_em` etc.) em [`DB/schema.sql`](DB/schema.sql).

### Tabelas (10 no total)

| Tabela | Papel |
|---|---|
| `usuario` | Raiz da hierarquia: dados de autenticação e perfil (UUID v4). |
| `admin` | Usuários com privilégios administrativos (1:1 com `usuario`). |
| `jogador` | Lado "competitivo" do usuário, com rating e estatísticas (1:1 com `usuario`). |
| `bot` | Bots configuráveis para jogar contra jogadores. |
| `partida` | Partidas entre jogadores, com `resultado` e `status`. |
| `lance` | Lances de uma partida, em ordem (`UNIQUE (partida_id, numero)`). |
| `puzzle` | Puzzles cadastrados internamente (espelho opcional do Lichess via `lichess_id`). |
| `tentativa_puzzle` | Histórico fino de lances enviados por jogadores em puzzles. |
| `progresso_puzzle` | Progresso agregado por jogador e fase. |
| `puzzles_resolvidos` | **Tabela auxiliar do Sprint 2** — alimenta o CRUD de Histórico de Puzzles do usuário. |

### Tipos enumerados

`dificuldade_bot` · `resultado_partida` · `status_partida`.

### Cuidados de integridade aplicados (além do BRModeler)

- `UNIQUE` em `usuario(email)`, `usuario(username)`, `admin(usuario_id)`, `jogador(usuario_id)`, `puzzle(lichess_id)`.
- `UNIQUE` composto em `lance(partida_id, numero)` e `progresso_puzzle(jogador_id, fase)`.
- `CHECK` em `partida` proibindo o mesmo jogador nas duas cores, garantindo `encerrada_em >= iniciada_em` e exigindo coerência entre `status` e `resultado`.
- `ON DELETE CASCADE` na cadeia `usuario → jogador → puzzles_resolvidos`.
- Trigger `set_atualizado_em()` em `usuario`, `progresso_puzzle` e `puzzles_resolvidos`.

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
psql --version
git --version
```

> **Windows:** se `psql` não for reconhecido, adicione `C:\Program Files\PostgreSQL\17\bin` ao `PATH` ou use o caminho completo do executável.

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

### 3. Crie o banco e aplique o schema

```bash
# Cria o banco (uma única vez)
createdb -U postgres BancoVersao2034

# Aplica o schema (recria tabelas se já existirem)
psql -U postgres -d BancoVersao2034 -f DB/schema.sql
```

**No Windows** (PowerShell), use o caminho completo do `psql`/`createdb` caso eles não estejam no PATH:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres BancoVersao2034
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d BancoVersao2034 -f DB\schema.sql
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Abra `.env.local` e ajuste a senha do `postgres` e o `SESSION_SECRET` — ver seção [Variáveis de Ambiente](#-variáveis-de-ambiente).

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 6. Abra no navegador

Acesse [http://localhost:3000](http://localhost:3000). Crie uma conta em `/routes/register` e explore o app.

---

## 🔐 Variáveis de Ambiente

O arquivo [`.env.local.example`](.env.local.example) lista as variáveis necessárias. Copie-o para `.env.local` antes de subir a aplicação.

| Variável | Função |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL no formato `postgresql://usuario:senha@host:porta/banco`. Por padrão aponta para `BancoVersao2034` em `localhost:5432`. |
| `SESSION_SECRET` | Chave usada para assinar o cookie de sessão (HMAC-SHA256). Em produção, gere com `openssl rand -hex 32` ou equivalente. Mínimo **16 caracteres**. |

> Se a senha do `postgres` contiver caracteres especiais (`@`, `:`, `/`, `#`, espaço…), URL-encode antes de colocar na `DATABASE_URL`.

---

## 📜 Scripts Disponíveis

No diretório do projeto, você pode rodar:

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento em modo *hot reload* na porta `3000`. |
| `npm run build` | Gera o build de produção otimizado em `.next/`. |
| `npm run start` | Inicia o servidor com a build de produção (executar `build` antes). |
| `npm run lint` | Executa o ESLint em todos os arquivos do projeto. |

---

## 📂 Estrutura do Projeto

```text
Desenvolvimento-Plataforma-Web/
├── DB/                          # Modelagem e schema do banco
│   ├── Cesuchess 1.0            # Arquivo-fonte do BRModeler (ferramenta CASE)
│   └── schema.sql               # Schema unificado (10 tabelas + 3 enums + triggers)
├── Docs/                        # Documentação do projeto
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
├── .env.local.example           # Modelo das variáveis de ambiente
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

---

## 🏗 Arquitetura e Padrões

- **Separação de responsabilidades:** `services/` lida com APIs externas, `lib/` é a camada de domínio + infraestrutura (banco, sessão, validações), `pages/api/` apenas orquestra (lê body, valida, chama `lib/`, devolve JSON), `pages/routes/` cuida da UI.
- **Sessão sem libs externas:** o cookie httpOnly é assinado com HMAC-SHA256 a partir do `SESSION_SECRET`, e validado em tempo constante (`crypto.timingSafeEqual`). Toda rota privada chama `getSessionUserId(req)`.
- **Hash de senha com `bcryptjs`** (10 rounds) — senha em claro nunca cruza o limite do `lib/users.ts`.
- **Transações no `pg`** para criação de `usuario` + `jogador` no register, garantindo que nunca exista usuário sem o lado-jogador correspondente.
- **Componentes funcionais com Hooks:** todo o estado é gerenciado com `useState`, `useEffect` e hooks customizados em `src/hooks/`.
- **Tipagem estrita:** `tsconfig.json` com `strict: true`; tipos compartilhados centralizados em `src/types/` e DTOs reexportados em `src/lib/apiClient.ts`.
- **Camada de persistência sem ORM:** acesso direto via `node-postgres` em SQL puro — o pool vive em `src/lib/db.ts` e cada agregado tem seu próprio arquivo em `src/lib/`.
- **Integração com APIs externas isolada:** chamadas ao Lichess são feitas exclusivamente em `services/lichess.ts` e expostas ao front somente via `pages/api/puzzles/[id].ts`, evitando vazar configuração ou bater no rate limit a partir do navegador.
- **Lint contínuo:** ESLint executado durante o desenvolvimento.
- **React Compiler:** `babel-plugin-react-compiler` ativo, aplicando memoização automática em tempo de build.

---

<div align="center">

Feito com ♟️ e ☕ para a disciplina de Qualidade e Projeto de Software.

</div>
