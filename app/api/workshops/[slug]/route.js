/**
 * Public Single Workshop Detail API Route
 * GET /api/workshops/[slug]
 * ────────────────────────────────────────────────────────────────────────────
 * Returns details of a specific workshop by slug.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const slug = params?.slug;

    const workshop = await Workshop.findOne({
      slug,
      status: { $in: ['published', 'full', 'completed'] },
    }).lean();

    if (!workshop) {
      return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json({
      workshop: {
        ...workshop,
        id: workshop.id || workshop._id.toString(),
      },
    });
  } catch (error) {
    console.error('[API/Workshops/[slug] GET Error]:', error);
    return NextResponse.json({ message: 'Error fetching workshop detail' }, { status: 500 });
  }
}
