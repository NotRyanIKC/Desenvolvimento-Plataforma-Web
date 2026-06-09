export type UseCaseStatus = 'active' | 'backlog';

export interface UseCaseCoverage {
  id: string;
  title: string;
  status: UseCaseStatus;
  automatedTests: string[];
}

export const useCases: UseCaseCoverage[] = [
  { id: 'UC-01', title: 'Criar conta', status: 'active', automatedTests: ['tests/e2e/auth-flow.spec.ts'] },
  { id: 'UC-02', title: 'Realizar login', status: 'active', automatedTests: ['tests/e2e/auth-flow.spec.ts'] },
  { id: 'UC-03', title: 'Realizar logout', status: 'active', automatedTests: ['tests/e2e/auth-flow.spec.ts'] },
  { id: 'UC-04', title: 'Recuperar senha', status: 'backlog', automatedTests: [] },
  { id: 'UC-05', title: 'Visualizar perfil', status: 'active', automatedTests: ['tests/e2e/profile-crud.spec.ts'] },
  { id: 'UC-06', title: 'Editar perfil', status: 'active', automatedTests: ['tests/e2e/profile-crud.spec.ts'] },
  { id: 'UC-07', title: 'Excluir conta', status: 'active', automatedTests: ['tests/e2e/profile-crud.spec.ts'] },
  { id: 'UC-08', title: 'Jogar partida 1v1 local', status: 'active', automatedTests: ['tests/e2e/game-archetypes.spec.ts', 'tests/unit/lib/gameRules.test.ts'] },
  { id: 'UC-09', title: 'Jogar contra bot', status: 'active', automatedTests: ['tests/e2e/game-archetypes.spec.ts', 'tests/unit/lib/botEngine.test.ts'] },
  { id: 'UC-10', title: 'Consultar histórico local de partidas', status: 'active', automatedTests: ['tests/e2e/game-archetypes.spec.ts', 'tests/unit/lib/gameHistory.test.ts'] },
  { id: 'UC-11', title: 'Listar puzzles', status: 'active', automatedTests: ['tests/e2e/puzzles-history-crud.spec.ts'] },
  { id: 'UC-12', title: 'Resolver puzzle', status: 'active', automatedTests: ['tests/e2e/puzzles-history-crud.spec.ts', 'tests/unit/lib/chessEngine.test.ts'] },
  { id: 'UC-13', title: 'Avançar para próximo puzzle', status: 'active', automatedTests: ['tests/e2e/puzzles-history-crud.spec.ts'] },
  { id: 'UC-14', title: 'Compartilhar resultado', status: 'backlog', automatedTests: [] },
  { id: 'UC-15', title: 'Visualizar estatísticas', status: 'backlog', automatedTests: [] },
  { id: 'UC-16', title: 'Publicar comentário', status: 'active', automatedTests: ['tests/e2e/comentarios-crud.spec.ts', 'tests/integration/lib/comentarios.test.ts', 'tests/unit/lib/comentarios.repository.test.ts'] },
  { id: 'UC-17', title: 'Visualizar comentários', status: 'active', automatedTests: ['tests/e2e/comentarios-crud.spec.ts', 'tests/integration/lib/comentarios.test.ts', 'tests/unit/lib/comentarios.repository.test.ts'] },
  { id: 'UC-18', title: 'Editar comentário próprio', status: 'active', automatedTests: ['tests/e2e/comentarios-crud.spec.ts', 'tests/integration/lib/comentarios.test.ts', 'tests/unit/lib/comentarios.repository.test.ts'] },
  { id: 'UC-19', title: 'Excluir comentário próprio', status: 'active', automatedTests: ['tests/e2e/comentarios-crud.spec.ts', 'tests/integration/lib/comentarios.test.ts', 'tests/unit/lib/comentarios.repository.test.ts'] },
  { id: 'UC-20', title: 'Cadastrar puzzle', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/puzzlesAdmin.test.ts', 'tests/unit/lib/puzzles.repository.test.ts'] },
  { id: 'UC-21', title: 'Listar puzzles administrativos', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/puzzlesAdmin.test.ts', 'tests/unit/lib/puzzles.repository.test.ts'] },
  { id: 'UC-22', title: 'Editar puzzle', status: 'active', automatedTests: ['tests/integration/lib/puzzlesAdmin.test.ts', 'tests/unit/lib/puzzles.repository.test.ts'] },
  { id: 'UC-23', title: 'Excluir puzzle', status: 'active', automatedTests: ['tests/integration/lib/puzzlesAdmin.test.ts', 'tests/unit/lib/puzzles.repository.test.ts'] },
  { id: 'UC-24', title: 'Cadastrar bot', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/bots.test.ts', 'tests/unit/lib/bots.repository.test.ts'] },
  { id: 'UC-25', title: 'Listar bots', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/bots.test.ts', 'tests/unit/lib/bots.repository.test.ts'] },
  { id: 'UC-26', title: 'Editar bot', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/bots.test.ts', 'tests/unit/lib/bots.repository.test.ts'] },
  { id: 'UC-27', title: 'Excluir bot', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/bots.test.ts', 'tests/unit/lib/bots.repository.test.ts'] },
  { id: 'UC-28', title: 'Cadastrar tema', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/temas.test.ts', 'tests/unit/lib/temas.repository.test.ts'] },
  { id: 'UC-29', title: 'Listar temas', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/temas.test.ts', 'tests/unit/lib/temas.repository.test.ts'] },
  { id: 'UC-30', title: 'Editar tema', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/temas.test.ts', 'tests/unit/lib/temas.repository.test.ts'] },
  { id: 'UC-31', title: 'Excluir tema', status: 'active', automatedTests: ['tests/e2e/admin-crud.spec.ts', 'tests/integration/lib/temas.test.ts', 'tests/unit/lib/temas.repository.test.ts'] },
  { id: 'UC-32', title: 'Resolver puzzles dos mestres', status: 'active', automatedTests: ['tests/e2e/puzzles-history-crud.spec.ts', 'tests/integration/lib/puzzlesAdmin.test.ts', 'tests/unit/lib/puzzles.repository.test.ts'] },
];
