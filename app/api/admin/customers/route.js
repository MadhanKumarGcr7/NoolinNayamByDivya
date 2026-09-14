/**
 * Admin Customers API (MySQL / Prisma)
 * GET /api/admin/customers
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
    const page   = parseInt(searchParams.get('page') || '1', 10);
    const limit  = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const where = { role: 'customer' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [rawCustomers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { orders: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const customers = rawCustomers.map((c) => ({
      _id: String(c.id),
      id: String(c.id),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      role: c.role,
      createdAt: c.created_at,
      orderCount: c.orders.length,
    }));

    const response = NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return applySecurityHeaders(response, request);

  } catch (error) {
    return handleApiError(error, request);
  }
}
