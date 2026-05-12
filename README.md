# ♟️ CesuChess

Uma plataforma web moderna para jogar xadrez, desenvolvida como parte do **Projeto Prático de Qualidade e Projeto de Software**. Este projeto visa entregar uma experiência fluida, interativa e responsiva para os amantes do jogo de tabuleiro mais famoso do mundo.

---

## 📋 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)


---

## 💻 Sobre o Projeto

A **Plataforma de Xadrez Web** permite que jogadores disputem partidas de xadrez diretamente do navegador, com uma interface amigável construída utilizando as mais recentes tecnologias de desenvolvimento web. O foco principal é aprender e aplicar conceitos avançados de Front-end e Back-end (APIs) num ecossistema real.

---

## 🛠 Tecnologias Utilizadas

Este projeto está sendo desenvolvido com as seguintes tecnologias:

- **[Next.js](https://nextjs.org/)** - Framework React para renderização e rotas.
- **[React](https://reactjs.org/)** - Biblioteca JavaScript para construção de interfaces.
- **[TypeScript](https://www.typescriptlang.org/)** - Superset de JavaScript que adiciona tipagem estática ao código.
- **[CSS Modules / Tailwind CSS]** - Para estilização da aplicação.
- **[ESLint](https://eslint.org/)** - Ferramenta para manter o padrão e qualidade do código.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina o [Node.js](https://nodejs.org/en/) e um gerenciador de pacotes como o [NPM](https://www.npmjs.com/), [Yarn](https://yarnpkg.com/) ou [PNPM](https://pnpm.io/).

### Rodando a Aplicação (Ambiente de Desenvolvimento)

1. Clone este repositório:
   ```bash
   git clone [https://github.com/NotRyanIKC/Desenvolvimento-Plataforma-Web.git](https://github.com/NotRyanIKC/Desenvolvimento-Plataforma-Web.git)

2. Acesse a pasta do projeto:
   ```bash
   cd Desenvolvimento-Plataforma-Web
   
3. Instale as dependências:
   ```bash
   npm install
   
4. Inicie o Servidor de desenvolvimento:
   ```bash
   npm run dev

5. Abra o navegador e acesse http://localhost:3000.

## 📂 Estrutura do Projeto

A estrutura de diretórios principal está dividida da seguinte forma:
```bash

├── public/            # Arquivos públicos e estáticos (imagens, ícones, etc)
├── src/               # Código fonte principal
│   ├── pages/         # Rotas da aplicação Next.js e APIs
│   ├── components/    # Componentes reutilizáveis (Tabuleiro, Peças, etc)
│   ├── styles/        # Arquivos globais de CSS
│   └── utils/         # Funções auxiliares e lógicas de xadrez
├── .gitignore         # Arquivos ignorados pelo Git
├── eslint.config.mjs  # Configurações do Linter
├── next.config.ts     # Configurações do Next.js
├── package.json       # Dependências e scripts do projeto
└── tsconfig.json      # Configurações do TypeScript
