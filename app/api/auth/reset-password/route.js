/**
 * Reset Password API
 * POST /api/auth/reset-password
 * ────────────────────────────────────────────────────────────────────────────
 * Validates reset token, hashes new password, updates user document.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // ── Validation ──────────────────────────────────────────────────────
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

    await connectDB();

    // ── Find user with valid, non-expired token ─────────────────────────
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token. Please request a new reset link.' },
        { status: 400 }
      );
    }

    // ── Update password ─────────────────────────────────────────────────
    user.passwordHash = await hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

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
