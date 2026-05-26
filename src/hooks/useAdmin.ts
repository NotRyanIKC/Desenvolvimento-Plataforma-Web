/**
 * src/hooks/useAdmin.ts
 *
 * Guarda das páginas de administração. Replica o padrão de proteção do app
 * (chamar um endpoint protegido e redirecionar conforme o resultado), aqui
 * centralizado porque as quatro telas de admin usam a mesma regra:
 *   - 401 (sem sessão)      → /routes/login
 *   - logado mas não-admin  → /routes/profile
 *
 * Enquanto carrega, `carregando` é true; quando o usuário não é admin (e o
 * redirect está em curso), `user` permanece null para não vazar conteúdo.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api, ApiError, type MeResponse, type PublicUser } from '@/lib/apiClient';

interface UseAdminResult {
  carregando: boolean;
  user: PublicUser | null;
}

export function useAdmin(): UseAdminResult {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { user, isAdmin } = await api.get<MeResponse>('/api/users/me');
        if (!isAdmin) {
          router.replace('/routes/profile');
          return;
        }
        setUser(user);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/routes/login');
          return;
        }
        // Outros erros: mantém user null; a tela mostra estado vazio.
      } finally {
        setCarregando(false);
      }
    })();
  }, [router]);

  return { carregando, user };
}
