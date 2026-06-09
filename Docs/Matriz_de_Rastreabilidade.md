## Casos de uso

| ID | Caso de uso | Situacao | Testes automatizados |
|---|---|---|---|
| UC-01 | Criar conta | Ativo | `tests/e2e/auth-flow.spec.ts` |
| UC-02 | Realizar login | Ativo | `tests/e2e/auth-flow.spec.ts` |
| UC-03 | Realizar logout | Ativo | `tests/e2e/auth-flow.spec.ts` |
| UC-04 | Recuperar senha | Backlog | - |
| UC-05 | Visualizar perfil | Ativo | `tests/e2e/profile-crud.spec.ts` |
| UC-06 | Editar perfil | Ativo | `tests/e2e/profile-crud.spec.ts` |
| UC-07 | Excluir conta | Ativo | `tests/e2e/profile-crud.spec.ts` |
| UC-08 | Jogar partida 1v1 local | Ativo | `tests/e2e/game-archetypes.spec.ts; tests/unit/lib/gameRules.test.ts` |
| UC-09 | Jogar contra bot | Ativo | `tests/e2e/game-archetypes.spec.ts; tests/unit/lib/botEngine.test.ts` |
| UC-10 | Consultar historico local de partidas | Ativo | `tests/e2e/game-archetypes.spec.ts; tests/unit/lib/gameHistory.test.ts` |
| UC-11 | Listar puzzles | Ativo | `tests/e2e/puzzles-history-crud.spec.ts` |
| UC-12 | Resolver puzzle | Ativo | `tests/e2e/puzzles-history-crud.spec.ts; tests/unit/lib/chessEngine.test.ts` |
| UC-13 | Avancar para proximo puzzle | Ativo | `tests/e2e/puzzles-history-crud.spec.ts` |
| UC-14 | Compartilhar resultado | Backlog | - |
| UC-15 | Visualizar estatisticas | Backlog | - |
| UC-16 | Publicar comentario | Ativo | `tests/e2e/comentarios-crud.spec.ts; tests/integration/lib/comentarios.test.ts; tests/unit/lib/comentarios.repository.test.ts` |
| UC-17 | Visualizar comentarios | Ativo | `tests/e2e/comentarios-crud.spec.ts; tests/integration/lib/comentarios.test.ts; tests/unit/lib/comentarios.repository.test.ts` |
| UC-18 | Editar comentario proprio | Ativo | `tests/e2e/comentarios-crud.spec.ts; tests/integration/lib/comentarios.test.ts; tests/unit/lib/comentarios.repository.test.ts` |
| UC-19 | Excluir comentario proprio | Ativo | `tests/e2e/comentarios-crud.spec.ts; tests/integration/lib/comentarios.test.ts; tests/unit/lib/comentarios.repository.test.ts` |
| UC-20 | Cadastrar puzzle | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/puzzlesAdmin.test.ts; tests/unit/lib/puzzles.repository.test.ts` |
| UC-21 | Listar puzzles administrativos | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/puzzlesAdmin.test.ts; tests/unit/lib/puzzles.repository.test.ts` |
| UC-22 | Editar puzzle | Ativo | `tests/integration/lib/puzzlesAdmin.test.ts; tests/unit/lib/puzzles.repository.test.ts` |
| UC-23 | Excluir puzzle | Ativo | `tests/integration/lib/puzzlesAdmin.test.ts; tests/unit/lib/puzzles.repository.test.ts` |
| UC-24 | Cadastrar bot | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/bots.test.ts; tests/unit/lib/bots.repository.test.ts` |
| UC-25 | Listar e pesquisar bots | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/bots.test.ts; tests/unit/lib/bots.repository.test.ts` |
| UC-26 | Editar bot | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/bots.test.ts; tests/unit/lib/bots.repository.test.ts` |
| UC-27 | Excluir bot | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/bots.test.ts; tests/unit/lib/bots.repository.test.ts` |
| UC-28 | Cadastrar tema | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/temas.test.ts; tests/unit/lib/temas.repository.test.ts` |
| UC-29 | Listar e pesquisar temas | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/temas.test.ts; tests/unit/lib/temas.repository.test.ts` |
| UC-30 | Editar tema | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/temas.test.ts; tests/unit/lib/temas.repository.test.ts` |
| UC-31 | Excluir tema | Ativo | `tests/e2e/admin-crud.spec.ts; tests/integration/lib/temas.test.ts; tests/unit/lib/temas.repository.test.ts` |
| UC-32 | Resolver puzzles dos mestres | Ativo | `tests/e2e/puzzles-history-crud.spec.ts; tests/integration/lib/puzzlesAdmin.test.ts; tests/unit/lib/puzzles.repository.test.ts` |

## Auditoria dos CRUDs

| Modulo | Endpoint principal | Resultado | Casos de uso |
|---|---|---|---|
| Usuario (self) | `GET / PATCH / DELETE /api/users/me` | Existente e coerente | UC-05 a UC-07 |
| Puzzles resolvidos | `GET / POST / PATCH / DELETE /api/puzzles/solved` | Existente e coerente | Historico de puzzles |
| Comentarios | `GET / POST / PATCH / DELETE /api/comentarios` | Existente e coerente | UC-16 a UC-19 |
| Puzzle administrativo | `GET / POST / PATCH / DELETE /api/admin/puzzles` | Existente e coerente | UC-20 a UC-23 |
| Bot administrativo | `GET / POST / PATCH / DELETE /api/admin/bots` | Completo e coberto na v0.2.2 | UC-24 a UC-27 |
| Tema administrativo | `GET / POST / PATCH / DELETE /api/admin/temas` | Implementado e coberto na v0.2.2 | UC-28 a UC-31 |
| Usuarios administrativos | `GET /api/admin/users` | Listagem, nao CRUD | Ferramenta auxiliar |

