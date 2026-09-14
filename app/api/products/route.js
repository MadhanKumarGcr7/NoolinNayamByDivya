/**
 * Public Products API Route (MySQL / Prisma)
 * GET /api/products
 * ────────────────────────────────────────────────────────────────────────────
 * Returns active products for public storefront views.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category   = searchParams.get('category');
    const featured   = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const search     = searchParams.get('search');
    const limit      = parseInt(searchParams.get('limit') || '100', 10);
    const sortParam  = searchParams.get('sort');

    const where = {
      status: { notIn: ['draft', 'hidden', 'deleted'] },
    };

    if (category && category !== 'all') {
      if (category === 'new-arrivals') {
        where.new_arrival = true;
      } else if (category === 'custom') {
        where.customizable = true;
      } else {
        const cat = await prisma.productCategory.findFirst({
          where: { slug: category },
        });
        if (cat) {
          where.category_id = cat.id;
        } else {
          where.OR = [
            { name: { contains: category } },
            { description: { contains: category } },
          ];
        }
      }
    }

    if (featured === 'true') {
      where.featured = true;
    }
    if (newArrival === 'true') {
      where.new_arrival = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy = { created_at: 'desc' };
    if (sortParam === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sortParam === 'price-high') {
      orderBy = { price: 'desc' };
    }

    let rawProducts = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { display_order: 'asc' } },
        variants: true,
      },
      orderBy,
      take: limit,
    });

    if (rawProducts.length === 0 && (featured === 'true' || newArrival === 'true')) {
      delete where.featured;
      delete where.new_arrival;
      rawProducts = await prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { display_order: 'asc' } },
          variants: true,
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      });
    }

    const mappedProducts = rawProducts.map((p) => {
      const images = p.images.map(img => img.url);
      const sizes = Array.from(new Set(p.variants.map(v => v.size).filter(Boolean)));
      const colors = Array.from(new Set(p.variants.map(v => v.color).filter(Boolean))).map(name => ({ name }));
      const stock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);

      return {
        _id: String(p.id),
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
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
    });

    return NextResponse.json({ products: mappedProducts });

  } catch (error) {
    console.error('[API/Products Error]:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}
