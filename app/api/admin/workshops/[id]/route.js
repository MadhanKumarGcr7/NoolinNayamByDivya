/**
 * Admin Workshop Detail, Update, & Delete API Route
 * GET    /api/admin/workshops/[id]
 * PUT    /api/admin/workshops/[id]
 * DELETE /api/admin/workshops/[id]
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: Owner JWT required (via centralized security layer).
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import WorkshopRegistration from '@/models/WorkshopRegistration';
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

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const id = params?.id;
    const workshop = await Workshop.findById(id).lean();

    if (!workshop) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

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

    await connectDB();
    const id = params?.id;
    const body = await request.json();

    const existing = await Workshop.findById(id);
    if (!existing) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

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
      seatsFilled,
      price,
      isFree,
      skillLevel,
      registrationDeadline,
      status,
    } = body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (coverImage) updateData.coverImage = coverImage;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (duration !== undefined) updateData.duration = duration;
    if (location !== undefined) updateData.location = location;
    if (isOnline !== undefined) updateData.isOnline = Boolean(isOnline);
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (seatsTotal !== undefined) updateData.seatsTotal = parseInt(seatsTotal, 10);
    if (seatsFilled !== undefined) updateData.seatsFilled = Math.max(0, parseInt(seatsFilled, 10));
    if (price !== undefined) {
      updateData.price = isFree ? 0 : parseFloat(price);
      updateData.isFree = Boolean(isFree) || parseFloat(price) === 0;
    }
    if (skillLevel) updateData.skillLevel = skillLevel;
    if (registrationDeadline !== undefined) {
      updateData.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    }

    // Auto-update status to full if capacity reached
    const total = updateData.seatsTotal ?? existing.seatsTotal;
    const filled = updateData.seatsFilled ?? existing.seatsFilled;

    if (status) {
      updateData.status = status;
    } else if (filled >= total && existing.status === 'published') {
      updateData.status = 'full';
    } else if (filled < total && existing.status === 'full') {
      updateData.status = 'published';
    }

    const updated = await Workshop.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    const resp = NextResponse.json({
      success: true,
      workshop: updated,
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

    await connectDB();
    const id = params?.id;

    const workshop = await Workshop.findByIdAndDelete(id);
    if (!workshop) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    // Also remove associated registrations
    await WorkshopRegistration.deleteMany({ workshopId: id });

    const resp = NextResponse.json({
      success: true,
      message: `Workshop "${workshop.title}" deleted.`,
    });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
