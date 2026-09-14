/**
 * Public Filters API Route (MySQL / Prisma)
 * GET /api/filters
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filters = [];

    if (category && category !== 'all') {
      const navItem = await prisma.navigationItem.findFirst({
        where: {
          visible: true,
          OR: [
            { category: { slug: category } },
            { label: { equals: category } },
          ],
        },
        include: {
          navigation_item_filters: {
            include: { filter: { include: { options: true } } },
            orderBy: { display_order: 'asc' },
          },
        },
      });

      if (navItem && navItem.navigation_item_filters.length > 0) {
        filters = navItem.navigation_item_filters
          .map(nif => nif.filter)
          .filter(f => f && f.active);
      }
    }

    if (filters.length === 0) {
      filters = await prisma.filter.findMany({
        where: { active: true },
        include: { options: true },
      });
    }

    const formattedFilters = filters.map((f) => ({
      _id: String(f.id),
      id: String(f.id),
      name: f.name,
      slug: f.slug,
      type: f.type,
      options: f.options ? f.options.map(o => ({
        label: o.label,
        value: o.value,
        hex: o.hex,
      })) : [],
      rangeMin: f.range_min,
      rangeMax: f.range_max,
      rangeUnit: f.range_unit,
      active: f.active,
    }));

    return NextResponse.json({ success: true, filters: formattedFilters });
  } catch (error) {
    console.error('[API/Filters GET Error]:', error);
    return NextResponse.json({ success: true, filters: [] }, { status: 200 });
  }
}
