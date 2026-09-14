/**
 * Admin Single Product Inventory API (MySQL / Prisma)
 * PATCH /api/admin/inventory/[id]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params?.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();

    if (Array.isArray(body.variants)) {
      await prisma.productVariant.deleteMany({ where: { product_id: id } });
      for (const v of body.variants) {
        const stock = Math.max(0, parseInt(v.stock, 10) || 0);
        await prisma.productVariant.create({
          data: {
            product_id: id,
            size: v.size || null,
            color: v.color || null,
            stock,
            out_of_stock: stock === 0,
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!updated) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        _id: String(updated.id),
        id: String(updated.id),
        name: updated.name,
      },
    });

  } catch (error) {
    console.error('[API/Admin/Inventory/[id] PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
