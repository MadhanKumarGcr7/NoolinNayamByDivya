/**
 * Admin Single Order API — GET & PATCH /api/admin/orders/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened single order retrieval and status update handler.
 * Protected: owner role authentication required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import {
  requireAuth,
  sanitizeRequestData,
  validateUpdateOrderStatus,
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

    await connectDB();
    const id = params?.id;
    const order = await Order.findById(id).lean();

    if (!order) {
      const resp = NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

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

    await connectDB();
    const id = params?.id;
    const { body } = await sanitizeRequestData(request);

    const allowedUpdates = {};

    if (body.status) {
      const statusLower = body.status.toLowerCase();
      const validation = validateUpdateOrderStatus({ status: statusLower, trackingNumber: body.trackingNumber });
      if (!validation.valid) {
        const resp = NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
        return applySecurityHeaders(resp, request);
      }
      allowedUpdates.status = body.status;
    }

    if (body.paymentStatus) {
      const validPayment = ['pending', 'paid', 'failed'];
      if (!validPayment.includes(body.paymentStatus)) {
        const resp = NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
        return applySecurityHeaders(resp, request);
      }
      allowedUpdates.paymentStatus = body.paymentStatus;
    }

    if (body.trackingNumber !== undefined) {
      allowedUpdates.trackingNumber = String(body.trackingNumber).trim();
    }

    if (body.trackingUrl !== undefined) {
      allowedUpdates.trackingUrl = String(body.trackingUrl).trim();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      const resp = NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    logSecurityEvent({
      event: 'ORDER_STATUS_UPDATED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/orders/${id}`,
      outcome: 'SUCCESS',
      details: allowedUpdates,
    });

    const response = NextResponse.json({
      success: true,
      order: updatedOrder,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
