/**
 * Public/Customer Custom Orders Lookup API (MySQL / Prisma)
 * POST /api/custom-orders/lookup
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { applySecurityHeaders, handleApiError } from '@/lib/security';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ids = [], email = '' } = body;

    const validIds = (Array.isArray(ids) ? ids : [])
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (validIds.length === 0 && !cleanEmail) {
      const resp = NextResponse.json({ requests: [] });
      return applySecurityHeaders(resp, request);
    }

    const rawRequests = await prisma.customOrderRequest.findMany({
      where: {
        OR: [
          ...(validIds.length > 0 ? [{ id: { in: validIds } }] : []),
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
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
