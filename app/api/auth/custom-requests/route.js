/**
 * Customer Custom Requests API — GET /api/auth/custom-requests (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Returns all custom order requests for the logged-in customer.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'customer');
    if (!auth.authenticated || !auth.user?.userId) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const userId = Number(auth.user.userId);
    if (isNaN(userId)) {
      const resp = NextResponse.json({ message: 'Invalid user session' }, { status: 401 });
      return applySecurityHeaders(resp, request);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const resp = NextResponse.json({ message: 'User not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const rawRequests = await prisma.customOrderRequest.findMany({
      where: {
        OR: [
          { user_id: user.id },
          { email: user.email.toLowerCase() },
        ],
      },
      include: {
        gallery_selections: true,
        base_product: {
          include: {
            images: { orderBy: { display_order: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const requests = rawRequests.map(r => ({
      _id: String(r.id),
      id: String(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone,
      productType: r.product_type,
      baseProductId: r.base_product_id ? String(r.base_product_id) : null,
      baseProductNameSnapshot: r.base_product_name_snapshot || r.base_product?.name || null,
      baseProduct: r.base_product ? {
        id: String(r.base_product.id),
        name: r.base_product.name,
        slug: r.base_product.slug,
        price: Number(r.base_product.price),
        image: r.base_product.images?.[0]?.url || null,
      } : null,
      age: r.age,
      size: r.size,
      preferredColor: r.preferred_color,
      occasion: r.occasion,
      desiredDate: r.desired_date,
      customRequirements: r.custom_requirements,
      referenceImageUrl: r.reference_image_url,
      additionalNotes: r.additional_notes,
      ownerResponse: r.owner_response,
      quotedPrice: r.quoted_price ? Number(r.quoted_price) : 0,
      status: r.status,
      createdAt: r.created_at,
      selectedGalleryItems: r.gallery_selections.map(g => ({
        id: String(g.id),
        imageUrl: g.image_url_snapshot,
        caption: g.caption_snapshot,
        note: g.note,
      })),
    }));

    const resp = NextResponse.json({ requests });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
