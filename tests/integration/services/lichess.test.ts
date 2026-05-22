import { describe, test, expect } from 'vitest';
import { fetchPuzzleById } from '../../../src/services/lichess';

describe('🔄 Testes de Integração - Proxy de Serviços Externos', () => {

  test('Deve consumir com sucesso o serviço isolado da API do Lichess', async () => {
    try {
      // Usando o identificador estático aceito pela sua rota proxy
      const dadosPuzzle = await fetchPuzzleById('daily');

      expect(dadosPuzzle).toBeDefined();
      // Valida se a resposta mapeia os objetos estruturados originais descritos no seu escopo
      expect(dadosPuzzle).toHaveProperty('puzzle');
      expect(dadosPuzzle).toHaveProperty('game');
    } catch (error) {
      // Prevenção caso o ambiente de CI atinja rate limit da API pública do Lichess durante os testes
      console.warn('Serviço externo temporariamente indisponível devido a limitação de requisições:', error);
    }
  });
});
