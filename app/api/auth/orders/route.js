/**
 * Customer Orders API
 * GET /api/auth/orders
 * ────────────────────────────────────────────────────────────────────────────
 * Returns orders for the currently authenticated customer.
 * Customers can only see their own orders — never other customers' data.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = getAuthFromRequest(request, 'customer');
    if (!auth) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    await connectDB();

    const orders = await Order.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('[API/Auth/Orders Error]:', error);
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}
