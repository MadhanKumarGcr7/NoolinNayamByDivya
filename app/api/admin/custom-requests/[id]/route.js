/**
 * Admin Single Custom Request API
 * PATCH /api/admin/custom-requests/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Updates status, quoted price, and owner notes for a custom request.
 * Protected: owner JWT (security layer).
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const id = params?.id;
    const body = await request.json();

    const updateFields = {};

    const validStatuses = ['New', 'Reviewed', 'In Progress', 'Completed', 'Declined'];
    if (body.status && validStatuses.includes(body.status)) {
      updateFields.status = body.status;
    }

    if (body.quotedPrice !== undefined && !isNaN(body.quotedPrice)) {
      updateFields.quotedPrice = Math.max(0, parseFloat(body.quotedPrice) || 0);
    }

    if (body.ownerResponse !== undefined) {
      updateFields.ownerResponse = body.ownerResponse.toString().trim();
    }

    const customRequest = await CustomOrderRequest.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!customRequest) {
      const resp = NextResponse.json({ message: 'Custom request not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const resp = NextResponse.json({ success: true, request: customRequest });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
