/**
 * Admin Single Customer API (MySQL / Prisma)
 * GET /api/admin/customers/[id]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Customer not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const c = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: { include: { items: true }, orderBy: { created_at: 'desc' } },
      },
    });

    if (!c || c.role !== 'customer') {
      const resp = NextResponse.json({ message: 'Customer not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const customer = {
      _id: String(c.id),
      id: String(c.id),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      role: c.role,
      createdAt: c.created_at,
      addresses: c.addresses,
    };

    const orders = c.orders.map(o => ({
      _id: String(o.id),
      id: String(o.id),
      total: Number(o.total),
      status: o.status,
      createdAt: o.created_at,
      items: o.items.map(i => ({
        name: i.product_name_snapshot,
        price: Number(i.price_snapshot),
        quantity: i.quantity,
      })),
    }));

    const resp = NextResponse.json({ customer, orders });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
