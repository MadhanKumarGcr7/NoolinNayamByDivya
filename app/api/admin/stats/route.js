/**
 * Admin Stats API
 * GET /api/admin/stats
 * ────────────────────────────────────────────────────────────────────────────
 * Returns dashboard summary counts. Protected: owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import Product from '@/models/Product';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const [totalCustomers, totalOrders, pendingOrders, customRequests, products] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      CustomOrderRequest.countDocuments({ status: 'New' }),
      Product.find({}).select('stock lowStockThreshold name').lean(),
    ]);

    const lowStockProducts = products.filter(
      (p) => p.stock <= (p.lowStockThreshold || 5)
    ).length;

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent custom requests (last 5)
    const recentCustomRequests = await CustomOrderRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        newCustomRequests: customRequests,
      },
      recentOrders,
      recentCustomRequests,
    });

  } catch (error) {
    console.error('[API/Admin/Stats Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
