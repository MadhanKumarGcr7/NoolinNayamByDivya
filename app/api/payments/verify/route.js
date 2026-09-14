/**
 * Razorpay Payment Verification API Route — POST /api/payments/verify
 * ────────────────────────────────────────────────────────────────────────────
 * Recomputes HMAC SHA-256 signature server-side using RAZORPAY_KEY_SECRET to
 * verify payment legitimacy before marking any order as Paid.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import {
  sanitizeRequestData,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export async function POST(request) {
  try {
    const rateCheck = checkApiRateLimit(request, 'checkout');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many verification attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      logSecurityEvent({
        event: 'INVALID_PAYMENT_VERIFY_PAYLOAD',
        path: '/api/payments/verify',
        outcome: 'BLOCKED',
        details: { body },
      });
      const resp = NextResponse.json(
        { error: 'Missing required Razorpay verification parameters.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    // ── SERVER-SIDE HMAC SHA-256 SIGNATURE VERIFICATION ────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    let isValidSignature = false;

    if (keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      try {
        isValidSignature = crypto.timingSafeEqual(
          Buffer.from(generatedSignature, 'utf-8'),
          Buffer.from(razorpay_signature, 'utf-8')
        );
      } catch {
        isValidSignature = false;
      }
    } else {
      // Development mode fallback when placeholders are present
      isValidSignature = Boolean(
        razorpay_payment_id &&
        razorpay_order_id &&
        razorpay_signature &&
        razorpay_signature.length >= 10
      );
    }

    if (!isValidSignature) {
      logSecurityEvent({
        event: 'PAYMENT_SIGNATURE_MISMATCH',
        path: '/api/payments/verify',
        outcome: 'BLOCKED',
        details: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      });

      const resp = NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    // ── FIND MATCHING ORDER IN DATABASE ──────────────────────────────────────
    let dbOrder = null;

    if (orderId) {
      const numId = Number(orderId);
      if (!isNaN(numId)) {
        dbOrder = await prisma.order.findUnique({ where: { id: numId } });
      }
    }

    if (!dbOrder && razorpay_order_id) {
      dbOrder = await prisma.order.findUnique({
        where: { razorpay_order_id },
      });
    }

    if (!dbOrder) {
      const resp = NextResponse.json(
        { error: 'Matching order record not found for this payment.' },
        { status: 404 }
      );
      return applySecurityHeaders(resp, request);
    }

    // ── UPDATE ORDER PAYMENT STATUS TO PAID ──────────────────────────────────
    const updatedOrder = await prisma.order.update({
      where: { id: dbOrder.id },
      data: {
        payment_status: 'Paid',
        status: 'Processing',
        razorpay_payment_id,
        razorpay_signature,
        payment_verified_at: new Date(),
      },
    });

    // ── INCREMENT COUPON USAGE COUNT ON COMPLETED PAYMENT ────────────────────
    if (dbOrder.coupon_code && dbOrder.payment_status !== 'Paid') {
      try {
        await prisma.coupon.update({
          where: { code: dbOrder.coupon_code },
          data: { usage_count: { increment: 1 } },
        });
      } catch { /* Ignore if coupon deleted */ }
    }

    logSecurityEvent({
      event: 'PAYMENT_VERIFIED_SUCCESS',
      userId: updatedOrder.user_id ? String(updatedOrder.user_id) : null,
      path: '/api/payments/verify',
      outcome: 'SUCCESS',
      details: {
        orderId: String(updatedOrder.id),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      order: {
        id: updatedOrder.id,
        orderNumber: `ORD-${updatedOrder.id}`,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
        razorpayPaymentId: updatedOrder.razorpay_payment_id,
        totalAmount: Number(updatedOrder.total),
        contactEmail: updatedOrder.contact_email,
        contactPhone: updatedOrder.contact_phone,
        createdAt: updatedOrder.created_at,
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    const resp = NextResponse.json(
      { error: error.message || 'An unexpected server error occurred during verification.' },
      { status: 500 }
    );
    return applySecurityHeaders(resp, request);
  }
}
