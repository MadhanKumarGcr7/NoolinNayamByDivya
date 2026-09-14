/**
 * Public Product Reviews API Route (MySQL / Prisma)
 * GET  /api/products/[slug]/reviews — Fetch approved reviews & rating summary for a product
 * POST /api/products/[slug]/reviews — Submit new customer review & rating
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getProduct(slug) {
  if (!slug) return null;
  const numId = Number(slug);
  return await prisma.product.findFirst({
    where: {
      OR: [
        { slug: slug.toLowerCase() },
        { slug: slug },
        ...(isNaN(numId) ? [] : [{ id: numId }]),
      ],
    },
  });
}

export async function GET(request, { params }) {
  try {
    const slug = params?.slug;

    const product = await getProduct(slug);
    if (!product) {
      return NextResponse.json({ reviews: [], averageRating: 5.0, reviewCount: 0 });
    }

    const reviews = await prisma.review.findMany({
      where: { product_id: product.id, status: 'approved' },
      orderBy: { created_at: 'desc' },
    });

    const reviewCount = reviews.length;
    let averageRating = 5.0;
    if (reviewCount > 0) {
      const totalStars = reviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = Math.round((totalStars / reviewCount) * 10) / 10;
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    const mappedReviews = reviews.map(r => ({
      _id: String(r.id),
      id: String(r.id),
      productId: String(r.product_id),
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

    return NextResponse.json({
      averageRating,
      reviewCount,
      distribution,
      reviews: mappedReviews,
    });
  } catch (error) {
    console.error('[API/Products/[slug]/Reviews GET Error]:', error);
    return NextResponse.json({ reviews: [], averageRating: 5.0, reviewCount: 0 });
  }
}

export async function POST(request, { params }) {
  try {
    const slug = params?.slug;
    const body = await request.json();

    const { customerName, customerEmail, rating, headline, comment } = body;

    if (!customerName || !customerEmail || !rating || !headline || !comment) {
      return NextResponse.json({ message: 'All review fields are required.' }, { status: 400 });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    const product = await getProduct(slug);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        rating: numericRating,
        headline: headline.trim(),
        comment: comment.trim(),
        status: 'approved',
      },
    });

    const allApproved = await prisma.review.findMany({
      where: { product_id: product.id, status: 'approved' },
    });
    const reviewCount = allApproved.length;
    let averageRating = 5.0;
    if (reviewCount > 0) {
      const totalStars = allApproved.reduce((sum, r) => sum + r.rating, 0);
      averageRating = Math.round((totalStars / reviewCount) * 10) / 10;
    }

    return NextResponse.json({
      success: true,
      review: {
        _id: String(review.id),
        id: String(review.id),
        customerName: review.customer_name,
        customerEmail: review.customer_email,
        rating: review.rating,
        headline: review.headline,
        comment: review.comment,
        status: review.status,
        createdAt: review.created_at,
      },
      averageRating,
      reviewCount,
      message: 'Thank you for your feedback! Your review has been published.',
    }, { status: 201 });

  } catch (error) {
    console.error('[API/Products/[slug]/Reviews POST Error]:', error);
    return NextResponse.json({ message: 'Error submitting review.' }, { status: 500 });
  }
}
