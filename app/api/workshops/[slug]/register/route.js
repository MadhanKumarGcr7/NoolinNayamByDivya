/**
 * Public Workshop Registration API Route (MySQL / Prisma)
 * POST /api/workshops/[slug]/register
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const identifier = params?.slug;
    const body = await request.json();

    const { name, email, phone, seatsBooked, notes } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    const numId = Number(identifier);
    const workshop = await prisma.workshop.findFirst({
      where: {
        OR: [
          ...(isNaN(numId) ? [] : [{ id: numId }]),
          { slug: identifier },
        ],
      },
    });

    if (!workshop || ['draft', 'cancelled'].includes(workshop.status)) {
      return NextResponse.json({ message: 'Workshop is not available for registration.' }, { status: 404 });
    }

    const requestedSeats = Math.max(1, parseInt(seatsBooked, 10) || 1);
    const availableSeats = workshop.seats_total - workshop.seats_filled;

    let registrationStatus = 'Confirmed';
    let isWaitlist = false;

    if (availableSeats <= 0 || requestedSeats > availableSeats || workshop.status === 'full') {
      registrationStatus = 'Waitlisted';
      isWaitlist = true;
    }

    const registration = await prisma.workshopRegistration.create({
      data: {
        workshop_id: workshop.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        seats_booked: requestedSeats,
        notes: notes || null,
        payment_status: workshop.is_free ? 'Paid' : 'Pending',
        status: registrationStatus,
      },
    });

    if (registrationStatus === 'Confirmed') {
      const newFilled = workshop.seats_filled + requestedSeats;
      const shouldBeFull = newFilled >= workshop.seats_total;

      await prisma.workshop.update({
        where: { id: workshop.id },
        data: {
          seats_filled: newFilled,
          ...(shouldBeFull ? { status: 'full' } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      waitlisted: isWaitlist,
      registration: {
        _id: String(registration.id),
        id: String(registration.id),
        name: registration.name,
        email: registration.email,
        seatsBooked: registration.seats_booked,
        status: registration.status,
      },
      message: isWaitlist
        ? 'This workshop is currently full. You have been added to the priority waitlist!'
        : 'Your spot has been successfully reserved! We will send workshop details to your email.',
    }, { status: 201 });

  } catch (error) {
    console.error('[API/Workshops/[slug]/Register Error]:', error);
    return NextResponse.json({ message: 'Error processing registration.' }, { status: 500 });
  }
}
