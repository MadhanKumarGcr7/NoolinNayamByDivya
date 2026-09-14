/**
 * Admin Reviews Management API Route (MySQL / Prisma)
 * GET /api/admin/reviews
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customer_name: { contains: search } },
        { customer_email: { contains: search } },
        { product_name: { contains: search } },
        { headline: { contains: search } },
        { comment: { contains: search } },
      ];
    }

    const rawReviews = await prisma.review.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const reviews = rawReviews.map(r => ({
      _id: String(r.id),
      id: String(r.id),
      productId: r.product_id ? String(r.product_id) : null,
      productSlug: r.product_slug,
      productName: r.product_name,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      rating: r.rating,
      headline: r.headline,
      comment: r.comment,
      status: r.status,
      verifiedPurchase: r.verified_purchase,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('[API/Admin/Reviews GET Error]:', error);
    return NextResponse.json({ reviews: [] });
  }
}
