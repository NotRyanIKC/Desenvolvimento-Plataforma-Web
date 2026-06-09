# Como executar integração e E2E no CesuChess

## 1. Criar o arquivo local de testes

No PowerShell, dentro da pasta do projeto:

```powershell
Copy-Item .env.test.local.example .env.test.local
notepad .env.test.local
```

Informe a senha correta da instalação local do PostgreSQL:

```text
TEST_DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/cesuchess_test
TEST_SESSION_SECRET=cesuchess_test_secret_local_com_32_caracteres
```

Não use o banco principal `cesuchess`. Os testes apagam os dados do banco selecionado.

## 2. Criar ou atualizar o banco separado

```powershell
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres cesuchess_test
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cesuchess_test -f ".\DB\schema.sql"
```

Se o banco já existir, execute somente o segundo comando para atualizar o schema.

## 3. Conferir a conexão antes dos testes

```powershell
npm.cmd run test:integration:check
```

O comando valida:

- senha e porta do PostgreSQL;
- nome seguro do banco;
- existência das 12 tabelas necessárias;
- separação entre banco principal e banco de testes.

## 4. Executar integração

```powershell
npm.cmd run test:integration
```

## 5. Instalar o navegador do Playwright uma única vez

```powershell
npx.cmd playwright install chromium
```

## 6. Executar E2E

```powershell
npm.cmd run test:e2e
```

## 7. Executar a suíte geral

```powershell
npm.cmd run test:all
```

A suíte geral executa lint, Vitest e Playwright.
