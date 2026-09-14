/**
 * Public Workshops List API Route (MySQL / Prisma)
 * GET /api/workshops
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawWorkshops = await prisma.workshop.findMany({
      where: {
        status: { in: ['published', 'full', 'completed', 'Upcoming'] },
      },
      orderBy: { created_at: 'desc' },
    });

    const workshops = rawWorkshops.map((w) => ({
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

    return NextResponse.json({ workshops });
  } catch (error) {
    console.error('[API/Workshops GET Error]:', error);
    return NextResponse.json({ workshops: [] });
  }
}
