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

/* ─── Validações administrativas (puzzles e bots) ────────── */

const NIVEIS_DIFICULDADE = ['facil', 'medio', 'dificil'];

export function validatePuzzleNome(nome: unknown): string | null {
  if (typeof nome !== 'string') return 'Nome do puzzle inválido.';
  const trimmed = nome.trim();
  if (trimmed.length < 2) return 'Nome do puzzle deve ter no mínimo 2 caracteres.';
  if (trimmed.length > 120) return 'Nome do puzzle deve ter no máximo 120 caracteres.';
  return null;
}

export function validateFen(fen: unknown): string | null {
  if (typeof fen !== 'string') return 'FEN inválido.';
  const trimmed = fen.trim();
  if (trimmed.length < 10) return 'FEN muito curto.';
  if (trimmed.length > 100) return 'FEN muito longo.';
  return null;
}

export function validateSolucao(solucao: unknown): string | null {
  if (!Array.isArray(solucao) || solucao.length === 0)
    return 'Solução deve ter ao menos um lance.';
  if (!solucao.every((m) => typeof m === 'string' && m.trim().length > 0))
    return 'Cada lance da solução deve ser um texto não vazio (UCI).';
  return null;
}

export function validateFase(fase: unknown): string | null {
  if (typeof fase !== 'number' || !Number.isInteger(fase) || fase < 1)
    return 'Fase deve ser um inteiro maior ou igual a 1.';
  return null;
}

export function validateRating(rating: unknown): string | null {
  if (typeof rating !== 'number' || !Number.isFinite(rating))
    return 'Rating inválido.';
  if (rating < 0 || rating > 4000) return 'Rating deve estar entre 0 e 4000.';
  return null;
}

export function validateBotNome(nome: unknown): string | null {
  if (typeof nome !== 'string') return 'Nome do bot inválido.';
  const trimmed = nome.trim();
  if (trimmed.length < 2) return 'Nome do bot deve ter no mínimo 2 caracteres.';
  if (trimmed.length > 60) return 'Nome do bot deve ter no máximo 60 caracteres.';
  return null;
}

export function validateNivelDificuldade(nivel: unknown): string | null {
  if (typeof nivel !== 'string' || !NIVEIS_DIFICULDADE.includes(nivel))
    return "Nível deve ser 'facil', 'medio' ou 'dificil'.";
  return null;
}

export function validateParametrosEstrategia(parametros: unknown): string | null {
  if (parametros === undefined) return null;
  if (!parametros || typeof parametros !== 'object' || Array.isArray(parametros))
    return 'Parâmetros de estratégia devem ser um objeto JSON.';
  const entries = Object.entries(parametros);
  if (entries.length > 20) return 'Parâmetros de estratégia excedem o limite de 20 itens.';
  if (
    !entries.every(
      ([chave, valor]) =>
        chave.trim().length > 0 &&
        chave.length <= 40 &&
        (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean')
    )
  )
    return 'Cada parâmetro deve ter chave válida e valor textual, numérico ou booleano.';
  return null;
}

export function validateTemaNome(nome: unknown): string | null {
  if (typeof nome !== 'string') return 'Nome do tema inválido.';
  const trimmed = nome.trim();
  if (trimmed.length < 2) return 'Nome do tema deve ter no mínimo 2 caracteres.';
  if (trimmed.length > 60) return 'Nome do tema deve ter no máximo 60 caracteres.';
  return null;
}

export function validateTemaDescricao(descricao: unknown): string | null {
  if (descricao === null || descricao === undefined) return null;
  if (typeof descricao !== 'string') return 'Descrição do tema inválida.';
  if (descricao.trim().length > 500) return 'Descrição do tema deve ter no máximo 500 caracteres.';
  return null;
}

/* ─── Validação de Comentários (UC-16, UC-18) ────────────── */

const COMENTARIO_MIN = 1;
const COMENTARIO_MAX = 1000;

export function validateComentarioTexto(texto: unknown): string | null {
  if (typeof texto !== 'string') return 'Texto do comentário inválido.';
  const trimmed = texto.trim();
  if (trimmed.length < COMENTARIO_MIN)
    return 'O comentário não pode estar vazio.';
  if (trimmed.length > COMENTARIO_MAX)
    return `O comentário deve ter no máximo ${COMENTARIO_MAX} caracteres.`;
  return null;
}

export function validatePuzzleLichessId(id: unknown): string | null {
  if (typeof id !== 'string') return 'ID do puzzle inválido.';
  const trimmed = id.trim();
  if (trimmed.length < 1 || trimmed.length > 40)
    return 'ID do puzzle deve ter de 1 a 40 caracteres.';
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
