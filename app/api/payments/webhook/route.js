/**
 * Razorpay Webhook Integration API Route — POST /api/payments/webhook
 * ────────────────────────────────────────────────────────────────────────────
 * Verifies webhook signature with RAZORPAY_WEBHOOK_SECRET and updates order status
 * even if the user closed their browser before the frontend callback finished.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/security';

export async function POST(request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const rawBody = await request.text();

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature if secret is configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      let isMatch = false;
      try {
        isMatch = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf-8'),
          Buffer.from(signature || '', 'utf-8')
        );
      } catch {
        isMatch = false;
      }

      if (!isMatch) {
        logSecurityEvent({
          event: 'WEBHOOK_SIGNATURE_MISMATCH',
          path: '/api/payments/webhook',
          outcome: 'BLOCKED',
          details: { signature },
        });
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    let payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity || {};
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (event === 'payment.captured' && razorpayOrderId) {
      const order = await prisma.order.findUnique({
        where: { razorpay_order_id: razorpayOrderId },
      });

      if (order && order.payment_status !== 'Paid') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: 'Paid',
            status: 'Processing',
            razorpay_payment_id: razorpayPaymentId || order.razorpay_payment_id,
            payment_verified_at: new Date(),
          },
        });

        logSecurityEvent({
          event: 'WEBHOOK_PAYMENT_CAPTURED',
          path: '/api/payments/webhook',
          outcome: 'SUCCESS',
          details: { orderId: String(order.id), razorpayOrderId, razorpayPaymentId },
        });
      }
    } else if (event === 'payment.failed' && razorpayOrderId) {
      const order = await prisma.order.findUnique({
        where: { razorpay_order_id: razorpayOrderId },
      });

      if (order && order.payment_status === 'Pending') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: 'Failed',
          },
        });

        logSecurityEvent({
          event: 'WEBHOOK_PAYMENT_FAILED',
          path: '/api/payments/webhook',
          outcome: 'INFO',
          details: { orderId: String(order.id), razorpayOrderId },
        });
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error) {
    logSecurityEvent({
      event: 'WEBHOOK_PROCESSING_ERROR',
      path: '/api/payments/webhook',
      outcome: 'ERROR',
      details: { message: error.message },
    });
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
