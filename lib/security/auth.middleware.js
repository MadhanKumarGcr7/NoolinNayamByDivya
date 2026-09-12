/**
 * Auth Middleware — Server-Side Role & Token Verification
 * ────────────────────────────────────────────────────────────────────────────
 * Enforces customer vs owner authentication on all protected API routes.
 * Prevents unauthorized access or customer access to admin features.
 */

import { verifyAccessToken, verifyRefreshToken, isTokenRevoked } from './jwt';
import { parseRequestCookies, CUSTOMER_ACCESS_COOKIE, OWNER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE, OWNER_REFRESH_COOKIE } from './session';
import { logSecurityEvent } from './logger';

/**
 * Get client IP address from request headers
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Extract auth credentials and verify against required role
 * @param {Request} request Next.js server request
 * @param {'customer' | 'owner'} requiredRole
 * @returns {Promise<{ authenticated: boolean, user?: { userId: string, role: string }, error?: string, status?: number }>}
 */
export async function requireAuth(request, requiredRole = 'customer') {
  const ip = getClientIp(request);
  const path = request.nextUrl?.pathname || request.url || '';
  const cookies = parseRequestCookies(request);

  // Determine cookie name based on required role
  const cookieName = requiredRole === 'owner' ? OWNER_ACCESS_COOKIE : CUSTOMER_ACCESS_COOKIE;
  let token = cookies[cookieName];

  // Fallback to Bearer token in Authorization header if present
  if (!token) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    logSecurityEvent({
      event: 'UNAUTHENTICATED_ACCESS_ATTEMPT',
      role: requiredRole,
      ip,
      path,
      outcome: 'BLOCKED',
      details: { reason: 'No auth token provided' },
    });
    return {
      authenticated: false,
      error: 'Authentication required. Please log in.',
      status: 401,
    };
  }

  // Verify access token
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    logSecurityEvent({
      event: 'INVALID_TOKEN_ATTEMPT',
      role: requiredRole,
      ip,
      path,
      outcome: 'BLOCKED',
      details: { reason: 'Access token expired or signature invalid' },
    });
    return {
      authenticated: false,
      error: 'Session expired or invalid. Please log in again.',
      status: 401,
    };
  }

  // Enforce role check
  if (decoded.role !== requiredRole) {
    logSecurityEvent({
      event: 'UNAUTHORIZED_ROLE_ACCESS',
      userId: decoded.userId,
      role: decoded.role,
      ip,
      path,
      outcome: 'BLOCKED',
      details: { requiredRole, userRole: decoded.role },
    });
    return {
      authenticated: false,
      error: 'Forbidden: You do not have permission to access this resource.',
      status: 403,
    };
  }

  return {
    authenticated: true,
    user: decoded,
  };
}

/**
 * Validate refresh token for token renewal endpoint
 */
export async function requireValidRefreshToken(request, role = 'customer') {
  const cookies = parseRequestCookies(request);
  const cookieName = role === 'owner' ? OWNER_REFRESH_COOKIE : CUSTOMER_REFRESH_COOKIE;
  const refreshToken = cookies[cookieName];

  if (!refreshToken) {
    return { valid: false, error: 'No refresh token provided', status: 401 };
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return { valid: false, error: 'Invalid or expired refresh token', status: 401 };
  }

  if (decoded.role !== role) {
    return { valid: false, error: 'Role mismatch on refresh token', status: 403 };
  }

  // Check if refresh token has been revoked server-side
  const revoked = await isTokenRevoked(decoded.tokenId);
  if (revoked) {
    logSecurityEvent({
      event: 'REVOKED_TOKEN_REUSE_ATTEMPT',
      userId: decoded.userId,
      role: decoded.role,
      outcome: 'BLOCKED',
      details: { tokenId: decoded.tokenId },
    });
    return { valid: false, error: 'Refresh token has been revoked', status: 401 };
  }

  return { valid: true, decoded };
}
