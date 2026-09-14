/**
 * Get Current Authenticated Customer API — GET /api/auth/me (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Verifies access token from customer httpOnly cookie or Authorization header.
 * Returns authenticated customer details.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  requireAuth,
  applySecurityHeaders,
  handleApiError,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'customer');

    if (!auth.authenticated || !auth.user?.userId) {
      const resp = NextResponse.json(
        { user: null, authenticated: false },
        { status: 401 }
      );
      return applySecurityHeaders(resp, request);
    }

    const userId = Number(auth.user.userId);
    if (isNaN(userId)) {
      const resp = NextResponse.json({ user: null, authenticated: false }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user || user.role === 'owner') {
      const resp = NextResponse.json(
        { user: null, authenticated: false },
        { status: 401 }
      );
      return applySecurityHeaders(resp, request);
    }

    const defaultAddress = user.addresses.find(a => a.is_default) || user.addresses[0] || {};

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        address: {
          line1: defaultAddress.line1 || '',
          line2: defaultAddress.line2 || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.pincode || '',
          country: defaultAddress.country || 'India',
        },
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
