/**
 * Admin Workshop Registrations API Route (MySQL / Prisma)
 * GET  /api/admin/workshops/[id]/registrations
 * POST /api/admin/workshops/[id]/registrations (Manual Add)
 * PUT  /api/admin/workshops/[id]/registrations (Update Status / Payment)
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

    const workshopId = Number(params?.id);
    if (isNaN(workshopId)) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const rawRegs = await prisma.workshopRegistration.findMany({
      where: { workshop_id: workshopId },
      orderBy: { created_at: 'desc' },
    });

    const registrations = rawRegs.map(r => ({
      _id: String(r.id),
      id: String(r.id),
      name: r.name,
      email: r.email,
      phone: r.phone,
      seatsBooked: r.seats_booked,
      paymentStatus: r.payment_status,
      status: r.status,
      createdAt: r.created_at,
    }));

    const resp = NextResponse.json({
      workshop: {
        _id: String(workshop.id),
        id: String(workshop.id),
        title: workshop.title,
      },
      registrations,
    });
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

    const workshopId = Number(params?.id);
    if (isNaN(workshopId)) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const body = await request.json();
    const { name, email, phone, seatsBooked, notes, paymentStatus, status } = body;

    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) {
      const resp = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return applySecurityHeaders(resp, request);
    }

    const requestedSeats = Math.max(1, parseInt(seatsBooked, 10) || 1);
    const regStatus = status || 'Confirmed';

    const newReg = await prisma.workshopRegistration.create({
      data: {
        workshop_id: workshopId,
        name,
        email,
        phone: phone || '',
        seats_booked: requestedSeats,
        notes: notes || null,
        payment_status: paymentStatus || (workshop.is_free ? 'Paid' : 'Pending'),
        status: regStatus,
      },
    });

    if (regStatus === 'Confirmed') {
      const updatedFilled = workshop.seats_filled + requestedSeats;
      const isFull = updatedFilled >= workshop.seats_total;
      await prisma.workshop.update({
        where: { id: workshopId },
        data: {
          seats_filled: updatedFilled,
          ...(isFull && workshop.status === 'published' ? { status: 'full' } : {}),
        },
      });
    }

    const resp = NextResponse.json({
      success: true,
      registration: {
        _id: String(newReg.id),
        id: String(newReg.id),
        name: newReg.name,
      },
    }, { status: 201 });
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

    const body = await request.json();
    const { registrationId, status, paymentStatus } = body;

    const regId = Number(registrationId);
    if (isNaN(regId)) {
      const resp = NextResponse.json({ message: 'Registration ID required' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const data = {};
    if (status) data.status = status;
    if (paymentStatus) data.payment_status = paymentStatus;

    const updatedReg = await prisma.workshopRegistration.update({
      where: { id: regId },
      data,
    });

    const resp = NextResponse.json({
      success: true,
      registration: {
        _id: String(updatedReg.id),
        id: String(updatedReg.id),
        status: updatedReg.status,
        paymentStatus: updatedReg.payment_status,
      },
    });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
