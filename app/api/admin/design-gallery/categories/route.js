/**
 * Admin Gallery Categories Management API (MySQL / Prisma)
 * GET, POST & DELETE /api/admin/design-gallery/categories
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

const DEFAULT_CATEGORIES = [
  { name: 'Necklines', display_order: 1 },
  { name: 'Sleeves', display_order: 2 },
  { name: 'Patterns & Motifs', display_order: 3 },
  { name: 'Color Palettes', display_order: 4 },
  { name: 'Finished Garments', display_order: 5 },
  { name: 'Yarn Textures', display_order: 6 },
];

export async function GET(request) {
  try {
    let categories = await prisma.designGalleryCategory.findMany({
      orderBy: { display_order: 'asc' },
    });

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.designGalleryCategory.create({ data: cat });
      }
      categories = await prisma.designGalleryCategory.findMany({
        orderBy: { display_order: 'asc' },
      });
    }

    const response = NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        _id: String(c.id),
        id: String(c.id),
        name: c.name,
        order: c.display_order,
      })),
    });
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
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      const resp = NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const trimmedName = name.trim();
    const existing = await prisma.designGalleryCategory.findFirst({ where: { name: trimmedName } });
    if (existing) {
      const resp = NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
      return applySecurityHeaders(resp, request);
    }

    const count = await prisma.designGalleryCategory.count();
    const newCategory = await prisma.designGalleryCategory.create({
      data: {
        name: trimmedName,
        display_order: count + 1,
      },
    });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_CATEGORY_CREATED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery/categories',
      outcome: 'SUCCESS',
      details: { categoryName: trimmedName },
    });

    const response = NextResponse.json({
      success: true,
      category: {
        _id: String(newCategory.id),
        id: String(newCategory.id),
        name: newCategory.name,
      },
    });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id || isNaN(id)) {
      const resp = NextResponse.json({ error: 'Valid Category ID is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    await prisma.designGalleryCategory.delete({ where: { id } });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_CATEGORY_DELETED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery/categories',
      outcome: 'SUCCESS',
      details: { id: String(id) },
    });

    const response = NextResponse.json({ success: true, message: 'Category removed.' });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
