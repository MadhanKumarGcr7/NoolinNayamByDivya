/**
 * Admin Design Gallery Item Operations API (MySQL / Prisma)
 * PATCH & DELETE /api/admin/design-gallery/[id]
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

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ error: 'Gallery image not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const updates = {};

    if (body.visible !== undefined) updates.visible = Boolean(body.visible);
    if (body.caption !== undefined) updates.caption = String(body.caption).trim();
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags
        : String(body.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (body.category) {
      let cat = await prisma.designGalleryCategory.findFirst({ where: { name: body.category } });
      if (!cat) cat = await prisma.designGalleryCategory.create({ data: { name: body.category } });
      updates.category_id = cat.id;
    }

    const updatedImage = await prisma.designGalleryImage.update({
      where: { id },
      data: updates,
    });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_IMAGE_UPDATED',
      userId: auth.user.userId,
      role: 'owner',
      path: `/api/admin/design-gallery/${id}`,
      outcome: 'SUCCESS',
      details: updates,
    });

    const response = NextResponse.json({
      success: true,
      image: {
        _id: String(updatedImage.id),
        id: String(updatedImage.id),
        visible: updatedImage.visible,
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
      const resp = NextResponse.json({ error: 'Gallery image not found.' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    await prisma.designGalleryImage.delete({ where: { id } });

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
