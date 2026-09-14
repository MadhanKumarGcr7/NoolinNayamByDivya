/**
 * Admin Contact Messages API Route (MySQL / Prisma)
 * GET /api/admin/contact-messages
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, applySecurityHeaders, handleApiError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const rawMessages = await prisma.contactMessage.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const messages = rawMessages.map(m => ({
      _id: String(m.id),
      id: String(m.id),
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      subject: m.subject,
      message: m.message,
      status: m.status,
      createdAt: m.created_at,
    }));

    const resp = NextResponse.json({ messages });
    return applySecurityHeaders(resp, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
