/**
 * Admin Navigation API (MySQL / Prisma)
 * GET & POST /api/admin/navigation
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
    const rawItems = await prisma.navigationItem.findMany({
      include: {
        category: true,
        navigation_item_filters: { include: { filter: true } },
      },
      orderBy: { display_order: 'asc' },
    });

    const items = rawItems.map(item => ({
      _id: String(item.id),
      id: String(item.id),
      label: item.label,
      linkType: item.link_type,
      categorySlug: item.category?.slug || '',
      pageSlug: item.page_slug || '',
      externalUrl: item.external_url || '',
      order: item.display_order,
      visible: item.visible,
      assignedFilters: item.navigation_item_filters.map(nif => ({
        filterId: String(nif.filter_id),
        order: nif.display_order,
      })),
    }));

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
    const body = await request.json();
    const { label, linkType, categorySlug, pageSlug, externalUrl, visible } = body;

    if (!label || !label.trim()) {
      return NextResponse.json({ message: 'Label is required' }, { status: 400 });
    }

    const type = linkType || 'page';
    let categoryId = null;

    if (type === 'category') {
      const finalCategorySlug = slugify(categorySlug || label);
      let cat = await prisma.productCategory.findFirst({ where: { slug: finalCategorySlug } });
      if (!cat) {
        cat = await prisma.productCategory.create({
          data: { name: label.trim(), slug: finalCategorySlug },
        });
      }
      categoryId = cat.id;
    }

    const count = await prisma.navigationItem.count();

    const newItem = await prisma.navigationItem.create({
      data: {
        label: label.trim(),
        link_type: type,
        category_id: categoryId,
        page_slug: type === 'page' ? (pageSlug || '/') : null,
        external_url: type === 'external' ? (externalUrl || '') : null,
        display_order: count,
        visible: visible !== undefined ? Boolean(visible) : true,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        _id: String(newItem.id),
        id: String(newItem.id),
        label: newItem.label,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[API/Admin/Navigation POST Error]:', error);
    return NextResponse.json({ message: 'Server error creating nav item' }, { status: 500 });
  }
}
