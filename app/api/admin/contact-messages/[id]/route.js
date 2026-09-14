/**
 * Admin Contact Message Detail & Status Update API Route (MySQL / Prisma)
 * PATCH  /api/admin/contact-messages/[id]
 * DELETE /api/admin/contact-messages/[id]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Message not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      const resp = NextResponse.json({ message: 'Status is required' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    const resp = NextResponse.json({
      success: true,
      message: {
        _id: String(updated.id),
        id: String(updated.id),
        status: updated.status,
      },
    });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Message not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    await prisma.contactMessage.delete({ where: { id } });

    const resp = NextResponse.json({ success: true, message: 'Message deleted' });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
