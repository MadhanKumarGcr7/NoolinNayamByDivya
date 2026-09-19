/**
 * Admin Products API (MySQL / Prisma)
 * GET  /api/admin/products — List all products (including draft/hidden)
 * POST /api/admin/products — Create a new product
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const status   = searchParams.get('status') || '';
    const search   = searchParams.get('search') || '';

    const where = {
      status: { not: 'deleted' },
    };

    if (category && category !== 'all') {
      const cat = await prisma.productCategory.findFirst({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const rawProducts = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { display_order: 'asc' } },
        variants: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const products = rawProducts.map((p) => {
      const images = p.images.map(i => i.url);
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
    });

    return NextResponse.json({ products });

  } catch (error) {
    console.error('[API/Admin/Products GET Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      description,
      price,
      comparePrice,
      category: categorySlug,
      material,
      care,
      featured,
      newArrival,
      customizable,
      status,
      images = [],
      variants = [],
      sizes = [],
      colors = [],
    } = body;

    if (!name || !description || price === undefined || !categorySlug) {
      return NextResponse.json({ message: 'Missing required fields: name, description, price, category' }, { status: 400 });
    }

    let cat = await prisma.productCategory.findFirst({
      where: { OR: [{ slug: categorySlug }, { name: categorySlug }] },
    });
    if (!cat) {
      cat = await prisma.productCategory.create({
        data: { name: categorySlug, slug: slugify(categorySlug) },
      });
    }

    let baseSlug = slugify(customSlug || name);
    let finalSlug = baseSlug;
    let existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
    let counter = 1;
    while (existing) {
      finalSlug = `${baseSlug}-${counter}`;
      existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
      counter += 1;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        price: parseFloat(price),
        compare_price: comparePrice && !isNaN(parseFloat(comparePrice)) ? parseFloat(comparePrice) : null,
        category_id: cat.id,
        material: material ? material.trim() : null,
        care: care ? care.trim() : null,
        featured: Boolean(featured),
        new_arrival: Boolean(newArrival),
        customizable: Boolean(customizable),
        status: status || 'active',
        images: {
          create: (Array.isArray(images) ? images : []).map((url, idx) => ({
            url: typeof url === 'string' ? url : url.url,
            display_order: idx,
          })),
        },
      },
    });

    // Create Variants
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            product_id: product.id,
            size: v.size || null,
            color: v.color || null,
            stock: Math.max(0, parseInt(v.stock, 10) || 0),
            out_of_stock: Boolean(v.outOfStock) || (parseInt(v.stock, 10) || 0) <= 0,
          },
        });
      }
    } else {
      const sizeList = Array.isArray(sizes) && sizes.length > 0 ? sizes : [null];
      const colorList = Array.isArray(colors) && colors.length > 0 ? colors.map(c => typeof c === 'string' ? c : c?.name) : [null];
      for (const size of sizeList) {
        for (const color of colorList) {
          await prisma.productVariant.create({
            data: {
              product_id: product.id,
              size,
              color,
              stock: Math.max(0, parseInt(body.stock, 10) || 10),
              out_of_stock: (parseInt(body.stock, 10) || 10) <= 0,
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        product: {
          _id: String(product.id),
          id: String(product.id),
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API/Admin/Products POST Error]:', error);
    return NextResponse.json({ message: 'Server error creating product.' }, { status: 500 });
  }
}
