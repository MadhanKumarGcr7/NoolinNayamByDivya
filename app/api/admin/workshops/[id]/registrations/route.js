/**
 * Admin Workshop Registrations API Route
 * GET  /api/admin/workshops/[id]/registrations
 * POST /api/admin/workshops/[id]/registrations (Manual Add)
 * PUT  /api/admin/workshops/[id]/registrations (Update Status / Payment)
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: Owner JWT required (via centralized security layer).
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import WorkshopRegistration from '@/models/WorkshopRegistration';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const workshopId = params?.id;

    const workshop = await Workshop.findById(workshopId).lean();
    if (!workshop) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const registrations = await WorkshopRegistration.find({ workshopId })
      .sort({ createdAt: -1 })
      .lean();

    const resp = NextResponse.json({ workshop, registrations });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();
    const workshopId = params?.id;
    const body = await request.json();

    const { name, email, phone, seatsBooked, notes, paymentStatus, status } = body;

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const requestedSeats = Math.max(1, parseInt(seatsBooked, 10) || 1);
    const regStatus = status || 'confirmed';

    const newReg = await WorkshopRegistration.create({
      workshopId,
      name,
      email,
      phone,
      seatsBooked: requestedSeats,
      notes: notes || '',
      paymentStatus: paymentStatus || (workshop.isFree ? 'waived' : 'paid'),
      status: regStatus,
    });

    // If confirmed, update seatsFilled on Workshop
    if (regStatus === 'confirmed') {
      const updatedFilled = workshop.seatsFilled + requestedSeats;
      const isFull = updatedFilled >= workshop.seatsTotal;
      await Workshop.findByIdAndUpdate(workshopId, {
        $set: {
          seatsFilled: updatedFilled,
          ...(isFull && workshop.status === 'published' ? { status: 'full' } : {}),
        },
      });
    }

    const resp = NextResponse.json({ success: true, registration: newReg }, { status: 201 });
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
    const body = await request.json();
    const { registrationId, status, paymentStatus } = body;

    if (!registrationId) {
      const resp = NextResponse.json({ message: 'Registration ID required' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const existingReg = await WorkshopRegistration.findById(registrationId);
    if (!existingReg) {
      const resp = NextResponse.json({ message: 'Registration record not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const oldStatus = existingReg.status;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedReg = await WorkshopRegistration.findByIdAndUpdate(
      registrationId,
      { $set: updateData },
      { new: true }
    );

    // Adjust workshop seatsFilled if status changed
    const workshop = await Workshop.findById(existingReg.workshopId);
    if (workshop) {
      let deltaSeats = 0;
      if (oldStatus !== 'confirmed' && status === 'confirmed') {
        deltaSeats = existingReg.seatsBooked;
      } else if (oldStatus === 'confirmed' && status && status !== 'confirmed') {
        deltaSeats = -existingReg.seatsBooked;
      }

      if (deltaSeats !== 0) {
        const newFilled = Math.max(0, workshop.seatsFilled + deltaSeats);
        const shouldBeFull = newFilled >= workshop.seatsTotal;
        const newWorkshopStatus =
          shouldBeFull && workshop.status === 'published'
            ? 'full'
            : !shouldBeFull && workshop.status === 'full'
            ? 'published'
            : workshop.status;

        await Workshop.findByIdAndUpdate(workshop._id, {
          $set: { seatsFilled: newFilled, status: newWorkshopStatus },
        });
      }
    }

    const resp = NextResponse.json({ success: true, registration: updatedReg });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
