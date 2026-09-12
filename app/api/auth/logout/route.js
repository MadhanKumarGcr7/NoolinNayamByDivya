/**
 * Logout API — POST /api/auth/logout
 * ────────────────────────────────────────────────────────────────────────────
 * Server-side session termination: revokes refresh tokens in MongoDB and
 * clears httpOnly cookies for customer and owner sessions.
 */

import { NextResponse } from 'next/server';
import {
  parseRequestCookies,
  verifyRefreshToken,
  revokeRefreshToken,
  clearSessionCookies,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
  CUSTOMER_REFRESH_COOKIE,
  OWNER_REFRESH_COOKIE,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const cookies = parseRequestCookies(request);

    // Check customer refresh token
    const customerRefresh = cookies[CUSTOMER_REFRESH_COOKIE];
    if (customerRefresh) {
      const decoded = verifyRefreshToken(customerRefresh);
      if (decoded?.tokenId) {
        await revokeRefreshToken({
          tokenId: decoded.tokenId,
          userId: decoded.userId,
          role: 'customer',
          reason: 'user_logout',
        });
      }
    }

    // Check owner refresh token
    const ownerRefresh = cookies[OWNER_REFRESH_COOKIE];
    if (ownerRefresh) {
      const decoded = verifyRefreshToken(ownerRefresh);
      if (decoded?.tokenId) {
        await revokeRefreshToken({
          tokenId: decoded.tokenId,
          userId: decoded.userId,
          role: 'owner',
          reason: 'owner_logout',
        });
      }
    }

    logSecurityEvent({
      event: 'USER_LOGOUT',
      path: '/api/auth/logout',
      outcome: 'SUCCESS',
    });

    let response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookies for both customer and owner
    response = clearSessionCookies(response, 'customer');
    response = clearSessionCookies(response, 'owner');

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
