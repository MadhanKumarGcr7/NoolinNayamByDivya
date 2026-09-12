/**
 * Admin WhatsApp Community Members API Route
 * GET /api/admin/community
 * PUT /api/admin/community
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: Owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CommunityMember from '@/models/CommunityMember';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await CommunityMember.find(query)
      .sort({ createdAt: -1 })
      .lean();

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
    await connectDB();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: 'Member ID and status required' }, { status: 400 });
    }

    const updated = await CommunityMember.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Member record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (error) {
    console.error('[API/Admin/Community PUT Error]:', error);
    return NextResponse.json({ message: 'Error updating member status' }, { status: 500 });
  }
}
