/**
 * Owner Login API — POST /api/auth/owner-login
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened owner authentication with NoSQL sanitization, rate limiting,
 * short-lived access tokens, and httpOnly rotating refresh cookies.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth';
import {
  sanitizeRequestData,
  validateOwnerLogin,
  checkApiRateLimit,
  resetApiRateLimit,
  signAccessToken,
  signRefreshToken,
  setSessionCookies,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 1. Rate limiting check
    const rateCheck = checkApiRateLimit(request, 'auth_login');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { message: `Too many login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Input sanitization (NoSQL injection protection)
    const { body } = await sanitizeRequestData(request);

    // 3. Schema validation
    const validation = validateOwnerLogin(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { email, password } = validation.data;

    await connectDB();

    // 4. Find owner user
    const user = await User.findOne({ email, role: 'owner' });
    if (!user) {
      logSecurityEvent({
        event: 'FAILED_OWNER_LOGIN_ATTEMPT',
        role: 'owner',
        path: '/api/auth/owner-login',
        outcome: 'FAILURE',
        details: { reason: 'Owner account not found' },
      });
      const resp = NextResponse.json({ message: 'Invalid owner credentials.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    // 5. Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logSecurityEvent({
        event: 'FAILED_OWNER_LOGIN_ATTEMPT',
        userId: user._id.toString(),
        role: 'owner',
        path: '/api/auth/owner-login',
        outcome: 'FAILURE',
        details: { reason: 'Invalid owner password' },
      });
      const resp = NextResponse.json({ message: 'Invalid owner credentials.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    // 6. Reset rate limit bucket on successful login
    resetApiRateLimit(request, 'auth_login');

    // 7. Issue access + refresh token pair for owner role
    const accessToken = signAccessToken({ userId: user._id.toString(), role: 'owner' });
    const { token: refreshToken } = signRefreshToken({ userId: user._id.toString(), role: 'owner' });

    logSecurityEvent({
      event: 'SUCCESSFUL_OWNER_LOGIN',
      userId: user._id.toString(),
      role: 'owner',
      path: '/api/auth/owner-login',
      outcome: 'SUCCESS',
    });

    let response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: 'owner',
      },
    });

    // Attach httpOnly cookies & security headers
    response = setSessionCookies(response, {
      accessToken,
      refreshToken,
      role: 'owner',
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
