/**
 * Admin Products API
 * GET  /api/admin/products — Returns list of all products (including draft/hidden)
 * POST /api/admin/products — Creates a new product
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
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const status   = searchParams.get('status') || '';
    const search   = searchParams.get('search') || '';

    // Exclude soft-deleted products by default
    const query = { status: { $ne: 'deleted' } };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean();

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
    await connectDB();

    const body = await request.json();
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
      filterValues,
    } = body;

    // Backend validation
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ message: 'Missing required fields: name, description, price, category' }, { status: 400 });
    }

    // Auto-generate or validate slug
    let baseSlug = slugify(customSlug || name);
    let finalSlug = baseSlug;
    let existing = await Product.findOne({ slug: finalSlug });
    let counter = 1;
    while (existing) {
      finalSlug = `${baseSlug}-${counter}`;
      existing = await Product.findOne({ slug: finalSlug });
      counter += 1;
    }

    // Process variant stock & outOfStock flags
    let processedVariants = [];
    let totalStock = 0;
    if (variants && Array.isArray(variants) && variants.length > 0) {
      processedVariants = variants.map((v) => ({
        size:       v.size || null,
        color:      v.color || null,
        stock:      Math.max(0, parseInt(v.stock, 10) || 0),
        outOfStock: Boolean(v.outOfStock) || (parseInt(v.stock, 10) || 0) <= 0,
      }));
      totalStock = processedVariants.reduce((sum, v) => sum + v.stock, 0);
    } else if (body.stock !== undefined) {
      totalStock = Math.max(0, parseInt(body.stock, 10) || 0);
    }

    const newProduct = await Product.create({
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : null,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      variants: processedVariants,
      material: material ? material.trim() : '100% Soft Cotton Yarn',
      care: care ? care.trim() : 'Hand wash cold · Lay flat to dry',
      featured: Boolean(featured),
      newArrival: Boolean(newArrival),
      customizable: Boolean(customizable),
      status: status || 'active',
      badge: badge || null,
      images: Array.isArray(images) ? images : [],
      stock: totalStock,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      filterValues: Array.isArray(filterValues) ? filterValues : [],
    });

    return NextResponse.json(
      {
        success: true,
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API/Admin/Products POST Error]:', error);
    return NextResponse.json({ message: 'Server error creating product.' }, { status: 500 });
  }
}
