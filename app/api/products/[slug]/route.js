/**
 * Public Product Detail API Route
 * GET /api/products/[slug]
 * ────────────────────────────────────────────────────────────────────────────
 * Returns single active product by slug.
 * Returns 404 if product does not exist, or if status is not 'active'.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const slug = params?.slug;

    const product = await Product.findOne({ slug, status: 'active' }).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        id: product.id || product._id.toString(),
      },
    });

  } catch (error) {
    console.error('[API/Products/[slug] Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
