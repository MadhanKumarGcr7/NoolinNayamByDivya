/**
 * Admin Single Custom Request API (MySQL / Prisma)
 * PATCH /api/admin/custom-requests/[id]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Custom request not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const body = await request.json();
    const data = {};

    if (body.status) data.status = body.status;
    if (body.ownerResponse !== undefined) data.owner_response = body.ownerResponse.toString().trim();
    if (body.quotedPrice !== undefined) data.quoted_price = Number(body.quotedPrice) || 0;

    const customRequest = await prisma.customOrderRequest.update({
      where: { id },
      data,
    });

    const resp = NextResponse.json({
      success: true,
      request: {
        _id: String(customRequest.id),
        id: String(customRequest.id),
        status: customRequest.status,
        additionalNotes: customRequest.additional_notes,
        ownerResponse: customRequest.owner_response,
        quotedPrice: customRequest.quoted_price ? Number(customRequest.quoted_price) : 0,
      },
    });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
