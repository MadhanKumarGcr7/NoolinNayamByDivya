/**
 * Admin Design Gallery Item Operations API — PATCH & DELETE /api/admin/design-gallery/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened design gallery item updates and deletion. Protected: owner authentication required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DesignGalleryImage from '@/models/DesignGalleryImage';
import {
  requireAuth,
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const id = params?.id;
    const { body } = await sanitizeRequestData(request);

    const updates = {};
    if (body.visible !== undefined) updates.visible = Boolean(body.visible);
    if (body.caption !== undefined) updates.caption = String(body.caption).trim();
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags
        : String(body.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }

    const updatedImage = await DesignGalleryImage.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedImage) {
      const resp = NextResponse.json({ error: 'Gallery image not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    logSecurityEvent({
      event: 'DESIGN_GALLERY_IMAGE_UPDATED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/design-gallery/${id}`,
      outcome: 'SUCCESS',
      details: updates,
    });

    const response = NextResponse.json({ success: true, image: updatedImage });
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

    await connectDB();
    const id = params?.id;

    const deleted = await DesignGalleryImage.findByIdAndDelete(id);
    if (!deleted) {
      const resp = NextResponse.json({ error: 'Gallery image not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    logSecurityEvent({
      event: 'DESIGN_GALLERY_IMAGE_DELETED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/design-gallery/${id}`,
      outcome: 'SUCCESS',
    });

    const response = NextResponse.json({ success: true, message: 'Gallery image deleted.' });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
