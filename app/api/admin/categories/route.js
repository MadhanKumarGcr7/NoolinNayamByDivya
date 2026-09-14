/**
 * Admin Categories API (MySQL / Prisma)
 * GET & DELETE /api/admin/categories
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbCategories = await prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    });

    const categories = dbCategories.map(c => ({
      _id: String(c.id),
      id: String(c.id),
      slug: c.slug,
      label: c.name,
      name: c.name,
    }));

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('[API/Admin/Categories GET Error]:', error);
    return NextResponse.json({ message: 'Server error fetching categories' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ message: 'Category slug is required' }, { status: 400 });
    }

    await prisma.productCategory.deleteMany({
      where: { slug: slug.toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      message: `Product category "${slug}" deleted.`,
    });
  } catch (error) {
    console.error('[API/Admin/Categories DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting category' }, { status: 500 });
  }
}
