/**
 * Update Profile API — PUT /api/auth/update-profile (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: requires valid customer JWT.
 * Updates name, phone, and addresses.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const auth = getAuthFromRequest(request, 'customer');
    if (!auth) {
      return NextResponse.json(
        { message: 'Please log in to update your profile.' },
        { status: 401 }
      );
    }

    const userId = Number(auth.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user session.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, addresses } = body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (phone !== undefined) data.phone = phone.trim();

    if (Object.keys(data).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data,
      });
    }

    if (Array.isArray(addresses)) {
      await prisma.address.deleteMany({ where: { user_id: userId } });
      for (const addr of addresses) {
        await prisma.address.create({
          data: {
            user_id: userId,
            line1: addr.street || addr.line1 || 'Address Line 1',
            line2: addr.line2 || null,
            city: addr.city || 'City',
            state: addr.state || 'State',
            pincode: addr.pincode || '000000',
            country: addr.country || 'India',
            is_default: !!addr.isDefault || !!addr.is_default,
          },
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        addresses: user.addresses,
      },
    });

  } catch (error) {
    console.error('[API/Auth/Update-Profile Error]:', error);
    return NextResponse.json(
      { message: 'Server error updating profile.' },
      { status: 500 }
    );
  }
}
