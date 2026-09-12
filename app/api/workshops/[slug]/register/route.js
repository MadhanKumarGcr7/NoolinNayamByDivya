/**
 * Public Workshop Registration API Route
 * POST /api/workshops/[slug]/register
 * ────────────────────────────────────────────────────────────────────────────
 * Validates capacity, creates WorkshopRegistration document (or flags as waitlisted if full),
 * increments seatsFilled, and auto-flips status to 'full' when capacity is reached.
 * Accepts either Workshop _id or slug as parameter.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import WorkshopRegistration from '@/models/WorkshopRegistration';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const identifier = params?.slug;
    const body = await request.json();

    const { name, email, phone, seatsBooked, notes } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const workshop = await Workshop.findOne({
      $or: [
        ...(isObjectId ? [{ _id: identifier }] : []),
        { slug: identifier },
      ],
    });

    if (!workshop || ['draft', 'cancelled'].includes(workshop.status)) {
      return NextResponse.json({ message: 'Workshop is not available for registration.' }, { status: 404 });
    }

    const requestedSeats = Math.max(1, parseInt(seatsBooked, 10) || 1);
    const availableSeats = workshop.seatsTotal - workshop.seatsFilled;

    let registrationStatus = 'confirmed';
    let isWaitlist = false;

    // Check capacity: if requested seats exceed available, flag as waitlist
    if (availableSeats <= 0 || requestedSeats > availableSeats || workshop.status === 'full') {
      registrationStatus = 'waitlisted';
      isWaitlist = true;
    }

    const registration = await WorkshopRegistration.create({
      workshopId: workshop._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      seatsBooked: requestedSeats,
      notes: notes || '',
      paymentStatus: workshop.isFree ? 'waived' : 'pending',
      status: registrationStatus,
    });

    // If confirmed, update seatsFilled and check if full
    if (registrationStatus === 'confirmed') {
      const newFilled = workshop.seatsFilled + requestedSeats;
      const shouldBeFull = newFilled >= workshop.seatsTotal;
      
      await Workshop.findByIdAndUpdate(workshop._id, {
        $set: {
          seatsFilled: newFilled,
          ...(shouldBeFull ? { status: 'full' } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      waitlisted: isWaitlist,
      registration,
      message: isWaitlist
        ? 'This workshop is currently full. You have been added to the priority waitlist!'
        : 'Your spot has been successfully reserved! We will send workshop details to your email.',
    }, { status: 201 });

  } catch (error) {
    console.error('[API/Workshops/[slug]/Register Error]:', error);
    return NextResponse.json({ message: 'Error processing registration.' }, { status: 500 });
  }
}
