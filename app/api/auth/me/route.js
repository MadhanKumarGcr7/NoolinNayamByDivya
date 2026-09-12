/**
 * Get Current Authenticated Customer API — GET /api/auth/me
 * ────────────────────────────────────────────────────────────────────────────
 * Verifies access token from customer httpOnly cookie or Authorization header.
 * Returns authenticated customer details.
 * NOTE: Owner authentication is separate and handled via /api/admin/* & /owner-login.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import {
  requireAuth,
  applySecurityHeaders,
  handleApiError,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 1. Verify customer authentication ONLY
    const auth = await requireAuth(request, 'customer');

    if (!auth.authenticated || !auth.user?.userId) {
      const resp = NextResponse.json(
        { user: null, authenticated: false },
        { status: 401 }
      );
      return applySecurityHeaders(resp, request);
    }

    await connectDB();

    const user = await User.findById(auth.user.userId).select('-passwordHash').lean();
    if (!user || user.role === 'owner') {
      const resp = NextResponse.json(
        { user: null, authenticated: false },
        { status: 401 }
      );
      return applySecurityHeaders(resp, request);
    }

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        address: user.address || {},
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
