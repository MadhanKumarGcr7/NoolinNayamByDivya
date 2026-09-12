/**
 * Secure HTTP Headers & CORS / CSP Policy
 * ────────────────────────────────────────────────────────────────────────────
 * Enforces Helmet-equivalent secure headers, Strict Content Security Policy (CSP),
 * HSTS, X-Frame-Options, and origin-validated CORS for credentials.
 */

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://noolinnaayambydivya.com';

export function applySecurityHeaders(response, request = null) {
  if (!response) return response;

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Basic Hardening Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // 2. Content-Security-Policy (CSP)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // 3. Explicit CORS Policy (Never wildcard * with credentials)
  if (request) {
    const origin = request.headers.get('origin');
    if (origin && (!isProduction || origin === ALLOWED_ORIGIN)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
      );
    }
  }

  return response;
}
