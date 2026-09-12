import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavigationItem from '@/models/NavigationItem';
import ProductCategory from '@/models/ProductCategory';
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
    await connectDB();
    const items = await NavigationItem.find({}).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[API/Admin/Navigation GET Error]:', error);
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
    const { label, linkType, categorySlug, pageSlug, externalUrl, visible } = body;

    if (!label || !label.trim()) {
      return NextResponse.json({ message: 'Label is required' }, { status: 400 });
    }

    const type = linkType || 'page';

    // Find highest order
    const lastItem = await NavigationItem.findOne({}).sort({ order: -1 }).lean();
    const nextOrder = lastItem ? lastItem.order + 1 : 0;

    let finalCategorySlug = '';
    if (type === 'category') {
      finalCategorySlug = slugify(categorySlug || label);
      // Auto-upsert into ProductCategory schema
      await ProductCategory.updateOne(
        { slug: finalCategorySlug },
        { $setOnInsert: { slug: finalCategorySlug, label: label.trim(), order: nextOrder } },
        { upsert: true }
      );
    }

    const newItem = await NavigationItem.create({
      label: label.trim(),
      linkType: type,
      categorySlug: type === 'category' ? finalCategorySlug : '',
      pageSlug: type === 'page' ? (pageSlug || '/') : '',
      externalUrl: type === 'external' ? (externalUrl || '') : '',
      order: nextOrder,
      visible: visible !== undefined ? Boolean(visible) : true,
      isFixed: false,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('[API/Admin/Navigation POST Error]:', error);
    return NextResponse.json({ message: 'Server error creating nav item' }, { status: 500 });
  }
}
