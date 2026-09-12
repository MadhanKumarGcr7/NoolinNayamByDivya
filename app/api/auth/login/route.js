/**
 * Customer Login API — POST /api/auth/login
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened authentication with NoSQL sanitization, rate limiting,
 * short-lived access tokens, and httpOnly rotating refresh cookies.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
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
    const validation = validateLogin(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { email, password } = validation.data;

    await connectDB();

    // 4. Find user
    const user = await User.findOne({ email });

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

    // Owner accounts cannot log in through customer login
    if (user.role === 'owner') {
      const resp = NextResponse.json(
        { message: 'Owner accounts must log in through the studio portal.' },
        { status: 403 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 5. Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logSecurityEvent({
        event: 'FAILED_LOGIN_ATTEMPT',
        userId: user._id.toString(),
        role: 'customer',
        path: '/api/auth/login',
        outcome: 'FAILURE',
        details: { reason: 'Invalid password' },
      });
      const resp = NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    // 6. Reset rate limit bucket on successful login
    resetApiRateLimit(request, 'auth_login');

    // 7. Issue access + refresh token pair
    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const { token: refreshToken } = signRefreshToken({ userId: user._id.toString(), role: user.role });

    logSecurityEvent({
      event: 'SUCCESSFUL_LOGIN',
      userId: user._id.toString(),
      role: user.role,
      path: '/api/auth/login',
      outcome: 'SUCCESS',
    });

    let response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      },
    });

    // Attach httpOnly cookies & security headers
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
