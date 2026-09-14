/**
 * Razorpay Order Creation API Route — POST /api/payments/create-razorpay-order
 * ────────────────────────────────────────────────────────────────────────────
 * Recalculates order total server-side from product database prices, creates a
 * Razorpay Order via Node SDK, and scaffolds a pending Order record in MySQL.
 */

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/prisma';
import {
  sanitizeRequestData,
  validateCheckoutOrder,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
  parseRequestCookies,
  verifyAccessToken,
  CUSTOMER_ACCESS_COOKIE,
} from '@/lib/security';

export async function POST(request) {
  try {
    const rateCheck = checkApiRateLimit(request, 'checkout');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many order attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);

    const validation = validateCheckoutOrder(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { items, customer, deliveryAddress, couponCode } = body;

    let customerUserId = null;
    const cookies = parseRequestCookies(request);
    const customerToken = cookies[CUSTOMER_ACCESS_COOKIE];
    if (customerToken) {
      const decoded = verifyAccessToken(customerToken);
      if (decoded?.role === 'customer') {
        const numId = Number(decoded.userId);
        if (!isNaN(numId)) customerUserId = numId;
      }
    }

    // ── SERVER-SIDE PRICE RECALCULATION FROM DATABASE ─────────────────────────
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const rawProdId = item.productId || item.product?.id || item.product?._id || (typeof item.product === 'object' ? null : item.product) || item.id;
      const numId = Number(rawProdId);
      const targetSlug = item.slug || item.product?.slug || (typeof item.product === 'string' ? item.product : null);

      const dbProduct = await prisma.product.findFirst({
        where: {
          OR: [
            ...(isNaN(numId) || numId <= 0 ? [] : [{ id: numId }]),
            ...(targetSlug ? [{ slug: targetSlug }] : []),
          ],
        },
      });

      if (!dbProduct) {
        const resp = NextResponse.json(
          { error: `Product "${item.name || 'item'}" is no longer available.` },
          { status: 400 }
        );
        return applySecurityHeaders(resp, request);
      }

      const itemPrice = Number(dbProduct.price);
      const qty = Math.max(1, Number(item.quantity) || 1);
      calculatedSubtotal += itemPrice * qty;

      processedItems.push({
        product_id: dbProduct.id,
        product_name_snapshot: dbProduct.name,
        size: item.size || 'Standard',
        color: typeof item.color === 'string' ? item.color : item.color?.name || '',
        quantity: qty,
        price_snapshot: itemPrice,
      });
    }

    // ── SERVER-SIDE COUPON VALIDATION ─────────────────────────────────────────
    let discountAmount = 0;
    let validatedCouponCode = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      const now = new Date();
      if (
        coupon &&
        coupon.active &&
        now >= new Date(coupon.valid_from) &&
        now <= new Date(coupon.valid_until) &&
        (coupon.usage_limit === null || coupon.usage_count < coupon.usage_limit)
      ) {
        const minOrder = coupon.min_order_value ? Number(coupon.min_order_value) : 0;
        if (minOrder <= 0 || calculatedSubtotal >= minOrder) {
          const discountVal = Number(coupon.discount_value);
          if (coupon.discount_type === 'percentage') {
            discountAmount = (calculatedSubtotal * discountVal) / 100;
            if (coupon.max_discount !== null) {
              const maxCap = Number(coupon.max_discount);
              if (maxCap > 0) discountAmount = Math.min(discountAmount, maxCap);
            }
          } else {
            discountAmount = Math.min(calculatedSubtotal, discountVal);
          }
          discountAmount = Math.round(discountAmount * 100) / 100;
          validatedCouponCode = coupon.code;
        }
      }
    }

    const shippingFee = 0;
    const totalAmount = Math.max(0, Math.round((calculatedSubtotal + shippingFee - discountAmount) * 100) / 100);
    const amountPaise = Math.round(totalAmount * 100);

    // ── RAZORPAY ORDER API CALL ─────────────────────────────────────────────
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (keyId && keySecret && !keyId.includes('placeholder') && !keySecret.includes('placeholder')) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const rzpOrder = await razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerEmail: customer.email.trim().toLowerCase(),
            customerPhone: customer.phone.trim(),
            couponCode: validatedCouponCode || '',
          },
        });

        if (rzpOrder?.id) {
          razorpayOrderId = rzpOrder.id;
        }
      } catch (rzpErr) {
        logSecurityEvent({
          event: 'RAZORPAY_API_ERROR',
          path: '/api/payments/create-razorpay-order',
          outcome: 'ERROR',
          details: { message: rzpErr.message, description: rzpErr.error?.description },
        });

        const errorDetail = rzpErr.error?.description || rzpErr.message || 'Payment initialization failed.';
        const resp = NextResponse.json(
          { error: `Razorpay Gateway Error: ${errorDetail}` },
          { status: 400 }
        );
        return applySecurityHeaders(resp, request);
      }
    }

    // ── CREATE PENDING ORDER RECORD IN DATABASE ──────────────────────────────
    const order = await prisma.order.create({
      data: {
        user_id: customerUserId,
        subtotal: calculatedSubtotal,
        shipping: shippingFee,
        total: totalAmount,
        coupon_code: validatedCouponCode,
        discount_amount: discountAmount,
        status: 'Pending',
        payment_status: 'Pending',
        razorpay_order_id: razorpayOrderId,
        shipping_address_line1: deliveryAddress.street?.trim() || deliveryAddress.line1?.trim() || 'N/A',
        shipping_address_line2: deliveryAddress.line2?.trim() || null,
        shipping_city: deliveryAddress.city.trim(),
        shipping_state: deliveryAddress.state.trim(),
        shipping_pincode: deliveryAddress.pincode.trim(),
        shipping_country: deliveryAddress.country?.trim() || 'India',
        contact_email: customer.email.trim().toLowerCase(),
        contact_phone: customer.phone.trim(),
        return_policy_agreed: true,
        return_policy_agreed_at: new Date(),
        items: {
          create: processedItems,
        },
      },
    });

    logSecurityEvent({
      event: 'RAZORPAY_ORDER_CREATED',
      userId: customerUserId ? String(customerUserId) : null,
      path: '/api/payments/create-razorpay-order',
      outcome: 'SUCCESS',
      details: {
        orderId: String(order.id),
        razorpayOrderId,
        totalAmount,
        amountPaise,
      },
    });

    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: `ORD-${order.id}`,
      razorpayOrderId,
      amountPaise,
      amount: totalAmount,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    const resp = NextResponse.json(
      { error: error.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
    return applySecurityHeaders(resp, request);
  }
}
