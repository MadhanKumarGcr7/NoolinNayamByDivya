/**
 * Reset Password API — POST /api/auth/reset-password (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Validates reset token, hashes new password, updates user record.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Reset token is required.' },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        reset_password_token: token,
        reset_password_expires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token. Please request a new reset link.' },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('[API/Auth/Reset-Password Error]:', error);
    return NextResponse.json(
      { message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
