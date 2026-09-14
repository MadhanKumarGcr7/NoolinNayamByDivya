/**
 * Admin Inventory API (MySQL / Prisma)
 * GET /api/admin/inventory
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
    const rawProducts = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { name: 'asc' },
    });

    const products = rawProducts.map((p) => {
      const stock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);
      return {
        _id: String(p.id),
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        category: p.category.slug,
        categoryName: p.category.name,
        price: Number(p.price),
        stock,
        status: p.status,
        variants: p.variants.map(v => ({
          id: String(v.id),
          size: v.size,
          color: v.color,
          stock: v.stock,
          outOfStock: v.out_of_stock,
        })),
      };
    });

    return NextResponse.json({ products });

  } catch (error) {
    console.error('[API/Admin/Inventory Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
