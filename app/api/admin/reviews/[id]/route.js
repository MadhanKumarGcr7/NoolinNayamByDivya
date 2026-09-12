/**
 * Admin Single Review Moderation API Route
 * PUT    /api/admin/reviews/[id] — Approve or Reject a review
 * DELETE /api/admin/reviews/[id] — Hard delete unwanted review
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
}

export async function PUT(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const id = params?.id;
    const body = await request.json();
    const { status } = body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Recalculate rating on parent product
    await recalculateProductRating(review.productId);

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('[API/Admin/Reviews/[id] PUT Error]:', error);
    return NextResponse.json({ message: 'Error updating review' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const id = params?.id;

    const review = await Review.findByIdAndDelete(id);
    if (review) {
      await recalculateProductRating(review.productId);
    }

    return NextResponse.json({ success: true, message: 'Review permanently deleted.' });
  } catch (error) {
    console.error('[API/Admin/Reviews/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Error deleting review' }, { status: 500 });
  }
}
