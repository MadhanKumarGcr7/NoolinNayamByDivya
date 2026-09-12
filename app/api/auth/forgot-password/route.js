/**
 * Forgot Password API
 * POST /api/auth/forgot-password
 * ────────────────────────────────────────────────────────────────────────────
 * Generates a reset token and stores it on the user document.
 *
 * TODO: Integrate email provider (Nodemailer/SendGrid) to send the
 * reset link. Currently logs to console for development.
 *
 * SECURITY: Always returns success to prevent email enumeration.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';

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

    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: 'customer',
    });

    if (user) {
      // Generate reset token (64 random hex chars)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // ──────────────────────────────────────────────────────────────────
      // TODO: Send email with reset link
      // The reset link would be: ${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}
      //
      // Example with Nodemailer:
      //   const transporter = nodemailer.createTransport({ ... });
      //   await transporter.sendMail({
      //     to: user.email,
      //     subject: 'Reset your password — Noolinnayam by Divya',
      //     html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      //   });
      // ──────────────────────────────────────────────────────────────────

      console.log(`[Forgot Password] Reset token for ${user.email}: ${resetToken}`);
      console.log(`[Forgot Password] Reset link: /reset-password?token=${resetToken}`);
    }

    // Always return success (prevent email enumeration)
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
