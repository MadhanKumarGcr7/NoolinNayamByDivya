import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavigationItem from '@/models/NavigationItem';

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
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, items: FALLBACK_NAV });
    }

    const items = await NavigationItem.find({ visible: true }).sort({ order: 1 }).lean();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, items: FALLBACK_NAV });
    }

    const formattedItems = items.map((item) => {
      let href = '/';
      if (item.linkType === 'category') {
        href = `/shop?category=${encodeURIComponent(item.categorySlug || '')}`;
      } else if (item.linkType === 'page') {
        href = item.pageSlug || '/';
      } else if (item.linkType === 'external') {
        href = item.externalUrl || '#';
      }

      return {
        _id: item._id.toString(),
        label: item.label,
        href,
        linkType: item.linkType,
        categorySlug: item.categorySlug,
        pageSlug: item.pageSlug,
        externalUrl: item.externalUrl,
        isFixed: item.isFixed || false,
        order: item.order,
      };
    });

    return NextResponse.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error('[API/Navigation GET]:', error);
    return NextResponse.json({ success: true, items: FALLBACK_NAV }, { status: 200 });
  }
}
