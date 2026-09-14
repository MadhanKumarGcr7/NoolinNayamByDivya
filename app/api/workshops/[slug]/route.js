/**
 * Public Single Workshop Detail API Route (MySQL / Prisma)
 * GET /api/workshops/[slug]
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const slug = params?.slug;

    const w = await prisma.workshop.findFirst({
      where: {
        slug,
        status: { in: ['published', 'full', 'completed', 'Upcoming'] },
      },
    });

    if (!w) {
      return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
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

    return NextResponse.json({ workshop });
  } catch (error) {
    console.error('[API/Workshops/[slug] GET Error]:', error);
    return NextResponse.json({ message: 'Error fetching workshop detail' }, { status: 500 });
  }
}
