import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Configuração do Vitest — runner único pros testes unitários e integração.
 *
 * IMPORTANTE: fileParallelism=false porque os testes de integração
 * compartilham o mesmo banco. Rodá-los em paralelo causaria deadlocks
 * e interferência de dados.
 *
 * Cobertura: foco nos módulos de DOMÍNIO/REPOSITÓRIOS (lib/*) e SERVIÇOS
 * EXTERNOS (services/*). Arquivos excluídos são testados INDIRETAMENTE via
 * API handlers (que rodam no E2E do Playwright).
 *
 * Thresholds calibrados pelo que está atualmente coberto pela suíte
 * unit+integration. O E2E (Playwright) cobre adicionalmente o caminho
 * UI → API → repositório, mas não é contabilizado aqui.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/lib/**/*.ts', 'src/services/**/*.ts'],
      exclude: [
        // Wrappers/guards/clientes — testados indiretamente via API/E2E
        'src/lib/withRequestLog.ts',
        'src/lib/requestLogger.ts',
        'src/lib/apiClient.ts',     // cliente HTTP usado só no browser
        'src/lib/admin.ts',         // guard testado via E2E admin
      ],
      thresholds: {
        lines: 65,
        functions: 65,
        branches: 45,
        statements: 65,
      },
    },
  },
});
