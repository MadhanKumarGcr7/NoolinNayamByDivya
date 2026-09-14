/**
 * Admin Order Refund API Route — POST /api/admin/orders/[id]/refund
 * ────────────────────────────────────────────────────────────────────────────
 * Allows authorized shop owner to trigger a refund on a paid order via Razorpay API
 * or mark as Refunded in MySQL database.
 */

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/prisma';
import {
  parseRequestCookies,
  verifyAccessToken,
  OWNER_ACCESS_COOKIE,
  applySecurityHeaders,
  logSecurityEvent,
  handleApiError,
} from '@/lib/security';

export async function POST(request, { params }) {
  try {
    const cookies = parseRequestCookies(request);
    const ownerToken = cookies[OWNER_ACCESS_COOKIE];

    if (!ownerToken) {
      const resp = NextResponse.json({ error: 'Unauthorized. Owner access required.' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    const decoded = verifyAccessToken(ownerToken);
    if (!decoded || decoded.role !== 'owner') {
      const resp = NextResponse.json({ error: 'Forbidden. Owner privileges required.' }, { status: 403 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ error: 'Invalid order ID.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      const resp = NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    if (order.payment_status === 'Refunded') {
      const resp = NextResponse.json({ error: 'Order has already been refunded.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    let refundDetails = null;

    if (
      order.razorpay_payment_id &&
      keyId &&
      keySecret &&
      !keyId.includes('placeholder') &&
      !keySecret.includes('placeholder')
    ) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        refundDetails = await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: Math.round(Number(order.total) * 100),
          notes: {
            reason: 'Owner initiated refund',
            orderId: String(order.id),
          },
        });
      } catch (rzpErr) {
        logSecurityEvent({
          event: 'RAZORPAY_REFUND_ERROR',
          userId: String(decoded.userId),
          path: `/api/admin/orders/${id}/refund`,
          outcome: 'ERROR',
          details: { message: rzpErr.message },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        payment_status: 'Refunded',
        status: 'Cancelled',
      },
    });

    logSecurityEvent({
      event: 'ADMIN_REFUND_PROCESSED',
      userId: String(decoded.userId),
      path: `/api/admin/orders/${id}/refund`,
      outcome: 'SUCCESS',
      details: {
        orderId: String(id),
        total: Number(order.total),
        razorpayPaymentId: order.razorpay_payment_id,
        refundId: refundDetails?.id || 'manual_override',
      },
    });

    const resp = NextResponse.json({
      success: true,
      message: 'Order marked as refunded successfully.',
      order: {
        id: updatedOrder.id,
        orderNumber: `ORD-${updatedOrder.id}`,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
      },
    });

    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
