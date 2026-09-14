/**
 * Admin Filters Reorder API (MySQL / Prisma)
 * PATCH /api/admin/filters/reorder
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ message: 'Invalid payload, items array required' }, { status: 400 });
    }

    const updatedList = await prisma.filter.findMany({
      include: { options: true },
    });

    const filters = updatedList.map(f => ({
      _id: String(f.id),
      id: String(f.id),
      name: f.name,
      slug: f.slug,
      type: f.type,
      active: f.active,
    }));

    return NextResponse.json({ success: true, filters });
  } catch (error) {
    console.error('[API/Admin/Filters/Reorder PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error reordering filters' }, { status: 500 });
  }
}
