/**
 * Public Product Detail API Route (MySQL / Prisma)
 * GET /api/products/[slug]
 * ────────────────────────────────────────────────────────────────────────────
 * Returns single active product by slug.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const slug = params?.slug;

    const p = await prisma.product.findFirst({
      where: { slug, status: 'active' },
      include: {
        category: true,
        images: { orderBy: { display_order: 'asc' } },
        variants: true,
      },
    });

    if (!p) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const images = p.images.map(img => img.url);
    const sizes = Array.from(new Set(p.variants.map(v => v.size).filter(Boolean)));
    const colors = Array.from(new Set(p.variants.map(v => v.color).filter(Boolean))).map(name => ({ name }));
    const stock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);

    const product = {
      _id: String(p.id),
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      comparePrice: p.compare_price ? Number(p.compare_price) : null,
      category: p.category.slug,
      categoryName: p.category.name,
      material: p.material,
      care: p.care,
      customizable: p.customizable,
      featured: p.featured,
      newArrival: p.new_arrival,
      status: p.status,
      createdAt: p.created_at,
      images,
      sizes,
      colors,
      stock,
      variants: p.variants.map(v => ({
        id: String(v.id),
        size: v.size,
        color: v.color,
        stock: v.stock,
        outOfStock: v.out_of_stock,
      })),
    };

    return NextResponse.json({ product });

  } catch (error) {
    console.error('[API/Products/[slug] Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
