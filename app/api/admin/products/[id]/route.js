/**
 * Admin Single Product API (MySQL / Prisma)
 * GET    /api/admin/products/[id] — Fetch single product detail
 * PUT    /api/admin/products/[id] — Update product, stock, variants, visibility
 * DELETE /api/admin/products/[id] — Delete product
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

export async function GET(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params?.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { display_order: 'asc' } },
        variants: true,
      },
    });

    if (!p || p.status === 'deleted') {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const images = p.images.map(i => i.url);
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
      category: p.category.slug,
      categoryName: p.category.name,
      material: p.material,
      care: p.care,
      customizable: p.customizable,
      showInDesignGallery: p.show_in_design_gallery,
      designGalleryCategory: p.design_gallery_category || '',
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
    console.error('[API/Admin/Products/[id] GET Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const {
      name,
      slug: customSlug,
      description,
      price,
      category: categorySlug,
      material,
      care,
      featured,
      newArrival,
      customizable,
      showInDesignGallery,
      designGalleryCategory,
      status,
      images,
      variants,
    } = body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (price !== undefined) data.price = parseFloat(price);
    if (material !== undefined) data.material = material;
    if (care !== undefined) data.care = care;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (newArrival !== undefined) data.new_arrival = Boolean(newArrival);
    if (customizable !== undefined) data.customizable = Boolean(customizable);
    if (showInDesignGallery !== undefined) data.show_in_design_gallery = Boolean(showInDesignGallery);
    if (designGalleryCategory !== undefined) data.design_gallery_category = designGalleryCategory ? String(designGalleryCategory).trim() : null;
    if (status !== undefined) data.status = status;

    if (categorySlug) {
      let cat = await prisma.productCategory.findFirst({
        where: { OR: [{ slug: categorySlug }, { name: categorySlug }] },
      });
      if (cat) data.category_id = cat.id;
    }

    if (customSlug && customSlug !== existing.slug) {
      let baseSlug = slugify(customSlug);
      let finalSlug = baseSlug;
      let slugExists = await prisma.product.findFirst({ where: { slug: finalSlug, NOT: { id } } });
      let counter = 1;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await prisma.product.findFirst({ where: { slug: finalSlug, NOT: { id } } });
        counter += 1;
      }
      data.slug = finalSlug;
    }

    await prisma.product.update({
      where: { id },
      data,
    });

    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { product_id: id } });
      for (let i = 0; i < images.length; i++) {
        const url = typeof images[i] === 'string' ? images[i] : images[i].url;
        await prisma.productImage.create({
          data: { product_id: id, url, display_order: i },
        });
      }
    }

    if (Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { product_id: id } });
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            product_id: id,
            size: v.size || null,
            color: v.color || null,
            stock: Math.max(0, parseInt(v.stock, 10) || 0),
            out_of_stock: Boolean(v.outOfStock) || (parseInt(v.stock, 10) || 0) <= 0,
          },
        });
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true, variants: true },
    });

    return NextResponse.json({
      success: true,
      product: {
        _id: String(updatedProduct.id),
        id: String(updatedProduct.id),
        name: updatedProduct.name,
        slug: updatedProduct.slug,
      },
    });

  } catch (error) {
    console.error('[API/Admin/Products/[id] PUT Error]:', error);
    return NextResponse.json({ message: 'Server error updating product.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params?.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" permanently deleted from MySQL.`,
    });

  } catch (error) {
    console.error('[API/Admin/Products/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting product.' }, { status: 500 });
  }
}
