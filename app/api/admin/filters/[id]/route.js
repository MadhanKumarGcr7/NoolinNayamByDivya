/**
 * Admin Filter Detail Operations API (MySQL / Prisma)
 * GET, PATCH, DELETE /api/admin/filters/[id]
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
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    const filter = await prisma.filter.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!filter) {
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      filter: {
        _id: String(filter.id),
        id: String(filter.id),
        name: filter.name,
        slug: filter.slug,
        type: filter.type,
        options: filter.options,
        rangeMin: filter.range_min,
        rangeMax: filter.range_max,
        rangeUnit: filter.range_unit,
        active: filter.active,
      },
    });
  } catch (error) {
    console.error('[API/Admin/Filters/[id] GET Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params?.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, options, rangeMin, rangeMax, rangeUnit, active } = body;

    const data = {};
    if (active !== undefined) data.active = Boolean(active);
    if (name !== undefined) {
      data.name = name.trim();
      let newSlug = slugify(name);
      let slugExists = await prisma.filter.findFirst({ where: { slug: newSlug, NOT: { id } } });
      let counter = 1;
      while (slugExists) {
        newSlug = `${slugify(name)}-${counter}`;
        slugExists = await prisma.filter.findFirst({ where: { slug: newSlug, NOT: { id } } });
        counter++;
      }
      data.slug = newSlug;
    }
    if (type !== undefined) data.type = type;
    if (rangeMin !== undefined) data.range_min = Number(rangeMin);
    if (rangeMax !== undefined) data.range_max = Number(rangeMax);
    if (rangeUnit !== undefined) data.range_unit = rangeUnit;

    await prisma.filter.update({
      where: { id },
      data,
    });

    if (Array.isArray(options)) {
      await prisma.filterOption.deleteMany({ where: { filter_id: id } });
      for (const o of options) {
        await prisma.filterOption.create({
          data: {
            filter_id: id,
            label: o.label,
            value: o.value,
            hex: o.hex || null,
          },
        });
      }
    }

    const updated = await prisma.filter.findUnique({
      where: { id },
      include: { options: true },
    });

    return NextResponse.json({
      success: true,
      filter: {
        _id: String(updated.id),
        id: String(updated.id),
        name: updated.name,
        slug: updated.slug,
        type: updated.type,
        active: updated.active,
      },
    });
  } catch (error) {
    console.error('[API/Admin/Filters/[id] PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error updating filter' }, { status: 500 });
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
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    const filter = await prisma.filter.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Filter "${filter.name}" deleted cleanly from MySQL.`,
    });
  } catch (error) {
    console.error('[API/Admin/Filters/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting filter' }, { status: 500 });
  }
}
