/**
 * Public Workshops List API Route
 * GET /api/workshops
 * ────────────────────────────────────────────────────────────────────────────
 * Returns published workshops for public customer views.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Query published and full workshops (excluding draft and cancelled)
    const workshops = await Workshop.find({
      status: { $in: ['published', 'full', 'completed'] },
    })
      .sort({ date: 1, createdAt: -1 })
      .lean();

    const mappedWorkshops = workshops.map((w) => ({
      ...w,
      id: w.id || w._id.toString(),
    }));

    return NextResponse.json({ workshops: mappedWorkshops });
  } catch (error) {
    console.error('[API/Workshops GET Error]:', error);
    return NextResponse.json({ workshops: [] });
  }
}
