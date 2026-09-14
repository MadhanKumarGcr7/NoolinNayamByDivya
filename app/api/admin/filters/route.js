/**
 * Admin Filters API (MySQL / Prisma)
 * GET & POST /api/admin/filters
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
    const rawFilters = await prisma.filter.findMany({
      include: { options: true },
    });

    const filters = rawFilters.map(f => ({
      _id: String(f.id),
      id: String(f.id),
      name: f.name,
      slug: f.slug,
      type: f.type,
      options: f.options.map(o => ({
        label: o.label,
        value: o.value,
        hex: o.hex,
      })),
      rangeMin: f.range_min,
      rangeMax: f.range_max,
      rangeUnit: f.range_unit,
      active: f.active,
    }));

    return NextResponse.json({ success: true, filters });
  } catch (error) {
    console.error('[API/Admin/Filters GET Error]:', error);
    return NextResponse.json({ message: 'Server error fetching filters' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, options, rangeMin, rangeMax, rangeUnit, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Filter name is required' }, { status: 400 });
    }

    let slug = slugify(name);
    let existing = await prisma.filter.findUnique({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${slugify(name)}-${counter}`;
      existing = await prisma.filter.findUnique({ where: { slug } });
      counter++;
    }

    const filter = await prisma.filter.create({
      data: {
        name: name.trim(),
        slug,
        type: type || 'multi-select',
        range_min: rangeMin !== undefined ? Number(rangeMin) : null,
        range_max: rangeMax !== undefined ? Number(rangeMax) : null,
        range_unit: rangeUnit || '₹',
        active: active !== undefined ? Boolean(active) : true,
        options: {
          create: (Array.isArray(options) ? options : []).map((o) => ({
            label: o.label,
            value: o.value,
            hex: o.hex || null,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({
      success: true,
      filter: {
        _id: String(filter.id),
        id: String(filter.id),
        name: filter.name,
        slug: filter.slug,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[API/Admin/Filters POST Error]:', error);
    return NextResponse.json({ message: 'Server error creating filter' }, { status: 500 });
  }
}
