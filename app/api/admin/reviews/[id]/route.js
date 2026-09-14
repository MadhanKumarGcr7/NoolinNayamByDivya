/**
 * Admin Single Review Moderation API Route (MySQL / Prisma)
 * PUT & DELETE /api/admin/reviews/[id]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = Number(params?.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      review: {
        _id: String(review.id),
        id: String(review.id),
        status: review.status,
      },
    });
  } catch (error) {
    console.error('[API/Admin/Reviews/[id] PUT Error]:', error);
    return NextResponse.json({ message: 'Error updating review' }, { status: 500 });
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
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Review permanently deleted.' });
  } catch (error) {
    console.error('[API/Admin/Reviews/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Error deleting review' }, { status: 500 });
  }
}
