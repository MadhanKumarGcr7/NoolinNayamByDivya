/**
 * Admin Design Gallery Products API — GET & PATCH /api/admin/design-gallery/products (MySQL / Prisma)
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
    const q = sanitizeInput(searchParams.get('q') || '');
    const filter = sanitizeInput(searchParams.get('filter') || 'all'); // all | selected | unselected

    const where = {
      status: { not: 'deleted' },
    };

    if (filter === 'selected') {
      where.show_in_design_gallery = true;
    } else if (filter === 'unselected') {
      where.show_in_design_gallery = false;
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { category: { name: { contains: q } } },
        { design_gallery_category: { contains: q } },
      ];
    }

    const rawProducts = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { display_order: 'asc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const products = rawProducts.map((p) => ({
      _id: String(p.id),
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      status: p.status,
      showInDesignGallery: p.show_in_design_gallery,
      designGalleryCategory: p.design_gallery_category || '',
      categoryName: p.category?.name || 'Uncategorized',
      image: p.images[0]?.url || '/placeholder.png',
    }));

    const response = NextResponse.json({ success: true, products });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const { id, showInDesignGallery, designGalleryCategory } = body;

    if (!id) {
      const resp = NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const updateData = {};
    if (typeof showInDesignGallery === 'boolean') {
      updateData.show_in_design_gallery = showInDesignGallery;
    }
    if (designGalleryCategory !== undefined) {
      updateData.design_gallery_category = designGalleryCategory
        ? String(designGalleryCategory).trim()
        : null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        category: true,
        images: {
          orderBy: { display_order: 'asc' },
          take: 1,
        },
      },
    });

    logSecurityEvent({
      event: 'DESIGN_GALLERY_PRODUCT_UPDATED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery/products',
      outcome: 'SUCCESS',
      details: {
        productId: String(updatedProduct.id),
        showInDesignGallery: updatedProduct.show_in_design_gallery,
        designGalleryCategory: updatedProduct.design_gallery_category,
      },
    });

    const response = NextResponse.json({
      success: true,
      product: {
        _id: String(updatedProduct.id),
        id: updatedProduct.id,
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        showInDesignGallery: updatedProduct.show_in_design_gallery,
        designGalleryCategory: updatedProduct.design_gallery_category || '',
        categoryName: updatedProduct.category?.name || 'Uncategorized',
        image: updatedProduct.images[0]?.url || '/placeholder.png',
      },
    });
    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
