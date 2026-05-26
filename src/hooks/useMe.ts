/**
 * src/hooks/useMe.ts
 *
 * Detecção de sessão para a navegação (NÃO é guarda de página, então não
 * redireciona — diferente de `useAdmin`). Lê o endpoint protegido
 * `/api/users/me` e expõe quem está logado e se é admin, pra UI decidir
 * quais links mostrar.
 *
 *   - sem sessão (401)      → user = null, isAdmin = false (anônimo)
 *   - sessão válida         → user preenchido, isAdmin conforme a resposta
 *
 * Enquanto carrega, `carregando` é true (a UI deve evitar piscar a nav).
 */

import { useEffect, useState } from 'react';
import { api, ApiError, type MeResponse, type PublicUser } from '@/lib/apiClient';

interface UseMeResult {
  carregando: boolean;
  user: PublicUser | null;
  isAdmin: boolean;
}

export function useMe(): UseMeResult {
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user, isAdmin } = await api.get<MeResponse>('/api/users/me');
        setUser(user);
        setIsAdmin(isAdmin);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Anônimo: mantém user null / isAdmin false.
          return;
        }
        // Outros erros: trata como anônimo pra não travar a navegação.
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  return { carregando, user, isAdmin };
}
