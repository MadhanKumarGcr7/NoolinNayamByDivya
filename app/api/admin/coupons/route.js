/**
 * Admin Coupons API Route — GET & POST /api/admin/coupons (MySQL / Prisma)
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

function calculateCouponStatus(c) {
  if (!c.active) return 'Disabled';
  const now = new Date();
  const validFrom = new Date(c.valid_from);
  const validUntil = new Date(c.valid_until);

  if (now < validFrom) return 'Scheduled';
  if (now > validUntil) return 'Expired';
  if (c.usage_limit !== null && c.usage_count >= c.usage_limit) return 'Expired';
  return 'Active';
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const rawCoupons = await prisma.coupon.findMany({
      orderBy: { created_at: 'desc' },
    });

    const coupons = rawCoupons.map((c) => ({
      id: String(c.id),
      code: c.code,
      discountType: c.discount_type,
      discountValue: Number(c.discount_value),
      maxDiscount: c.max_discount ? Number(c.max_discount) : null,
      minOrderValue: c.min_order_value ? Number(c.min_order_value) : null,
      validFrom: c.valid_from,
      validUntil: c.valid_until,
      usageLimit: c.usage_limit,
      usageCount: c.usage_count,
      perCustomerLimit: c.per_customer_limit,
      active: c.active,
      internalNote: c.internal_note || '',
      status: calculateCouponStatus(c),
      createdAt: c.created_at,
    }));

    const response = NextResponse.json({ coupons });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);

    let {
      code,
      discountType = 'percentage',
      discountValue,
      maxDiscount,
      minOrderValue,
      validFrom,
      validUntil,
      usageLimit,
      perCustomerLimit = 1,
      active = true,
      internalNote = '',
    } = body;

    if (!code || typeof code !== 'string') {
      const resp = NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      const resp = NextResponse.json({ error: 'Invalid coupon code format.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      const resp = NextResponse.json({ error: `Coupon code "${cleanCode}" already exists.` }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      const resp = NextResponse.json({ error: 'Discount value must be a positive number.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    if (discountType === 'percentage' && numValue > 100) {
      const resp = NextResponse.json({ error: 'Percentage discount cannot exceed 100%.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    if (!validUntil) {
      const resp = NextResponse.json({ error: 'Valid until date is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const fromDate = validFrom ? new Date(validFrom) : new Date();
    const untilDate = new Date(validUntil);

    if (untilDate <= fromDate) {
      const resp = NextResponse.json({ error: 'Valid until date must be after valid from date.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const created = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discount_type: discountType === 'flat' ? 'flat' : 'percentage',
        discount_value: numValue,
        max_discount: maxDiscount ? Number(maxDiscount) : null,
        min_order_value: minOrderValue ? Number(minOrderValue) : null,
        valid_from: fromDate,
        valid_until: untilDate,
        usage_limit: usageLimit ? Math.max(1, Number(usageLimit)) : null,
        per_customer_limit: perCustomerLimit ? Math.max(1, Number(perCustomerLimit)) : 1,
        active: Boolean(active),
        internal_note: internalNote ? internalNote.trim() : null,
      },
    });

    logSecurityEvent({
      event: 'COUPON_CREATED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/coupons',
      outcome: 'SUCCESS',
      details: { code: cleanCode, discountType, discountValue: numValue },
    });

    const response = NextResponse.json({
      success: true,
      coupon: {
        id: String(created.id),
        code: created.code,
        status: calculateCouponStatus(created),
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
