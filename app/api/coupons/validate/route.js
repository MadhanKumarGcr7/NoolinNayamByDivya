/**
 * Customer Coupon Validation API Route — POST /api/coupons/validate (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Validates coupon eligibility server-side against date window, active status,
 * usage limits, and minimum cart order value.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { body } = await sanitizeRequestData(request);
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      const resp = NextResponse.json({ valid: false, message: 'Please enter a coupon code.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const cleanCode = code.trim().toUpperCase();
    const numericSubtotal = Math.max(0, Number(subtotal) || 0);

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.active) {
      const resp = NextResponse.json({ valid: false, message: 'This coupon code is not valid.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom || now > validUntil) {
      const resp = NextResponse.json({ valid: false, message: 'This coupon code is not valid.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      const resp = NextResponse.json({ valid: false, message: 'This coupon code is no longer available.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const minOrder = coupon.min_order_value ? Number(coupon.min_order_value) : 0;
    if (minOrder > 0 && numericSubtotal < minOrder) {
      const resp = NextResponse.json(
        { valid: false, message: `This coupon requires a minimum order subtotal of ₹${minOrder.toLocaleString('en-IN')}.` },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    let calculatedDiscount = 0;
    const discountVal = Number(coupon.discount_value);

    if (coupon.discount_type === 'percentage') {
      calculatedDiscount = (numericSubtotal * discountVal) / 100;
      if (coupon.max_discount !== null) {
        const maxCap = Number(coupon.max_discount);
        if (maxCap > 0) {
          calculatedDiscount = Math.min(calculatedDiscount, maxCap);
        }
      }
    } else {
      calculatedDiscount = Math.min(numericSubtotal, discountVal);
    }

    calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

    const response = NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: discountVal,
        maxDiscount: coupon.max_discount ? Number(coupon.max_discount) : null,
        minOrderValue: minOrder || null,
        discountAmount: calculatedDiscount,
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
