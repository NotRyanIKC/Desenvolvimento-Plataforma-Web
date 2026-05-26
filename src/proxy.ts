/**
 * src/proxy.ts
 *
 * Convenção "proxy" do Next 16 (sucessora do antigo middleware.ts). Registra
 * TODA navegação de página no arquivo de log — complementa o withRequestLog,
 * que cobre as rotas de API; juntos cobrem "todas as requisições".
 *
 * Roda no Edge runtime (padrão), que NÃO acessa o filesystem. Por isso não
 * escreve o arquivo direto: encaminha os metadados, em "fire-and-forget"
 * (event.waitUntil), para a rota interna /api/_internal/log, que roda no
 * Node.js e grava via requestLogger.
 *
 * O matcher exclui /api/* (já coberto pelo withRequestLog — e evita logar a
 * própria rota de log), os internos do Next (_next/*) e arquivos estáticos.
 */

import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const fwd = request.headers.get('x-forwarded-for');

  const entry = {
    type: 'page' as const,
    method: request.method,
    path: request.nextUrl.pathname,
    ip: fwd ? fwd.split(',')[0].trim() : null,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  };

  // Não bloqueia a navegação: dispara a gravação e segue.
  event.waitUntil(
    fetch(new URL('/api/_internal/log', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      /* log é best-effort; falha não afeta a navegação */
    })
  );

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
