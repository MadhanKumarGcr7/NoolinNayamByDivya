/**
 * Admin Custom Requests API
 * GET /api/admin/custom-requests
 * ────────────────────────────────────────────────────────────────────────────
 * Lists all custom order requests. Protected: owner JWT required.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const query = {};
    if (status) query.status = status;

    const requests = await CustomOrderRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });

  } catch (error) {
    console.error('[API/Admin/Custom-Requests Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
