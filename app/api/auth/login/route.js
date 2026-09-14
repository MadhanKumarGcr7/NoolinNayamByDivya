/**
 * Customer Login API — POST /api/auth/login (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened authentication with input sanitization, rate limiting,
 * short-lived access tokens, and httpOnly rotating refresh cookies.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import {
  sanitizeRequestData,
  validateLogin,
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

    const validation = validateLogin(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logSecurityEvent({
        event: 'FAILED_LOGIN_ATTEMPT',
        role: 'customer',
        path: '/api/auth/login',
        outcome: 'FAILURE',
        details: { reason: 'User not found' },
      });
      const resp = NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    if (user.role === 'owner') {
      const resp = NextResponse.json(
        { message: 'Owner accounts must log in through the studio portal.' },
        { status: 403 }
      );
      return applySecurityHeaders(resp, request);
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      logSecurityEvent({
        event: 'FAILED_LOGIN_ATTEMPT',
        userId: String(user.id),
        role: 'customer',
        path: '/api/auth/login',
        outcome: 'FAILURE',
        details: { reason: 'Invalid password' },
      });
      const resp = NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    resetApiRateLimit(request, 'auth_login');

    const accessToken = signAccessToken({ userId: String(user.id), role: user.role });
    const { token: refreshToken } = signRefreshToken({ userId: String(user.id), role: user.role });

    logSecurityEvent({
      event: 'SUCCESSFUL_LOGIN',
      userId: String(user.id),
      role: user.role,
      path: '/api/auth/login',
      outcome: 'SUCCESS',
    });

    let response = NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      },
    });

    response = setSessionCookies(response, {
      accessToken,
      refreshToken,
      role: user.role,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
