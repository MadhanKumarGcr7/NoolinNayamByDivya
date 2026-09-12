import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Filter from '@/models/Filter';
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

export async function GET(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const filters = await Filter.find({}).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, filters });
  } catch (error) {
    console.error('[API/Admin/Filters GET Error]:', error);
    return NextResponse.json({ message: 'Server error fetching filters' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { name, type, options, rangeMin, rangeMax, rangeUnit, rangeStep, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Filter name is required' }, { status: 400 });
    }

    let slug = slugify(name);
    let existing = await Filter.findOne({ slug });
    let counter = 1;
    while (existing) {
      slug = `${slugify(name)}-${counter}`;
      existing = await Filter.findOne({ slug });
      counter++;
    }

    const lastFilter = await Filter.findOne({}).sort({ order: -1 }).lean();
    const nextOrder = lastFilter ? lastFilter.order + 1 : 0;

    const newFilter = await Filter.create({
      name: name.trim(),
      slug,
      type: type || 'multi-select',
      options: Array.isArray(options) ? options : [],
      rangeMin: rangeMin !== undefined ? Number(rangeMin) : 0,
      rangeMax: rangeMax !== undefined ? Number(rangeMax) : 10000,
      rangeUnit: rangeUnit || '₹',
      rangeStep: rangeStep !== undefined ? Number(rangeStep) : 100,
      active: active !== undefined ? Boolean(active) : true,
      order: nextOrder,
    });

    return NextResponse.json({ success: true, filter: newFilter }, { status: 201 });
  } catch (error) {
    console.error('[API/Admin/Filters POST Error]:', error);
    return NextResponse.json({ message: 'Server error creating filter' }, { status: 500 });
  }
}
