/**
 * Customer Orders API — GET /api/auth/orders (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Returns orders for the currently authenticated customer.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = getAuthFromRequest(request, 'customer');
    if (!auth) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const userId = Number(auth.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const rawOrders = await prisma.order.findMany({
      where: { user_id: userId },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });

    const orders = rawOrders.map(o => ({
      _id: String(o.id),
      id: String(o.id),
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      status: o.status,
      paymentStatus: o.payment_status,
      returnPolicyAgreed: o.return_policy_agreed,
      returnRequested: o.return_requested,
      createdAt: o.created_at,
      shippingAddress: {
        line1: o.shipping_address_line1,
        line2: o.shipping_address_line2,
        city: o.shipping_city,
        state: o.shipping_state,
        pincode: o.shipping_pincode,
        country: o.shipping_country,
      },
      items: o.items.map(i => ({
        id: String(i.id),
        productId: i.product_id ? String(i.product_id) : null,
        name: i.product_name_snapshot,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: Number(i.price_snapshot),
      })),
    }));

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('[API/Auth/Orders Error]:', error);
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}
