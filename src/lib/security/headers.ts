import { NextResponse } from 'next/server';

export function withSecurityHeaders(response: NextResponse): NextResponse {
  const isDev = process.env.NODE_ENV !== 'production';
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com https://frontend-cdn.perplexity.ai",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src 'self'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com",
    "worker-src 'self' blob:",
  ].join('; ');

  response.headers.set('Content-Security-Policy', policy);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (!isDev) response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}
