import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductCategory from '@/models/ProductCategory';
import NavigationItem from '@/models/NavigationItem';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const [dbCategories, navItems] = await Promise.all([
      ProductCategory.find({}).sort({ label: 1 }).lean(),
      NavigationItem.find({ linkType: 'category' }).lean(),
    ]);

    const categoriesMap = new Map();

    // Default categories
    [
      { slug: 'crochet', label: 'Crochet' },
      { slug: 'kidswear', label: 'Kids Dresses / Kidswear' },
      { slug: 'babywear', label: 'Babywear / Rompers' },
      { slug: 'custom', label: 'Custom Made' },
    ].forEach((c) => categoriesMap.set(c.slug, c));

    // Nav items
    (navItems || []).forEach((n) => {
      if (n.categorySlug) {
        categoriesMap.set(n.categorySlug, { slug: n.categorySlug, label: n.label });
      }
    });

    // DB categories
    (dbCategories || []).forEach((c) => {
      categoriesMap.set(c.slug, { slug: c.slug, label: c.label });
    });

    const categories = Array.from(categoriesMap.values());
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
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ message: 'Category slug is required' }, { status: 400 });
    }

    await ProductCategory.deleteOne({ slug: slug.toLowerCase() });

    return NextResponse.json({
      success: true,
      message: `Product category "${slug}" deleted. Note: Products with this category remain in database.`,
    });
  } catch (error) {
    console.error('[API/Admin/Categories DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting category' }, { status: 500 });
  }
}
