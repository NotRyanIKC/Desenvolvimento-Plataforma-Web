/**
 * src/lib/session.ts
 *
 * Sessão por cookie assinado (HMAC-SHA256).
 *
 * Decisão de Sprint 2:
 *   Não usamos JWT nem next-auth ainda. O cookie guarda apenas o
 *   `usuarioId` (UUID v4 do usuario.id) e é assinado com SESSION_SECRET
 *   para evitar adulteração. Em Sprint 3 trocamos por JWT.
 *
 * Formato do cookie:
 *   <usuarioId>.<timestampExp>.<assinaturaBase64Url>
 *
 *   - usuarioId: UUID (formato 8-4-4-4-12, sem ponto)
 *   - timestampExp: epoch em segundos quando a sessão expira
 *   - assinatura: HMAC-SHA256 sobre "usuarioId.timestampExp"
 */

import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export const SESSION_COOKIE = 'cesuchess_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET ausente ou muito curto (mínimo 16 chars). Configure em .env.local.'
    );
  }
  return secret;
}

function base64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(payload: string): string {
  const mac = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest();
  return base64url(mac);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Codifica um cookie de sessão para o usuário informado.
 */
export function encodeSession(usuarioId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${usuarioId}.${exp}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/**
 * Decodifica e valida um cookie de sessão.
 * Retorna o usuarioId (UUID) se válido, ou null caso contrário.
 */
export function decodeSession(raw: string | undefined): string | null {
  if (!raw) return null;

  const parts = raw.split('.');
  if (parts.length !== 3) return null;

  const [usuarioId, expStr, signature] = parts;
  const payload = `${usuarioId}.${expStr}`;
  const expected = sign(payload);

  if (!timingSafeEqualStr(signature, expected)) return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;

  if (!UUID_RE.test(usuarioId)) return null;

  return usuarioId;
}

/**
 * Lê o cookie de sessão de um request do Next (API Routes).
 */
export function getSessionUserId(req: NextApiRequest): string | null {
  const cookieHeader = req.headers.cookie ?? '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));

  if (!match) return null;
  const value = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
  return decodeSession(value);
}

/**
 * Seta o cookie httpOnly de sessão no response.
 */
export function setSessionCookie(res: NextApiResponse, usuarioId: string): void {
  const value = encodeSession(usuarioId);
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

/**
 * Limpa o cookie de sessão (logout).
 */
export function clearSessionCookie(res: NextApiResponse): void {
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}
