/**
 * Admin Design Gallery API — GET & POST /api/admin/design-gallery
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened design gallery retrieval and creation. Protected: owner authentication required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DesignGalleryImage from '@/models/DesignGalleryImage';
import {
  requireAuth,
  sanitizeInput,
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = sanitizeInput(searchParams.get('category') || '');
    const q = sanitizeInput(searchParams.get('q') || '');

    const filter = {};
    if (category) filter.category = category;
    if (q) {
      const safeRegex = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { caption: { $regex: safeRegex, $options: 'i' } },
        { tags: { $regex: safeRegex, $options: 'i' } },
        { category: { $regex: safeRegex, $options: 'i' } },
      ];
    }

    const images = await DesignGalleryImage.find(filter).sort({ createdAt: -1 });

    const response = NextResponse.json({ success: true, images });
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

    await connectDB();
    const { body } = await sanitizeRequestData(request);
    const { imageUrl, category, tags, caption, visible } = body;

    if (!imageUrl || !category) {
      const resp = NextResponse.json(
        { error: 'Image URL and Category are required.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    const newImage = await DesignGalleryImage.create({
      imageUrl,
      category,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      caption: caption ? String(caption).trim() : '',
      visible: visible !== undefined ? Boolean(visible) : true,
    });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_IMAGE_CREATED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery',
      outcome: 'SUCCESS',
      details: { imageId: newImage._id.toString(), category },
    });

    const response = NextResponse.json({ success: true, image: newImage });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
