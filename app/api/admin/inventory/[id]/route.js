/**
 * Admin Single Product Inventory API
 * PATCH /api/admin/inventory/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Updates stock for a product (aggregate or variant-level). Protected: owner JWT.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const id = params?.id;
    const body = await request.json();

    const update = {};

    // Update aggregate stock
    if (body.stock !== undefined) {
      update.stock = Math.max(0, parseInt(body.stock, 10) || 0);
    }

    // Update variant-level stock
    if (body.variants && Array.isArray(body.variants)) {
      update.variants = body.variants.map((v) => ({
        size:  v.size || null,
        color: v.color || null,
        stock: Math.max(0, parseInt(v.stock, 10) || 0),
      }));
    }

    // Update low stock threshold
    if (body.lowStockThreshold !== undefined) {
      update.lowStockThreshold = Math.max(0, parseInt(body.lowStockThreshold, 10) || 5);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });

  } catch (error) {
    console.error('[API/Admin/Inventory/[id] PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
