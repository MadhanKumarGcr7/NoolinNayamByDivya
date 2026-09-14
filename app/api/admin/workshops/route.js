/**
 * Admin Workshops List & Creation API Route (MySQL / Prisma)
 * GET  /api/admin/workshops
 * POST /api/admin/workshops
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'all') where.status = status;

    const rawWorkshops = await prisma.workshop.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const workshops = rawWorkshops.map(w => ({
      _id: String(w.id),
      id: String(w.id),
      title: w.title,
      slug: w.slug,
      description: w.description,
      coverImage: w.cover_image,
      date: w.date,
      time: w.time,
      duration: w.duration,
      location: w.location,
      isOnline: w.is_online,
      meetingLink: w.meeting_link,
      seatsTotal: w.seats_total,
      seatsFilled: w.seats_filled,
      price: Number(w.price),
      isFree: w.is_free,
      skillLevel: w.skill_level,
      registrationDeadline: w.registration_deadline,
      status: w.status,
      createdAt: w.created_at,
    }));

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

    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.workshop.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const w = await prisma.workshop.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        cover_image: coverImage || '/assets/workshops/placeholder-workshop.jpg',
        date: String(date),
        time: String(time),
        duration: duration || '3 Hours',
        location: String(location),
        is_online: Boolean(isOnline),
        meeting_link: meetingLink || null,
        seats_total: parseInt(seatsTotal, 10) || 10,
        seats_filled: 0,
        price: isFree ? 0 : parseFloat(price) || 0,
        is_free: Boolean(isFree) || parseFloat(price) === 0,
        skill_level: skillLevel || 'All Levels',
        registration_deadline: registrationDeadline ? String(registrationDeadline) : null,
        status: status || 'published',
      },
    });

    const resp = NextResponse.json({
      success: true,
      workshop: {
        _id: String(w.id),
        id: String(w.id),
        title: w.title,
        slug: w.slug,
      },
    }, { status: 201 });

    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
