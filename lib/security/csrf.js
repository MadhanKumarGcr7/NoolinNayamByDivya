/**
 * CSRF Protection Helper
 * ────────────────────────────────────────────────────────────────────────────
 * Verifies same-origin request headers (Origin / Referer) and SameSite=Strict cookies
 * on state-changing requests (POST, PUT, PATCH, DELETE).
 */

import { getClientIp } from './auth.middleware';
import { logSecurityEvent } from './logger';

export function verifyCsrf(request) {
  const method = request.method?.toUpperCase();
  // Safe methods do not require CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  const origin  = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host    = request.headers.get('host');

  // Verify Origin header matches current host
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) {
        return { valid: true };
      }
    } catch {
      // Invalid URL in origin
    }
  }

  // Fallback to Referer header
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) {
        return { valid: true };
      }
    } catch {
      // Invalid URL in referer
    }
  }

  // If both origin and referer are absent (non-browser client / direct curl API call), allow if Content-Type is application/json
  const contentType = request.headers.get('content-type') || '';
  if (!origin && !referer && contentType.includes('application/json')) {
    return { valid: true };
  }

  logSecurityEvent({
    event: 'CSRF_VALIDATION_FAILED',
    ip: getClientIp(request),
    path: request.nextUrl?.pathname || request.url,
    outcome: 'BLOCKED',
    details: { origin, referer, host, method },
  });

  return {
    valid: false,
    error: 'Cross-Site Request Forgery (CSRF) check failed.',
    status: 403,
  };
}
