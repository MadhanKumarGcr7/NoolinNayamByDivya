import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Filter from '@/models/Filter';
import NavigationItem from '@/models/NavigationItem';
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

export async function GET(request, { params }) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const id = params?.id;
    const filter = await Filter.findById(id).lean();
    if (!filter) {
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, filter });
  } catch (error) {
    console.error('[API/Admin/Filters/[id] GET Error]:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
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

    const existing = await Filter.findById(id);
    if (!existing) {
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    const { name, type, options, rangeMin, rangeMax, rangeUnit, rangeStep, active } = body;

    const updateData = {};
    if (active !== undefined) updateData.active = Boolean(active);
    if (name !== undefined) {
      updateData.name = name.trim();
      if (name.trim().toLowerCase() !== existing.name.toLowerCase()) {
        let newSlug = slugify(name);
        let slugExists = await Filter.findOne({ slug: newSlug, _id: { $ne: id } });
        let counter = 1;
        while (slugExists) {
          newSlug = `${slugify(name)}-${counter}`;
          slugExists = await Filter.findOne({ slug: newSlug, _id: { $ne: id } });
          counter++;
        }
        updateData.slug = newSlug;
      }
    }
    if (type !== undefined) updateData.type = type;
    if (options !== undefined && Array.isArray(options)) updateData.options = options;
    if (rangeMin !== undefined) updateData.rangeMin = Number(rangeMin);
    if (rangeMax !== undefined) updateData.rangeMax = Number(rangeMax);
    if (rangeUnit !== undefined) updateData.rangeUnit = rangeUnit;
    if (rangeStep !== undefined) updateData.rangeStep = Number(rangeStep);

    const updatedFilter = await Filter.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, filter: updatedFilter });
  } catch (error) {
    console.error('[API/Admin/Filters/[id] PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error updating filter' }, { status: 500 });
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

    const filter = await Filter.findById(id);
    if (!filter) {
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    // Clean up references in NavigationItem.assignedFilters and Product.filterValues
    await NavigationItem.updateMany(
      {},
      { $pull: { assignedFilters: { filterId: id } } }
    );
    await Product.updateMany(
      {},
      { $pull: { filterValues: { filterId: id } } }
    );

    await Filter.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Filter "${filter.name}" deleted and unassigned from categories & products.`,
    });
  } catch (error) {
    console.error('[API/Admin/Filters/[id] DELETE Error]:', error);
    return NextResponse.json({ message: 'Server error deleting filter' }, { status: 500 });
  }
}
