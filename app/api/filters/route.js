import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Filter from '@/models/Filter';
import NavigationItem from '@/models/NavigationItem';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, filters: [] });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let targetFilterIds = null;

    if (category && category !== 'all') {
      const cleanCategory = category.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const navItems = await NavigationItem.find({ linkType: 'category', visible: true }).lean();
      
      const navItem = navItems.find((item) => {
        const itemSlugClean = (item.categorySlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemLabelClean = (item.label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemSlugClean === cleanCategory || itemLabelClean === cleanCategory;
      });

      if (navItem && Array.isArray(navItem.assignedFilters) && navItem.assignedFilters.length > 0) {
        // Extract assigned filterIds preserving category order
        targetFilterIds = navItem.assignedFilters
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((af) => (af.filterId?._id || af.filterId).toString());
      }
    }

    let filters = [];

    if (targetFilterIds && targetFilterIds.length > 0) {
      const dbFilters = await Filter.find({
        _id: { $in: targetFilterIds },
        active: true,
      }).lean();

      // Sort according to targetFilterIds order
      filters = targetFilterIds
        .map((id) => dbFilters.find((f) => f._id.toString() === id))
        .filter(Boolean);
    } else {
      // Fallback: return all active filters
      filters = await Filter.find({ active: true }).sort({ order: 1 }).lean();
    }

    const formattedFilters = filters.map((f) => ({
      _id: f._id.toString(),
      name: f.name,
      slug: f.slug,
      type: f.type,
      options: f.options || [],
      rangeMin: f.rangeMin,
      rangeMax: f.rangeMax,
      rangeUnit: f.rangeUnit,
      rangeStep: f.rangeStep,
      active: f.active,
      order: f.order,
    }));

    return NextResponse.json({ success: true, filters: formattedFilters });
  } catch (error) {
    console.error('[API/Filters GET Error]:', error);
    return NextResponse.json({ success: true, filters: [] }, { status: 200 });
  }
}
