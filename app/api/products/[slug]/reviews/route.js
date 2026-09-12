/**
 * Public Product Reviews API Route
 * GET  /api/products/[slug]/reviews — Fetch approved reviews & rating summary for a product
 * POST /api/products/[slug]/reviews — Submit new customer review & rating
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

async function getProduct(slug) {
  if (!slug) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(slug);

  return await Product.findOne({
    $or: [
      { slug: slug.toLowerCase() },
      { slug: slug },
      ...(isObjectId ? [{ _id: slug }] : []),
    ],
  });
}

// Recalculates aggregate average rating and approved review count on Product document
async function recalculateProductRating(productId) {
  const reviews = await Review.find({ productId, status: 'approved' }).lean();
  const reviewCount = reviews.length;
  let averageRating = 5.0;

  if (reviewCount > 0) {
    const totalStars = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Math.round((totalStars / reviewCount) * 10) / 10;
  }

  await Product.findByIdAndUpdate(productId, {
    $set: { averageRating, reviewCount },
  });

  return { averageRating, reviewCount };
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const slug = params?.slug;

    const product = await getProduct(slug);
    if (!product) {
      return NextResponse.json({ reviews: [], averageRating: 5.0, reviewCount: 0 });
    }

    const reviews = await Review.find({ productId: product._id, status: 'approved' })
      .sort({ createdAt: -1 })
      .lean();

    // Rating breakdown (1 to 5 stars counts)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    return NextResponse.json({
      averageRating: product.averageRating || 5.0,
      reviewCount: reviews.length,
      distribution,
      reviews,
    });
  } catch (error) {
    console.error('[API/Products/[slug]/Reviews GET Error]:', error);
    return NextResponse.json({ reviews: [], averageRating: 5.0, reviewCount: 0 });
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB();
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

    const review = await Review.create({
      productId: product._id,
      productSlug: product.slug,
      productName: product.name,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      rating: numericRating,
      headline: headline.trim(),
      comment: comment.trim(),
      status: 'approved', // Auto-publish for immediate feedback (admin can moderate)
    });

    // Recalculate rating score
    const stats = await recalculateProductRating(product._id);

    return NextResponse.json({
      success: true,
      review,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      message: 'Thank you for your feedback! Your review has been published.',
    }, { status: 201 });

  } catch (error) {
    console.error('[API/Products/[slug]/Reviews POST Error]:', error);
    return NextResponse.json({ message: 'Error submitting review.' }, { status: 500 });
  }
}
