/**
 * Customer Order Return Request Flagging API — POST /api/auth/orders/return-request
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened return request flagging with NoSQL sanitization and audit logging.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import {
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await connectDB();
    const { body } = await sanitizeRequestData(request);
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      const resp = NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        returnRequested: true,
        returnRequestedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      const resp = NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    logSecurityEvent({
      event: 'RETURN_REQUESTED',
      path: '/api/auth/orders/return-request',
      outcome: 'SUCCESS',
      details: { orderId, orderNumber: order.orderNumber },
    });

    const response = NextResponse.json({ success: true, order });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
