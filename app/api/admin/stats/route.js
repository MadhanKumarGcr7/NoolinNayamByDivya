/**
 * Admin Stats API (MySQL / Prisma)
 * GET /api/admin/stats
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalCustomers, totalOrders, pendingOrders, newCustomRequests, products] = await Promise.all([
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'Pending' } }),
      prisma.customOrderRequest.count({ where: { status: 'New' } }),
      prisma.product.findMany({ include: { variants: true } }),
    ]);

    const lowStockProducts = products.filter(p => {
      const totalStock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);
      return totalStock <= 5;
    }).length;

    const rawRecentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { items: true },
    });

    const recentOrders = rawRecentOrders.map(o => ({
      _id: String(o.id),
      id: String(o.id),
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      status: o.status,
      createdAt: o.created_at,
      contactEmail: o.contact_email,
      contactPhone: o.contact_phone,
    }));

    const rawRecentCustomRequests = await prisma.customOrderRequest.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
    });

    const recentCustomRequests = rawRecentCustomRequests.map(r => ({
      _id: String(r.id),
      id: String(r.id),
      name: r.name,
      email: r.email,
      productType: r.product_type,
      status: r.status,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        newCustomRequests,
      },
      recentOrders,
      recentCustomRequests,
    });

  } catch (error) {
    console.error('[API/Admin/Stats Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
