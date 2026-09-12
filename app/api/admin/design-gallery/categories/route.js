/**
 * Admin Gallery Categories Management API — GET, POST & DELETE /api/admin/design-gallery/categories
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened design gallery category management. Protected: owner authentication required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DesignGalleryCategory from '@/models/DesignGalleryCategory';
import {
  requireAuth,
  sanitizeRequestData,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { name: 'Necklines', order: 1 },
  { name: 'Sleeves', order: 2 },
  { name: 'Patterns & Motifs', order: 3 },
  { name: 'Color Palettes', order: 4 },
  { name: 'Finished Garments', order: 5 },
  { name: 'Yarn Textures', order: 6 },
];

export async function GET(request) {
  try {
    await connectDB();

    let categories = await DesignGalleryCategory.find().sort({ order: 1, createdAt: 1 });

    if (categories.length === 0) {
      try {
        await DesignGalleryCategory.insertMany(DEFAULT_CATEGORIES);
        categories = await DesignGalleryCategory.find().sort({ order: 1, createdAt: 1 });
      } catch {
        categories = await DesignGalleryCategory.find().sort({ order: 1, createdAt: 1 });
      }
    }

    const response = NextResponse.json({ success: true, categories });
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
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      const resp = NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const trimmedName = name.trim();
    const existing = await DesignGalleryCategory.findOne({ name: trimmedName });
    if (existing) {
      const resp = NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
      return applySecurityHeaders(resp, request);
    }

    const count = await DesignGalleryCategory.countDocuments();
    const newCategory = await DesignGalleryCategory.create({
      name: trimmedName,
      order: count + 1,
    });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_CATEGORY_CREATED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery/categories',
      outcome: 'SUCCESS',
      details: { categoryName: trimmedName },
    });

    const response = NextResponse.json({ success: true, category: newCategory });
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

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const resp = NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    await DesignGalleryCategory.findByIdAndDelete(id);

    logSecurityEvent({
      event: 'DESIGN_GALLERY_CATEGORY_DELETED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery/categories',
      outcome: 'SUCCESS',
      details: { id },
    });

    const response = NextResponse.json({ success: true, message: 'Category removed.' });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
