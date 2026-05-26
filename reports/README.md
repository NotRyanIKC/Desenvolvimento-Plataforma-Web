# Relatórios de Análise Estática

Esta pasta guarda os relatórios gerados automaticamente pelas ferramentas de análise estática do CesuChess.

## Como gerar

```bash
# ESLint — análise de qualidade de código (Sprint 3)
npm run lint:report
# Saída: reports/eslint-report.html

# TypeScript — verificação de tipos (sem emitir arquivos)
npx tsc --noEmit

# Cobertura de testes (Sprint 3)
npm run test:coverage
# Saída: coverage/index.html
```

## O que cada relatório responde

| Relatório | Mede o quê | Meta Sprint 3 |
|---|---|---|
| `eslint-report.html` | Violações de boas práticas de JS/TS, regras do Next.js | 0 errors |
| `coverage/index.html` | % de linhas/funções/branches cobertas por testes | 70–80% nas libs |
| `playwright-report/index.html` | Resultados de testes E2E (UI, screenshots, traces) | Todos passando |

> **Observação:** Os relatórios HTML não são versionados (a pasta inteira está
> no `.gitignore`). Re-gere-os antes da apresentação rodando os comandos acima.

