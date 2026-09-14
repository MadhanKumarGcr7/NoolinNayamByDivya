/**
 * Forgot Password API — POST /api/auth/forgot-password (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Generates a reset token and stores it on the user record.
 * SECURITY: Always returns success to prevent email enumeration.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        role: 'customer',
      },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          reset_password_token: resetToken,
          reset_password_expires: resetExpires,
        },
      });

      console.log(`[Forgot Password] Reset token for ${user.email}: ${resetToken}`);
      console.log(`[Forgot Password] Reset link: /reset-password?token=${resetToken}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('[API/Auth/Forgot-Password Error]:', error);
    return NextResponse.json(
      { message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
