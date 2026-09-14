/**
 * Admin Single Order API — GET & PATCH /api/admin/orders/[id] (MySQL / Prisma)
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  requireAuth,
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!o) {
      const resp = NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const order = {
      _id: String(o.id),
      id: String(o.id),
      orderNumber: `ORD-${o.id}`,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      status: o.status,
      paymentStatus: o.payment_status,
      razorpayOrderId: o.razorpay_order_id,
      razorpayPaymentId: o.razorpay_payment_id,
      paymentVerifiedAt: o.payment_verified_at,
      couponCode: o.coupon_code,
      discountAmount: Number(o.discount_amount || 0),
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
    };

    const response = NextResponse.json({ order });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const data = {};

    if (body.status) data.status = body.status;
    if (body.paymentStatus) data.payment_status = body.paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    logSecurityEvent({
      event: 'ORDER_STATUS_UPDATED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/orders/${id}`,
      outcome: 'SUCCESS',
      details: data,
    });

    const response = NextResponse.json({
      success: true,
      order: {
        _id: String(updatedOrder.id),
        id: String(updatedOrder.id),
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
