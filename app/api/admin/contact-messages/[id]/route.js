/**
 * Admin Contact Message Detail & Status Update API Route
 * PATCH  /api/admin/contact-messages/[id]
 * DELETE /api/admin/contact-messages/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: Owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

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
    const { status } = body;

    if (!status) {
      const resp = NextResponse.json({ message: 'Status is required' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      const resp = NextResponse.json({ message: 'Message not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const resp = NextResponse.json({ success: true, message: updated });
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

    await connectDB();
    const id = params?.id;

    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      const resp = NextResponse.json({ message: 'Message not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const resp = NextResponse.json({ success: true, message: 'Message deleted' });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
