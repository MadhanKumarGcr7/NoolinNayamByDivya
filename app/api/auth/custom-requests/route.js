/**
 * Customer Custom Requests API — GET /api/auth/custom-requests
 * ────────────────────────────────────────────────────────────────────────────
 * Returns all custom order requests for the logged-in customer.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import User from '@/models/User';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'customer');
    if (!auth.authenticated || !auth.user?.userId) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();

    const user = await User.findById(auth.user.userId).lean();
    if (!user) {
      const resp = NextResponse.json({ message: 'User not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    // Match either userId or user's email
    const query = {
      $or: [
        { userId: user._id },
        { email: user.email.toLowerCase() },
      ],
    };

    const requests = await CustomOrderRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const resp = NextResponse.json({ requests });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
