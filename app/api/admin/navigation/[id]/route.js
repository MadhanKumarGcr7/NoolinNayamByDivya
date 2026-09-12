import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NavigationItem from '@/models/NavigationItem';
import ProductCategory from '@/models/ProductCategory';
import Filter from '@/models/Filter';
import Product from '@/models/Product';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function PATCH(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const id = params?.id;
    const body = await request.json();

    const existing = await NavigationItem.findById(id);
    if (!existing) {
      return NextResponse.json({ message: 'Navigation item not found' }, { status: 404 });
    }

    const { label, linkType, categorySlug, pageSlug, externalUrl, visible, assignedFilters } = body;

    const updateData = {};

    if (visible !== undefined) updateData.visible = Boolean(visible);
    if (assignedFilters !== undefined && Array.isArray(assignedFilters)) {
      updateData.assignedFilters = assignedFilters.map((af, idx) => ({
        filterId: af.filterId || af._id || af,
        order: af.order !== undefined ? Number(af.order) : idx,
      }));
    }

    if (!existing.isFixed) {
      if (label !== undefined) updateData.label = label.trim();
      if (linkType !== undefined) updateData.linkType = linkType;

      const type = linkType !== undefined ? linkType : existing.linkType;

      if (type === 'category') {
        const catSlug = slugify(categorySlug || label || existing.categorySlug);
        updateData.categorySlug = catSlug;
        updateData.pageSlug = '';
        updateData.externalUrl = '';

        // Auto-upsert into ProductCategory schema
        await ProductCategory.updateOne(
          { slug: catSlug },
          { $setOnInsert: { slug: catSlug, label: (label || existing.label).trim(), order: existing.order } },
          { upsert: true }
        );
      } else if (type === 'page') {
        updateData.pageSlug = pageSlug !== undefined ? pageSlug : existing.pageSlug;
        updateData.categorySlug = '';
        updateData.externalUrl = '';
      } else if (type === 'external') {
        updateData.externalUrl = externalUrl !== undefined ? externalUrl : existing.externalUrl;
        updateData.categorySlug = '';
        updateData.pageSlug = '';
      }
    }

    const updated = await NavigationItem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('[API/Admin/Navigation/[id] PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error updating nav item' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const id = params?.id;

    const existing = await NavigationItem.findById(id);
    if (!existing) {
      return NextResponse.json({ message: 'Navigation item not found' }, { status: 404 });
    }

    if (existing.isFixed) {
      return NextResponse.json({ message: 'Fixed items (e.g. Home) cannot be deleted.' }, { status: 400 });
    }

    // 1. Gather filters assigned to THIS navigation item
    const assignedFilterIds = (existing.assignedFilters || [])
      .map((af) => (af.filterId?._id || af.filterId)?.toString())
      .filter(Boolean);

    // 2. Delete the navigation item
    await NavigationItem.findByIdAndDelete(id);

    // 3. Find and delete custom filters that were assigned to this navigation item and are NO LONGER assigned to any remaining navigation item
    let deletedFilterCount = 0;
    if (assignedFilterIds.length > 0) {
      const remainingNavItems = await NavigationItem.find({}).lean();
      const stillAssignedSet = new Set();

      remainingNavItems.forEach((nav) => {
        (nav.assignedFilters || []).forEach((af) => {
          const fid = (af.filterId?._id || af.filterId)?.toString();
          if (fid) stillAssignedSet.add(fid);
        });
      });

      const orphanFilterIds = assignedFilterIds.filter((fid) => !stillAssignedSet.has(fid));

      if (orphanFilterIds.length > 0) {
        // Delete orphan filters from Filter collection
        const delRes = await Filter.deleteMany({ _id: { $in: orphanFilterIds } });
        deletedFilterCount = delRes.deletedCount || orphanFilterIds.length;

        // Pull deleted filter references from products
        await Product.updateMany(
          {},
          { $pull: { filterValues: { filterId: { $in: orphanFilterIds } } } }
        );
      }
    }

    // 4. Delete corresponding ProductCategory if applicable
    if (existing.linkType === 'category' && existing.categorySlug) {
      await ProductCategory.deleteOne({ slug: existing.categorySlug.toLowerCase() });
    }

    return NextResponse.json({
      success: true,
      message: `Navigation item removed.${deletedFilterCount > 0 ? ` Cleaned up ${deletedFilterCount} assigned custom filter(s).` : ''}`,
      categorySlug: existing.linkType === 'category' ? existing.categorySlug : null,
    });
  } catch (error) {
    console.error('[API/Admin/Navigation/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting nav item' }, { status: 500 });
  }
}
