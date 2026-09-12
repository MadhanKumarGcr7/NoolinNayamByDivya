/**
 * Admin Single Product API
 * GET    /api/admin/products/[id] — Fetch single product detail
 * PUT    /api/admin/products/[id] — Update product, stock, variants, visibility
 * DELETE /api/admin/products/[id] — Soft-delete product (sets status: 'deleted')
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
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
    await connectDB();
    const id = params?.id;

    const product = await Product.findById(id).lean();

    if (!product || product.status === 'deleted') {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

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
    await connectDB();
    const id = params?.id;
    const body = await request.json();

    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const {
      name,
      slug: customSlug,
      description,
      price,
      comparePrice,
      category,
      subcategory,
      sizes,
      colors,
      variants,
      material,
      care,
      featured,
      newArrival,
      customizable,
      status,
      badge,
      images,
      lowStockThreshold,
      stock,
      filterValues,
    } = body;

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (colors !== undefined) updateData.colors = colors;
    if (material !== undefined) updateData.material = material;
    if (care !== undefined) updateData.care = care;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (newArrival !== undefined) updateData.newArrival = Boolean(newArrival);
    if (customizable !== undefined) updateData.customizable = Boolean(customizable);
    if (status !== undefined) updateData.status = status;
    if (badge !== undefined) updateData.badge = badge || null;
    if (images !== undefined) updateData.images = images;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(lowStockThreshold, 10) || 5;
    if (filterValues !== undefined && Array.isArray(filterValues)) updateData.filterValues = filterValues;

    // Handle slug update if provided and different
    if (customSlug && customSlug !== existing.slug) {
      let baseSlug = slugify(customSlug);
      let finalSlug = baseSlug;
      let slugExists = await Product.findOne({ slug: finalSlug, _id: { $ne: id } });
      let counter = 1;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await Product.findOne({ slug: finalSlug, _id: { $ne: id } });
        counter += 1;
      }
      updateData.slug = finalSlug;
    }

    // Process variant stock & auto outOfStock flag
    if (variants !== undefined && Array.isArray(variants)) {
      const processedVariants = variants.map((v) => ({
        size:       v.size || null,
        color:      v.color || null,
        stock:      Math.max(0, parseInt(v.stock, 10) || 0),
        outOfStock: Boolean(v.outOfStock) || (parseInt(v.stock, 10) || 0) <= 0,
      }));
      updateData.variants = processedVariants;
      updateData.stock = processedVariants.reduce((sum, v) => sum + v.stock, 0);
    } else if (stock !== undefined) {
      updateData.stock = Math.max(0, parseInt(stock, 10) || 0);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      product: updatedProduct,
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
    await connectDB();
    const id = params?.id;

    // Hard delete: permanently remove product document from MongoDB collection
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" permanently deleted from MongoDB.`,
    });

  } catch (error) {
    console.error('[API/Admin/Products/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting product.' }, { status: 500 });
  }
}
