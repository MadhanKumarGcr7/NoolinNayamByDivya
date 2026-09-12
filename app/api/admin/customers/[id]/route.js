/**
 * Admin Single Customer API
 * GET /api/admin/customers/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Returns a single customer with their order history. Protected: owner JWT (security layer).
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const id = params?.id;

    const customer = await User.findById(id)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!customer || customer.role !== 'customer') {
      const resp = NextResponse.json({ message: 'Customer not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    const resp = NextResponse.json({ customer, orders });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
