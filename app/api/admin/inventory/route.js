/**
 * Admin Inventory API
 * GET /api/admin/inventory
 * ────────────────────────────────────────────────────────────────────────────
 * Returns all products with stock information. Protected: owner JWT.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const products = await Product.find()
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json({ products });

  } catch (error) {
    console.error('[API/Admin/Inventory Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
