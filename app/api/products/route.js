/**
 * Public Products API Route
 * GET /api/products
 * ────────────────────────────────────────────────────────────────────────────
 * Returns live active products for public storefront views.
 * Filters out hidden, draft, and deleted products.
 *
 * Auto-seeds MongoDB with seedProducts if MongoDB has 0 products on initial call.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();


    const { searchParams } = new URL(request.url);
    const category   = searchParams.get('category');
    const featured   = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const search     = searchParams.get('search');
    const limit      = parseInt(searchParams.get('limit') || '100', 10);

    // Public query: exclude draft, hidden, and deleted products
    const query = { status: { $nin: ['draft', 'hidden', 'deleted'] } };

    if (category && category !== 'all') {
      if (category === 'new-arrivals') {
        query.newArrival = true;
      } else if (category === 'custom') {
        query.customizable = true;
      } else {
        const catRegexStr = category.replace(/[-_]/g, '[-\\s_]?');
        const catRegex = new RegExp(`^${catRegexStr}$`, 'i');
        query.$or = [
          { category: catRegex },
          { subcategory: catRegex },
          { tags: { $in: [catRegex] } },
        ];
      }
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (newArrival === 'true') {
      query.newArrival = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortParam  = searchParams.get('sort');

    let sortObj = { featured: -1, newArrival: -1, createdAt: -1 };
    if (sortParam === 'most-sold') {
      sortObj = { soldCount: -1, createdAt: -1 };
    } else if (sortParam === 'most-wishlisted') {
      sortObj = { wishlistCount: -1, createdAt: -1 };
    } else if (sortParam === 'low-stock') {
      sortObj = { stock: 1, createdAt: -1 };
    } else if (sortParam === 'price-low') {
      sortObj = { price: 1 };
    } else if (sortParam === 'price-high') {
      sortObj = { price: -1 };
    } else if (sortParam === 'newest') {
      sortObj = { newArrival: -1, createdAt: -1 };
    }

    let products = await Product.find(query)
      .sort(sortObj)
      .limit(limit)
      .lean();

    // Fallback: If featured=true or newArrival=true resulted in 0 products (e.g. newly created products where flags aren't explicitly true), fetch all active products
    if (products.length === 0 && (featured === 'true' || newArrival === 'true')) {
      delete query.featured;
      delete query.newArrival;
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    // Map Mongo `_id` to `id` for backwards compatibility with UI components
    const mappedProducts = products.map((p) => ({
      ...p,
      id: p.id || p._id.toString(),
    }));

    return NextResponse.json({ products: mappedProducts });

  } catch (error) {
    console.error('[API/Products Error]:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}
