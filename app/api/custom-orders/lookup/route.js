/**
 * Public/Customer Custom Orders Lookup API
 * POST /api/custom-orders/lookup
 * ────────────────────────────────────────────────────────────────────────────
 * Returns live custom order statuses, owner feedback notes, and quoted prices.
 * Accepts { ids: string[], email?: string } to support guest & logged-in users.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import { applySecurityHeaders, handleApiError } from '@/lib/security';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ids = [], email = '' } = body;

    const validObjectIds = (Array.isArray(ids) ? ids : [])
      .filter((id) => id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (validObjectIds.length === 0 && !cleanEmail) {
      const resp = NextResponse.json({ requests: [] });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();

    const query = {
      $or: [
        ...(validObjectIds.length > 0 ? [{ _id: { $in: validObjectIds } }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
      ],
    };

    const requests = await CustomOrderRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const resp = NextResponse.json({ requests });
    return applySecurityHeaders(resp, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
