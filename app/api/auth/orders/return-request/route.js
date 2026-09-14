/**
 * Customer Order Return Request Flagging API — POST /api/auth/orders/return-request (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened return request flagging with input sanitization and audit logging.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { body } = await sanitizeRequestData(request);
    const { orderId } = body;

    const id = Number(orderId);
    if (!orderId || isNaN(id)) {
      const resp = NextResponse.json({ error: 'Valid Order ID is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        return_requested: true,
        return_requested_at: new Date(),
      },
    });

    logSecurityEvent({
      event: 'RETURN_REQUESTED',
      path: '/api/auth/orders/return-request',
      outcome: 'SUCCESS',
      details: { orderId: String(order.id) },
    });

    const response = NextResponse.json({
      success: true,
      order: {
        id: String(order.id),
        returnRequested: order.return_requested,
        returnRequestedAt: order.return_requested_at,
      },
    });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
