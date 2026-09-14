/**
 * Customer Signup API — POST /api/auth/signup (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened customer registration with input sanitization, rate limiting,
 * password hashing, short-lived access tokens, and httpOnly refresh cookies.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import {
  sanitizeRequestData,
  validateSignup,
  checkApiRateLimit,
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
    const rateCheck = checkApiRateLimit(request, 'auth_signup');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { message: `Too many signup attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);

    const validation = validateSignup(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { name, email, password, phone } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const resp = NextResponse.json(
        { message: 'An account with this email address already exists.' },
        { status: 409 }
      );
      return applySecurityHeaders(resp, request);
    }

    const password_hash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        phone: phone || null,
        role: 'customer',
      },
    });

    logSecurityEvent({
      event: 'CUSTOMER_SIGNUP',
      userId: String(newUser.id),
      role: 'customer',
      path: '/api/auth/signup',
      outcome: 'SUCCESS',
    });

    const accessToken = signAccessToken({ userId: String(newUser.id), role: 'customer' });
    const { token: refreshToken } = signRefreshToken({ userId: String(newUser.id), role: 'customer' });

    let response = NextResponse.json(
      {
        success: true,
        user: {
          id: String(newUser.id),
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response = setSessionCookies(response, {
      accessToken,
      refreshToken,
      role: 'customer',
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
