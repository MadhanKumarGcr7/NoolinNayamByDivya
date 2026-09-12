/**
 * Update Profile API
 * PUT /api/auth/update-profile
 * ────────────────────────────────────────────────────────────────────────────
 * Protected: requires valid customer JWT.
 * Updates name, phone, and addresses. Email changes are not allowed here.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────
    const auth = getAuthFromRequest(request, 'customer');
    if (!auth) {
      return NextResponse.json(
        { message: 'Please log in to update your profile.' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, phone, addresses } = body;

    // Build update object — only include fields that were provided
    const update = {};
    if (name !== undefined)      update.name = name.trim();
    if (phone !== undefined)     update.phone = phone.trim();
    if (addresses !== undefined) update.addresses = addresses;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: 'No fields to update.' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        addresses: user.addresses,
        wishlist:  user.wishlist,
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
