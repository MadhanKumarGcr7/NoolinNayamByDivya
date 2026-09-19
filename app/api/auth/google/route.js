/**
 * Google OAuth Authentication API — POST /api/auth/google
 * ────────────────────────────────────────────────────────────────────────────
 * Verifies Google ID Token (via google-auth-library / Google TokenInfo).
 * User Login: Grants customer role & session.
 * Admin Login: STRICTLY permits ONLY noolinnayambydivya@gmail.com.
 */

import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  setSessionCookies,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const ALLOWED_ADMIN_EMAIL = (process.env.OWNER_EMAIL || 'noolinnayambydivya@gmail.com').toLowerCase().trim();

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential, isOwnerLogin = false } = body;

    if (!credential) {
      const resp = NextResponse.json({ message: 'Google credential is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    let payload = null;

    // Verify Google ID Token
    try {
      if (GOOGLE_CLIENT_ID) {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        // Fallback tokeninfo verification if Client ID is being configured
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (!googleRes.ok) throw new Error('Invalid Google Token');
        payload = await googleRes.json();
      }
    } catch (err) {
      console.error('Google token verification error:', err);
      const resp = NextResponse.json({ message: 'Google authentication failed. Invalid token.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    if (!payload || !payload.email || !payload.email_verified) {
      const resp = NextResponse.json({ message: 'Unverified or missing Google email.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const email = payload.email.toLowerCase().trim();
    const name  = payload.name || payload.given_name || email.split('@')[0];

    // ─── ADMIN GOOGLE LOGIN AUTHORIZATION CHECK ───────────────────────────────
    if (isOwnerLogin) {
      if (email !== ALLOWED_ADMIN_EMAIL && email !== 'noolinnayambydivya@gmail.com') {
        logSecurityEvent({
          event: 'UNAUTHORIZED_ADMIN_GOOGLE_LOGIN_ATTEMPT',
          role: 'owner',
          path: '/api/auth/google',
          outcome: 'FORBIDDEN',
          details: { email, reason: 'Email not authorized for owner dashboard' },
        });

        const resp = NextResponse.json(
          {
            message: `Access denied. Only noolinnayambydivya@gmail.com is authorized to access the Admin dashboard. (${email} is not authorized).`,
          },
          { status: 403 }
        );
        return applySecurityHeaders(resp, request);
      }

      // Upsert authorized owner user
      let ownerUser = await prisma.user.findFirst({
        where: { email, role: 'owner' },
      });

      if (!ownerUser) {
        ownerUser = await prisma.user.create({
          data: {
            name,
            email,
            password_hash: '$2b$12$OAuthGooglePlaceholderHashNeverMatchesPass00',
            role: 'owner',
          },
        });
      }

      const accessToken = signAccessToken({ userId: String(ownerUser.id), role: 'owner' });
      const { token: refreshToken } = signRefreshToken({ userId: String(ownerUser.id), role: 'owner' });

      logSecurityEvent({
        event: 'SUCCESSFUL_ADMIN_GOOGLE_LOGIN',
        userId: String(ownerUser.id),
        role: 'owner',
        path: '/api/auth/google',
        outcome: 'SUCCESS',
        details: { email },
      });

      let response = NextResponse.json({
        success: true,
        user: {
          id: String(ownerUser.id),
          name: ownerUser.name,
          email: ownerUser.email,
          role: 'owner',
        },
      });

      response = setSessionCookies(response, {
        accessToken,
        refreshToken,
        role: 'owner',
      });

      return applySecurityHeaders(response, request);
    }

    // ─── CUSTOMER GOOGLE LOGIN ───────────────────────────────────────────────
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: '$2b$12$OAuthGooglePlaceholderHashNeverMatchesPass00',
          role: 'customer',
        },
      });
    }

    const accessToken = signAccessToken({ userId: String(user.id), role: user.role });
    const { token: refreshToken } = signRefreshToken({ userId: String(user.id), role: user.role });

    logSecurityEvent({
      event: 'SUCCESSFUL_CUSTOMER_GOOGLE_LOGIN',
      userId: String(user.id),
      role: user.role,
      path: '/api/auth/google',
      outcome: 'SUCCESS',
      details: { email },
    });

    let response = NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
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
