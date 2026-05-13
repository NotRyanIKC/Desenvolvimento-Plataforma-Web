<div align="center">

# ♟️ CesuChess

**Plataforma web moderna para jogar xadrez diretamente do navegador.**

Projeto desenvolvido como parte da disciplina de **Qualidade e Projeto de Software**, com foco em boas práticas de Front-end, arquitetura componentizada e tipagem estática.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto](#-como-executar-o-projeto)
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

- ♟️ **Tabuleiro interativo** com peças arrastáveis (drag-and-drop) renderizado pela `react-chessboard`.
- 🧠 **Validação completa de jogadas** segundo as regras oficiais, usando a engine `chess.js` (xeque, xeque-mate, en passant, roque, promoção e empate por afogamento).
- 🔄 **Estado da partida em tempo real**, incluindo turno, histórico de movimentos e detecção de fim de jogo.
- 🗄️ **Persistência em PostgreSQL** para usuários, partidas e histórico de jogadas.
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

### Banco de Dados

| Tecnologia | Versão | Função |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | `14+` | Banco de dados relacional para usuários, partidas e histórico de jogadas |
| [node-postgres (`pg`)](https://node-postgres.com/) | — | Driver oficial do PostgreSQL para Node.js (acesso via SQL puro, sem ORM) |

### Qualidade e Ferramentas de Desenvolvimento

| Tecnologia | Versão | Função |
|---|---|---|
| [ESLint](https://eslint.org/) | `^9` | Linter para padronização do código |
| [eslint-config-next](https://nextjs.org/docs/app/api-reference/config/eslint) | `16.2.5` | Configuração oficial do ESLint para Next.js |
| [babel-plugin-react-compiler](https://react.dev/learn/react-compiler) | `1.0.0` | React Compiler para otimizações automáticas |
| `@types/node`, `@types/react`, `@types/react-dom` | — | Definições de tipos |

---

## ⚙️ Pré-requisitos

Antes de começar, garanta que você tem instalado em sua máquina:

- **[Node.js](https://nodejs.org/en/)** — versão **18.18 ou superior** (recomendado: LTS 20+, exigido pelo Next.js 16).
- **[PostgreSQL](https://www.postgresql.org/download/)** — versão **14 ou superior**, com o serviço em execução localmente (ou acesso a uma instância remota).
- Um gerenciador de pacotes: **[npm](https://www.npmjs.com/)** (já vem com o Node), **[Yarn](https://yarnpkg.com/)** ou **[pnpm](https://pnpm.io/)**.
- **[Git](https://git-scm.com/)** para clonar o repositório.

Verifique as versões com:

```bash
node --version
npm --version
psql --version
git --version
```

---

## 🚀 Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/NotRyanIKC/Desenvolvimento-Plataforma-Web.git
```

### 2. Acesse a pasta do projeto

```bash
cd Desenvolvimento-Plataforma-Web
```

### 3. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 5. Abra no navegador

Acesse [http://localhost:3000](http://localhost:3000) — a página recarrega automaticamente conforme você edita os arquivos.

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
├── src/                       # Código-fonte principal da aplicação
│   ├── components/
│   │   └── ui/                # Componentes de UI reutilizáveis (Tabuleiro, botões, etc.)
│   ├── data/                  # Dados estáticos e mocks (configurações iniciais, presets)
│   ├── hooks/                 # Hooks customizados do React (ex.: useChessGame)
│   ├── lib/                   # Bibliotecas e wrappers internos (pool do Postgres, integração com chess.js)
│   ├── pages/                 # Rotas e API routes do Next.js (Pages Router)
│   ├── services/              # Camada de serviços (queries SQL, regras de negócio)
│   ├── styles/                # Estilos globais e módulos CSS
│   └── types/                 # Definições de tipos e interfaces TypeScript
├── .gitignore                 # Arquivos e pastas ignorados pelo Git
├── eslint.config.mjs          # Configuração do ESLint (flat config)
├── next.config.ts             # Configuração do Next.js
├── package.json               # Dependências, scripts e metadados do projeto
├── package-lock.json          # Lockfile das dependências (npm)
├── tsconfig.json              # Configuração do compilador TypeScript
└── README.md                  # Este arquivo
```

### Detalhamento das pastas

| Pasta | Responsabilidade |
|---|---|
| **`components/ui`** | Componentes de interface reutilizáveis e desacoplados de regras de negócio — botões, modais, e o próprio tabuleiro de xadrez. |
| **`data`** | Conjuntos de dados estáticos usados pela aplicação (configurações iniciais do tabuleiro, presets de jogo, listas auxiliares). |
| **`hooks`** | Hooks customizados que encapsulam lógica reutilizável (estado da partida, controle de turnos, persistência local). |
| **`lib`** | Adaptadores e utilidades de mais baixo nível — pool de conexão do PostgreSQL e integração com a engine `chess.js`. |
| **`pages`** | Rotas da aplicação seguindo o **Pages Router** do Next.js. Cada arquivo `.tsx` vira uma rota; subpastas em `pages/api/` viram endpoints. |
| **`services`** | Camada responsável pelas queries SQL e orquestração de regras de negócio do domínio. |
| **`styles`** | Arquivos de estilo globais (`globals.css`) e módulos CSS específicos. |
| **`types`** | Tipos e interfaces TypeScript compartilhados por toda a aplicação. |

---

## 🏗 Arquitetura e Padrões

- **Separação de responsabilidades:** a lógica de xadrez (regras, estado, validação) é encapsulada em `lib/`, `hooks/` e na biblioteca `chess.js`; os componentes em `components/ui` cuidam apenas da apresentação e interação.
- **Componentes funcionais com Hooks:** todo o estado é gerenciado com `useState`, `useEffect` e hooks customizados centralizados em `hooks/`.
- **Tipagem estrita:** o `tsconfig.json` está configurado para máxima segurança (`strict: true`), com todos os tipos compartilhados centralizados em `types/`.
- **Camada de persistência:** o acesso ao PostgreSQL é feito via `node-postgres` com SQL puro — o pool de conexões vive em `lib/` e as queries ficam em `services/`, mantendo a separação entre infraestrutura e regras de negócio.
- **Lint contínuo:** o ESLint é executado durante o desenvolvimento e antes dos commits para manter a base de código consistente.
- **React Compiler:** com o `babel-plugin-react-compiler` ativo, otimizações como memoização automática são aplicadas em tempo de build, simplificando o código de aplicação.

---

<div align="center">

Feito com ♟️ e ☕ para a disciplina de Qualidade e Projeto de Software.

</div>
