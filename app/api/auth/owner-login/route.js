/**
 * Owner Login API — POST /api/auth/owner-login (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened owner authentication with input sanitization, rate limiting,
 * short-lived access tokens, and httpOnly rotating refresh cookies.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    const rateCheck = checkApiRateLimit(request, 'auth_login');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { message: `Too many login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);

    const validation = validateOwnerLogin(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findFirst({
      where: { email, role: 'owner' },
    });

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

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      logSecurityEvent({
        event: 'FAILED_OWNER_LOGIN_ATTEMPT',
        userId: String(user.id),
        role: 'owner',
        path: '/api/auth/owner-login',
        outcome: 'FAILURE',
        details: { reason: 'Invalid owner password' },
      });
      const resp = NextResponse.json({ message: 'Invalid owner credentials.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    resetApiRateLimit(request, 'auth_login');

    const accessToken = signAccessToken({ userId: String(user.id), role: 'owner' });
    const { token: refreshToken } = signRefreshToken({ userId: String(user.id), role: 'owner' });

    logSecurityEvent({
      event: 'SUCCESSFUL_OWNER_LOGIN',
      userId: String(user.id),
      role: 'owner',
      path: '/api/auth/owner-login',
      outcome: 'SUCCESS',
    });

    let response = NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: 'owner',
      },
    });

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
