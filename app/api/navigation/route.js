/**
 * Public Navigation API Route (MySQL / Prisma)
 * GET /api/navigation
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const FALLBACK_NAV = [
  { _id: 'home', label: 'Home', href: '/', linkType: 'page', isFixed: true },
  { _id: 'shop', label: 'Shop', href: '/shop', linkType: 'page' },
  { _id: 'crochet', label: 'Crochet', href: '/shop?category=crochet', linkType: 'category', categorySlug: 'crochet' },
  { _id: 'kidswear', label: 'Kidswear', href: '/shop?category=kidswear', linkType: 'category', categorySlug: 'kidswear' },
  { _id: 'custom-orders', label: 'Custom Orders', href: '/custom-orders', linkType: 'page' },
  { _id: 'workshops', label: 'Workshops', href: '/workshops', linkType: 'page' },
  { _id: 'our-story', label: 'Our Story', href: '/our-story', linkType: 'page' },
  { _id: 'contact', label: 'Contact', href: '/contact', linkType: 'page' },
];

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      where: { visible: true },
      include: { category: true },
      orderBy: { display_order: 'asc' },
    });

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, items: FALLBACK_NAV });
    }

    const formattedItems = items.map((item) => {
      let href = '/';
      let categorySlug = item.category?.slug || '';
      if (item.link_type === 'category') {
        href = `/shop?category=${encodeURIComponent(categorySlug)}`;
      } else if (item.link_type === 'page') {
        href = item.page_slug || '/';
      } else if (item.link_type === 'external') {
        href = item.external_url || '#';
      }

      return {
        _id: String(item.id),
        id: String(item.id),
        label: item.label,
        href,
        linkType: item.link_type,
        categorySlug,
        pageSlug: item.page_slug,
        externalUrl: item.external_url,
        order: item.display_order,
      };
    });

    return NextResponse.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error('[API/Navigation GET]:', error);
    return NextResponse.json({ success: true, items: FALLBACK_NAV }, { status: 200 });
  }
}
