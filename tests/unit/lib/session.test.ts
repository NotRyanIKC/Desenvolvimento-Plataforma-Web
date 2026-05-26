import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  encodeSession,
  decodeSession,
  getSessionUserId,
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE,
} from '../../../src/lib/session';

/**
 * Estes testes assumem a presença de SESSION_SECRET no ambiente.
 * Para garantir reprodutibilidade, fixamos um SECRET antes de importar
 * funções que dependam dele em runtime — o getSecret() é chamado a cada
 * sign/verify, então setar via env aqui é suficiente.
 */
const UUID_VALIDO = '11111111-2222-3333-4444-555555555555';
const SECRET_TESTE = 'chave-de-teste-com-tamanho-suficiente-32-chars';

describe('🧪 Testes Unitários - Sessão por Cookie Assinado (HMAC-SHA256)', () => {

  beforeAll(() => {
    process.env.SESSION_SECRET = SECRET_TESTE;
  });

  afterAll(() => {
    // não vazamos o secret de teste pro próximo arquivo
    delete process.env.SESSION_SECRET;
  });

  // ─── Round-trip ────────────────────────────────────────────────────────

  describe('encodeSession + decodeSession (round-trip)', () => {
    test('Deve codificar e decodificar o mesmo usuarioId', () => {
      const cookie = encodeSession(UUID_VALIDO);
      expect(cookie).toMatch(/^[0-9a-f-]+\.\d+\.[A-Za-z0-9_-]+$/);
      expect(decodeSession(cookie)).toBe(UUID_VALIDO);
    });

    test('Cookie codificado deve ter formato "usuarioId.exp.assinatura"', () => {
      const cookie = encodeSession(UUID_VALIDO);
      const partes = cookie.split('.');
      expect(partes).toHaveLength(3);
      expect(partes[0]).toBe(UUID_VALIDO);
    });
  });

  // ─── Adulteração ───────────────────────────────────────────────────────

  describe('decodeSession — proteção contra adulteração', () => {
    test('Deve recusar cookie com payload modificado (usuarioId trocado)', () => {
      const cookie = encodeSession(UUID_VALIDO);
      const partes = cookie.split('.');
      const outroUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      const adulterado = `${outroUuid}.${partes[1]}.${partes[2]}`;
      expect(decodeSession(adulterado)).toBeNull();
    });

    test('Deve recusar cookie com assinatura inválida', () => {
      const cookie = encodeSession(UUID_VALIDO);
      const partes = cookie.split('.');
      const adulterado = `${partes[0]}.${partes[1]}.assinaturaFalsa12345`;
      expect(decodeSession(adulterado)).toBeNull();
    });

    test('Deve recusar cookie com timestamp adulterado', () => {
      const cookie = encodeSession(UUID_VALIDO);
      const partes = cookie.split('.');
      // estende o prazo, mas a assinatura não bate
      const adulterado = `${partes[0]}.9999999999.${partes[2]}`;
      expect(decodeSession(adulterado)).toBeNull();
    });
  });

  // ─── Formato malformado ────────────────────────────────────────────────

  describe('decodeSession — entradas inválidas', () => {
    test('Deve retornar null para cookie undefined', () => {
      expect(decodeSession(undefined)).toBeNull();
    });

    test('Deve retornar null para cookie vazio', () => {
      expect(decodeSession('')).toBeNull();
    });

    test('Deve retornar null para cookie sem os 3 segmentos esperados', () => {
      expect(decodeSession('soumeio')).toBeNull();
      expect(decodeSession('a.b')).toBeNull();
      expect(decodeSession('a.b.c.d')).toBeNull();
    });

    test('Deve retornar null para usuarioId que não é UUID válido', () => {
      // não vou conseguir gerar uma assinatura válida pra "abc" sem expor sign(),
      // então testamos a falha por formato chegando junto com falha de assinatura
      expect(decodeSession('abc.123.xyz')).toBeNull();
    });
  });

  // ─── Expiração ─────────────────────────────────────────────────────────

  describe('decodeSession — expiração', () => {
    test('Cookie recém-criado deve ter expiração ~7 dias à frente', () => {
      const cookie = encodeSession(UUID_VALIDO);
      const exp = Number(cookie.split('.')[1]);
      const agora = Math.floor(Date.now() / 1000);
      const setedias = 60 * 60 * 24 * 7;

      // tolerância de 5s pra latência do teste
      expect(exp - agora).toBeGreaterThanOrEqual(setedias - 5);
      expect(exp - agora).toBeLessThanOrEqual(setedias + 5);
    });
  });

  // ─── getSessionUserId (leitura do cookie no request) ─────────────────────

  describe('getSessionUserId', () => {
    function reqComCookie(cookie?: string): NextApiRequest {
      return { headers: cookie === undefined ? {} : { cookie } } as NextApiRequest;
    }

    test('Deve extrair o usuarioId de um cookie de sessão válido', () => {
      const valor = encodeURIComponent(encodeSession(UUID_VALIDO));
      const req = reqComCookie(`outro=1; ${SESSION_COOKIE}=${valor}`);
      expect(getSessionUserId(req)).toBe(UUID_VALIDO);
    });

    test('Deve retornar null quando não há header de cookie', () => {
      expect(getSessionUserId(reqComCookie())).toBeNull();
    });

    test('Deve retornar null quando o cookie de sessão não está presente', () => {
      expect(getSessionUserId(reqComCookie('tema=escuro'))).toBeNull();
    });

    test('Deve retornar null para cookie de sessão adulterado', () => {
      const req = reqComCookie(`${SESSION_COOKIE}=valor.invalido.assinatura`);
      expect(getSessionUserId(req)).toBeNull();
    });
  });

  // ─── setSessionCookie / clearSessionCookie ───────────────────────────────

  describe('setSessionCookie e clearSessionCookie', () => {
    function resFake() {
      const setHeader = vi.fn();
      return { res: { setHeader } as unknown as NextApiResponse, setHeader };
    }

    test('setSessionCookie escreve Set-Cookie httpOnly com Max-Age positivo', () => {
      const { res, setHeader } = resFake();
      setSessionCookie(res, UUID_VALIDO);
      expect(setHeader).toHaveBeenCalledTimes(1);
      const [nome, valor] = setHeader.mock.calls[0];
      expect(nome).toBe('Set-Cookie');
      expect(valor).toContain(`${SESSION_COOKIE}=`);
      expect(valor).toContain('HttpOnly');
      expect(valor).toContain('SameSite=Lax');
      expect(valor).toContain(`Max-Age=${60 * 60 * 24 * 7}`);
    });

    test('clearSessionCookie zera o cookie (Max-Age=0)', () => {
      const { res, setHeader } = resFake();
      clearSessionCookie(res);
      const valor = String(setHeader.mock.calls[0][1]);
      expect(valor).toContain(`${SESSION_COOKIE}=`);
      expect(valor).toContain('Max-Age=0');
    });
  });

  // ─── getSecret (segredo ausente) ─────────────────────────────────────────

  describe('proteção de SESSION_SECRET', () => {
    test('encodeSession lança quando o segredo está ausente ou é curto', () => {
      const anterior = process.env.SESSION_SECRET;
      try {
        delete process.env.SESSION_SECRET;
        expect(() => encodeSession(UUID_VALIDO)).toThrow(/SESSION_SECRET/);

        process.env.SESSION_SECRET = 'curto';
        expect(() => encodeSession(UUID_VALIDO)).toThrow(/SESSION_SECRET/);
      } finally {
        process.env.SESSION_SECRET = anterior;
      }
    });
  });

});
