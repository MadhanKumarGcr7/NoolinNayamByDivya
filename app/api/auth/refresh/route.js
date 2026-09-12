/**
 * Token Refresh API Route — POST /api/auth/refresh
 * ────────────────────────────────────────────────────────────────────────────
 * Rotates refresh token and issues a fresh short-lived access token.
 * Prevents token replay by revoking the previous refresh token server-side.
 */

import { NextResponse } from 'next/server';
import {
  requireValidRefreshToken,
  signAccessToken,
  signRefreshToken,
  revokeRefreshToken,
  setSessionCookies,
  applySecurityHeaders,
  handleApiError,
  checkApiRateLimit,
  sanitizeRequestData,
} from '@/lib/security';

export async function POST(request) {
  try {
    // 1. Rate limit check
    const rateCheck = checkApiRateLimit(request, 'auth_login');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many refresh requests. Please retry in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Extract role from request body if specified
    const { body } = await sanitizeRequestData(request);
    const role = body?.role === 'owner' ? 'owner' : 'customer';

    // 3. Verify current refresh token
    const refreshResult = await requireValidRefreshToken(request, role);
    if (!refreshResult.valid) {
      const resp = NextResponse.json(
        { error: refreshResult.error },
        { status: refreshResult.status || 401 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { userId, tokenId } = refreshResult.decoded;

    // 4. Revoke current refresh token (Refresh Token Rotation)
    await revokeRefreshToken({
      tokenId,
      userId,
      role,
      reason: 'token_rotation',
    });

    // 5. Issue fresh access and refresh token pair
    const newAccessToken = signAccessToken({ userId, role });
    const { token: newRefreshToken } = signRefreshToken({ userId, role });

    // 6. Set updated cookies & apply security headers
    let response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      role,
    });

    response = setSessionCookies(response, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      role,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
