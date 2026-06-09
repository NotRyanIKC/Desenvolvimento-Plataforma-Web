# Changelog

## [0.2.0] - 2026-06-08

### Adicionado

- CRUD administrativo completo de temas (`tema`) no schema, migracao, repositorio, APIs e interface.
- Parametros simples de estrategia para bots, com controle de agressividade.
- Endpoint publico `/api/bots` para listar somente bots ativos.
- Endpoint publico `/api/temas` para listar somente temas ativos.
- Partida 1v1 local com alternancia de turnos.
- Partida contra bot com resposta automatica por nivel de dificuldade.
- Historico local das partidas jogaveis no navegador.
- Testes unitarios, de integracao e E2E para bots, temas e partidas.
- Matriz de rastreabilidade e teste automatizado que exige cobertura documental de todo UC ativo.

### Corrigido

- Documentacao ajustada para nao apresentar recuperacao de senha, compartilhamento e estatisticas consolidadas como funcionalidades entregues.
- Configuracao do Vitest atualizada para compatibilidade com a versao instalada.
- Helpers de reset de banco atualizados para incluir a tabela `tema`.

## [0.2.1] - 2026-06-09

### Testes

- Ampliação da cobertura unitária dos repositórios de bots, temas, puzzles, comentários, puzzles resolvidos e usuários.
- Inclusão de cenários adicionais para estratégia do bot, histórico local e regras da partida.
- Execução da suíte unitária sem obrigatoriedade de banco local, preservando os testes de integração quando `TEST_DATABASE_URL` estiver configurada.
- Configuração de importação LCOV para análise no SonarQube.

## [0.2.2-local] - 2026-06-09

### Testes de integração e E2E
- Remove credenciais PostgreSQL fixas do Playwright e dos helpers E2E.
- Adiciona `.env.test.local.example` para configuração local segura.
- Cria verificação automática da conexão e do schema antes das suítes destrutivas.
- Bloqueia execução sobre bancos cujo nome não contenha `test`.
- Separa os testes de integração do CRUD de bots.
- Limpa o banco antes de cada cenário E2E para eliminar dependência de ordem.
- Adiciona cenário Playwright para bot ativo disponível na partida contra máquina.
