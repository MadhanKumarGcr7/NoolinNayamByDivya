/**
 * Admin Custom Requests API (MySQL / Prisma)
 * GET /api/admin/custom-requests
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where = {};
    if (status && status !== 'all') where.status = status;

    const rawRequests = await prisma.customOrderRequest.findMany({
      where,
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

    return NextResponse.json({ requests });

  } catch (error) {
    console.error('[API/Admin/Custom-Requests Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
