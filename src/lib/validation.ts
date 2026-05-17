/**
 * src/lib/validation.ts
 *
 * Validações reutilizáveis nas rotas de API.
 * Cada função retorna `null` quando o valor é válido ou uma string
 * descritiva do erro caso contrário.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,40}$/;

export function validateNome(nome: unknown): string | null {
  if (typeof nome !== 'string') return 'Nome inválido.';
  const trimmed = nome.trim();
  if (trimmed.length < 2) return 'Nome deve ter no mínimo 2 caracteres.';
  if (trimmed.length > 80) return 'Nome deve ter no máximo 80 caracteres.';
  return null;
}

export function validateSobrenome(sobrenome: unknown): string | null {
  if (typeof sobrenome !== 'string') return 'Sobrenome inválido.';
  const trimmed = sobrenome.trim();
  if (trimmed.length < 2) return 'Sobrenome deve ter no mínimo 2 caracteres.';
  if (trimmed.length > 80) return 'Sobrenome deve ter no máximo 80 caracteres.';
  return null;
}

export function validateUsername(username: unknown): string | null {
  if (typeof username !== 'string') return 'Nome de usuário inválido.';
  if (!USERNAME_RE.test(username))
    return 'Username deve ter 3-40 caracteres (letras, números ou _).';
  return null;
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return 'E-mail inválido.';
  if (email.length > 120) return 'E-mail muito longo.';
  if (!EMAIL_RE.test(email)) return 'Formato de e-mail inválido.';
  return null;
}

export function validateSenha(senha: unknown): string | null {
  if (typeof senha !== 'string') return 'Senha inválida.';
  if (senha.length < 8) return 'Senha deve ter no mínimo 8 caracteres.';
  if (senha.length > 200) return 'Senha muito longa.';
  return null;
}

/**
 * Roda uma sequência de validações e devolve o primeiro erro encontrado,
 * ou null se todas passarem.
 */
export function firstError(
  ...errors: Array<string | null>
): string | null {
  for (const e of errors) if (e) return e;
  return null;
}
