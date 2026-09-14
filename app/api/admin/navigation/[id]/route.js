/**
 * Admin Navigation Item Operations API (MySQL / Prisma)
 * PATCH & DELETE /api/admin/navigation/[id]
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

export async function PATCH(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params?.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Navigation item not found' }, { status: 404 });
    }

    const body = await request.json();
    const existing = await prisma.navigationItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Navigation item not found' }, { status: 404 });
    }

    const { label, linkType, categorySlug, pageSlug, externalUrl, visible, assignedFilters } = body;
    const data = {};

    if (visible !== undefined) data.visible = Boolean(visible);
    if (label !== undefined) data.label = label.trim();
    if (linkType !== undefined) data.link_type = linkType;

    const type = linkType !== undefined ? linkType : existing.link_type;

    if (type === 'category') {
      const catSlug = slugify(categorySlug || label || 'category');
      let cat = await prisma.productCategory.findFirst({ where: { slug: catSlug } });
      if (!cat) {
        cat = await prisma.productCategory.create({
          data: { name: (label || 'Category').trim(), slug: catSlug },
        });
      }
      data.category_id = cat.id;
      data.page_slug = null;
      data.external_url = null;
    } else if (type === 'page') {
      data.page_slug = pageSlug !== undefined ? pageSlug : existing.page_slug;
      data.category_id = null;
      data.external_url = null;
    } else if (type === 'external') {
      data.external_url = externalUrl !== undefined ? externalUrl : existing.external_url;
      data.category_id = null;
      data.page_slug = null;
    }

    await prisma.navigationItem.update({
      where: { id },
      data,
    });

    if (Array.isArray(assignedFilters)) {
      await prisma.navigationItemFilter.deleteMany({ where: { navigation_item_id: id } });
      for (let idx = 0; idx < assignedFilters.length; idx++) {
        const af = assignedFilters[idx];
        const filterId = Number(af.filterId || af.id || af);
        if (!isNaN(filterId)) {
          await prisma.navigationItemFilter.create({
            data: {
              navigation_item_id: id,
              filter_id: filterId,
              display_order: af.order !== undefined ? Number(af.order) : idx,
            },
          });
        }
      }
    }

    const updated = await prisma.navigationItem.findUnique({
      where: { id },
      include: { category: true, navigation_item_filters: true },
    });

    return NextResponse.json({
      success: true,
      item: {
        _id: String(updated.id),
        id: String(updated.id),
        label: updated.label,
        visible: updated.visible,
      },
    });
  } catch (error) {
    console.error('[API/Admin/Navigation/[id] PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error updating nav item' }, { status: 500 });
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
      return NextResponse.json({ message: 'Navigation item not found' }, { status: 404 });
    }

    const item = await prisma.navigationItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Navigation item "${item.label}" removed cleanly.`,
    });
  } catch (error) {
    console.error('[API/Admin/Navigation/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting nav item' }, { status: 500 });
  }
}
