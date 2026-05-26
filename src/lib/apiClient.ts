/**
 * src/lib/apiClient.ts
 *
 * Wrapper fino sobre `fetch` para chamar as rotas internas.
 * Centraliza:
 *  - serialização JSON
 *  - inclusão de credenciais (cookie de sessão)
 *  - tratamento padrão de erro (lança ApiError com a mensagem do servidor)
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* sem JSON — segue */
  }

  if (!res.ok) {
    const msg =
      (payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : '') || `Erro ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return payload as T;
}

export const api = {
  get:    <T>(path: string)                 => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown) => request<T>('POST',   path, body),
  patch:  <T>(path: string, body?: unknown) => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                 => request<T>('DELETE', path),
};

/* ─── Tipos compartilhados de resposta ───────────────────── */

export interface PublicUser {
  id: string;          // UUID do usuario
  nome: string;
  sobrenome: string;
  username: string;
  email: string;
  criadoEm: string;
}

export interface PuzzleResolvido {
  id: number;
  puzzleId: string;
  fase: number;
  rating: number | null;
  tentativas: number;
  acertou: boolean;
  anotacao: string | null;
  resolvidoEm: string;
  atualizadoEm: string;
}

/** Resposta de /api/users/me e /api/auth/login. */
export interface MeResponse {
  user: PublicUser;
  isAdmin: boolean;
}

/** Usuário na visão administrativa (/api/admin/users). */
export interface AdminUser extends PublicUser {
  ativo: boolean;
}
