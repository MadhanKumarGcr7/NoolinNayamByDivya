/**
 * Admin Workshops List & Creation API Route
 * GET  /api/admin/workshops
 * POST /api/admin/workshops
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: Owner JWT required (via centralized security layer).
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const workshops = await Workshop.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const resp = NextResponse.json({ workshops });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const body = await request.json();

    const {
      title,
      description,
      coverImage,
      date,
      time,
      duration,
      location,
      isOnline,
      meetingLink,
      seatsTotal,
      price,
      isFree,
      skillLevel,
      registrationDeadline,
      status,
    } = body;

    if (!title || !description || !date || !time || !location) {
      const resp = NextResponse.json(
        { message: 'Missing required workshop fields (title, description, date, time, location).' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    // Auto-generate unique slug
    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Workshop.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const newWorkshop = await Workshop.create({
      title,
      slug: finalSlug,
      description,
      coverImage: coverImage || '/assets/workshops/placeholder-workshop.jpg',
      date: new Date(date),
      time,
      duration: duration || '3 Hours',
      location,
      isOnline: Boolean(isOnline),
      meetingLink: meetingLink || '',
      seatsTotal: parseInt(seatsTotal, 10) || 10,
      seatsFilled: 0,
      price: isFree ? 0 : parseFloat(price) || 0,
      isFree: Boolean(isFree) || parseFloat(price) === 0,
      skillLevel: skillLevel || 'All Levels',
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      status: status || 'published',
    });

    const resp = NextResponse.json({
      success: true,
      workshop: newWorkshop,
    }, { status: 201 });

    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
