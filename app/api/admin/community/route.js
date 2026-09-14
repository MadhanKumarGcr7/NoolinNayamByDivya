/**
 * Admin WhatsApp Community Members API Route (MySQL / Prisma)
 * GET & PUT /api/admin/community
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const rawMembers = await prisma.communityMember.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const members = rawMembers.map(m => ({
      _id: String(m.id),
      id: String(m.id),
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      source: m.source,
      status: m.status,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('[API/Admin/Community GET Error]:', error);
    return NextResponse.json({ message: 'Error fetching community members' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    const memberId = Number(id);
    if (!id || isNaN(memberId) || !status) {
      return NextResponse.json({ message: 'Valid Member ID and status required' }, { status: 400 });
    }

    const updated = await prisma.communityMember.update({
      where: { id: memberId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      member: {
        _id: String(updated.id),
        id: String(updated.id),
        status: updated.status,
      },
    });
  } catch (error) {
    console.error('[API/Admin/Community PUT Error]:', error);
    return NextResponse.json({ message: 'Error updating member status' }, { status: 500 });
  }
}
