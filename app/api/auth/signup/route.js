/**
 * Customer Signup API — POST /api/auth/signup
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened customer registration with NoSQL sanitization, rate limiting,
 * password hashing, short-lived access tokens, and httpOnly rotating refresh cookies.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
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
    // 1. Rate limiting check
    const rateCheck = checkApiRateLimit(request, 'auth_signup');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { message: `Too many signup attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Input sanitization (NoSQL injection protection)
    const { body } = await sanitizeRequestData(request);

    // 3. Schema validation
    const validation = validateSignup(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { name, email, password, phone } = validation.data;

    await connectDB();

    // 4. Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      const resp = NextResponse.json(
        { message: 'An account with this email address already exists.' },
        { status: 409 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 5. Hash password (12 bcrypt rounds)
    const passwordHash = await hashPassword(password);

    // 6. Create customer record
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      phone,
      role: 'customer',
    });

    logSecurityEvent({
      event: 'CUSTOMER_SIGNUP',
      userId: newUser._id.toString(),
      role: 'customer',
      path: '/api/auth/signup',
      outcome: 'SUCCESS',
    });

    // 7. Issue access + refresh token pair
    const accessToken = signAccessToken({ userId: newUser._id.toString(), role: 'customer' });
    const { token: refreshToken } = signRefreshToken({ userId: newUser._id.toString(), role: 'customer' });

    let response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    // Attach httpOnly cookies & security headers
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
