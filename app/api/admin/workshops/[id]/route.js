/**
 * Admin Workshop Detail, Update, & Delete API Route (MySQL / Prisma)
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const w = await prisma.workshop.findUnique({ where: { id } });

    if (!w) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const workshop = {
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
    };

    const resp = NextResponse.json({ workshop });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const body = await request.json();

    const data = {};
    if (body.title) data.title = body.title;
    if (body.description) data.description = body.description;
    if (body.coverImage) data.cover_image = body.coverImage;
    if (body.date) data.date = String(body.date);
    if (body.time) data.time = String(body.time);
    if (body.duration !== undefined) data.duration = body.duration;
    if (body.location !== undefined) data.location = body.location;
    if (body.isOnline !== undefined) data.is_online = Boolean(body.isOnline);
    if (body.meetingLink !== undefined) data.meeting_link = body.meetingLink;
    if (body.seatsTotal !== undefined) data.seats_total = parseInt(body.seatsTotal, 10);
    if (body.seatsFilled !== undefined) data.seats_filled = Math.max(0, parseInt(body.seatsFilled, 10));
    if (body.price !== undefined) {
      data.price = body.isFree ? 0 : parseFloat(body.price);
      data.is_free = Boolean(body.isFree) || parseFloat(body.price) === 0;
    }
    if (body.skillLevel) data.skill_level = body.skillLevel;
    if (body.status) data.status = body.status;

    const w = await prisma.workshop.update({
      where: { id },
      data,
    });

    const resp = NextResponse.json({
      success: true,
      workshop: {
        _id: String(w.id),
        id: String(w.id),
        title: w.title,
        status: w.status,
      },
    });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const id = Number(params?.id);
    if (isNaN(id)) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const workshop = await prisma.workshop.delete({
      where: { id },
    });

    const resp = NextResponse.json({
      success: true,
      message: `Workshop "${workshop.title}" deleted.`,
    });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
