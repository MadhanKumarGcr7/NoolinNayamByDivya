/**
 * Admin Single Coupon API Route — GET, PATCH & DELETE /api/admin/coupons/[id] (MySQL / Prisma)
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

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const c = await prisma.coupon.findUnique({ where: { id } });
    if (!c) {
      const resp = NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const coupon = {
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
    };

    const response = NextResponse.json({ coupon });
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
      const resp = NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const data = {};

    if (body.code && typeof body.code === 'string') {
      const cleanCode = body.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (cleanCode) {
        const existing = await prisma.coupon.findFirst({
          where: { code: cleanCode, id: { not: id } },
        });
        if (existing) {
          const resp = NextResponse.json({ error: `Coupon code "${cleanCode}" is already in use.` }, { status: 400 });
          return applySecurityHeaders(resp, request);
        }
        data.code = cleanCode;
      }
    }

    if (body.discountType) data.discount_type = body.discountType === 'flat' ? 'flat' : 'percentage';
    if (body.discountValue !== undefined) data.discount_value = Number(body.discountValue);
    if (body.maxDiscount !== undefined) data.max_discount = body.maxDiscount ? Number(body.maxDiscount) : null;
    if (body.minOrderValue !== undefined) data.min_order_value = body.minOrderValue ? Number(body.minOrderValue) : null;
    if (body.validFrom) data.valid_from = new Date(body.validFrom);
    if (body.validUntil) data.valid_until = new Date(body.validUntil);
    if (body.usageLimit !== undefined) data.usage_limit = body.usageLimit ? Math.max(1, Number(body.usageLimit)) : null;
    if (body.perCustomerLimit !== undefined) data.per_customer_limit = body.perCustomerLimit ? Math.max(1, Number(body.perCustomerLimit)) : 1;
    if (body.active !== undefined) data.active = Boolean(body.active);
    if (body.internalNote !== undefined) data.internal_note = body.internalNote ? String(body.internalNote).trim() : null;

    const updated = await prisma.coupon.update({
      where: { id },
      data,
    });

    logSecurityEvent({
      event: 'COUPON_UPDATED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/coupons/${id}`,
      outcome: 'SUCCESS',
      details: data,
    });

    const response = NextResponse.json({
      success: true,
      coupon: {
        id: String(updated.id),
        code: updated.code,
        active: updated.active,
        status: calculateCouponStatus(updated),
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    await prisma.coupon.delete({ where: { id } });

    logSecurityEvent({
      event: 'COUPON_DELETED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/coupons/${id}`,
      outcome: 'SUCCESS',
      details: { id },
    });

    const response = NextResponse.json({ success: true });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
