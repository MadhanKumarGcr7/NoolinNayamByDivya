/**
 * Admin Navigation Reorder API (MySQL / Prisma)
 * PATCH /api/admin/navigation/reorder
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

    for (const item of items) {
      const id = Number(item.id);
      if (!isNaN(id)) {
        await prisma.navigationItem.update({
          where: { id },
          data: { display_order: Number(item.order) || 0 },
        });
      }
    }

    const updatedList = await prisma.navigationItem.findMany({
      orderBy: { display_order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      items: updatedList.map(item => ({
        _id: String(item.id),
        id: String(item.id),
        label: item.label,
        order: item.display_order,
      })),
    });
  } catch (error) {
    console.error('[API/Admin/Navigation/Reorder PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error reordering nav items' }, { status: 500 });
  }
}
