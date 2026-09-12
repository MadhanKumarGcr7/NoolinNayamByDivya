/**
 * Admin Customers API
 * GET /api/admin/customers
 * ────────────────────────────────────────────────────────────────────────────
 * Paginated customer list with order counts. Protected: owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page') || '1', 10);
    const limit  = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Get order counts for each customer
    const customerIds = customers.map((c) => c._id);
    const orderCounts = await Order.aggregate([
      { $match: { userId: { $in: customerIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const orderCountMap = {};
    orderCounts.forEach((o) => { orderCountMap[o._id.toString()] = o.count; });

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      orderCount: orderCountMap[c._id.toString()] || 0,
    }));

    return NextResponse.json({
      customers: enrichedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('[API/Admin/Customers Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
