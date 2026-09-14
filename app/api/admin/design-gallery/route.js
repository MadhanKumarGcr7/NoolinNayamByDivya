/**
 * Admin Design Gallery API — GET & POST /api/admin/design-gallery (MySQL / Prisma)
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    const { searchParams } = new URL(request.url);
    const category = sanitizeInput(searchParams.get('category') || '');
    const q = sanitizeInput(searchParams.get('q') || '');

    const where = {};
    if (category) {
      where.category = { name: category };
    }
    if (q) {
      where.OR = [
        { caption: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    const rawImages = await prisma.designGalleryImage.findMany({
      where,
      include: { category: true },
      orderBy: { created_at: 'desc' },
    });

    const images = rawImages.map(img => ({
      _id: String(img.id),
      id: String(img.id),
      imageUrl: img.image_url,
      category: img.category.name,
      caption: img.caption || '',
      tags: Array.isArray(img.tags) ? img.tags : [],
      visible: img.visible,
      createdAt: img.created_at,
    }));

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

    const { body } = await sanitizeRequestData(request);
    const { imageUrl, category: categoryName, tags, caption, visible } = body;

    if (!imageUrl || !categoryName) {
      const resp = NextResponse.json(
        { error: 'Image URL and Category are required.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    let cat = await prisma.designGalleryCategory.findFirst({
      where: { name: categoryName },
    });

    if (!cat) {
      cat = await prisma.designGalleryCategory.create({
        data: { name: categoryName },
      });
    }

    const tagList = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim())
      : [];

    const newImage = await prisma.designGalleryImage.create({
      data: {
        category_id: cat.id,
        image_url: imageUrl,
        tags: tagList,
        caption: caption ? String(caption).trim() : null,
        visible: visible !== undefined ? Boolean(visible) : true,
      },
    });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_IMAGE_CREATED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery',
      outcome: 'SUCCESS',
      details: { imageId: String(newImage.id), category: categoryName },
    });

    const response = NextResponse.json({
      success: true,
      image: {
        _id: String(newImage.id),
        id: String(newImage.id),
        imageUrl: newImage.image_url,
        category: categoryName,
      },
    });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
