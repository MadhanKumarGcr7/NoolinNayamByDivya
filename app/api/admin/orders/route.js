/**
 * Admin Orders API — GET /api/admin/orders (MySQL / Prisma)
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  requireAuth,
  sanitizeInput,
  applySecurityHeaders,
  handleApiError,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const status = sanitizeInput(searchParams.get('status') || '');

    const where = {};
    if (status && status !== 'all') where.status = status;

    const [rawOrders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const orders = rawOrders.map(o => ({
      _id: String(o.id),
      id: String(o.id),
      orderNumber: `ORD-${o.id}`,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      status: o.status,
      paymentStatus: o.payment_status,
      returnPolicyAgreed: o.return_policy_agreed,
      returnRequested: o.return_requested,
      createdAt: o.created_at,
      contactInfo: {
        name: o.user?.name || o.contact_email?.split('@')[0] || 'Customer',
        email: o.contact_email,
        phone: o.contact_phone,
      },
      shippingAddress: {
        street: o.shipping_address_line1,
        line1: o.shipping_address_line1,
        line2: o.shipping_address_line2,
        city: o.shipping_city,
        state: o.shipping_state,
        pincode: o.shipping_pincode,
        country: o.shipping_country,
      },
      items: o.items.map(i => ({
        id: String(i.id),
        product: i.product_id ? String(i.product_id) : null,
        name: i.product_name_snapshot,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: Number(i.price_snapshot),
      })),
    }));

    const response = NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
