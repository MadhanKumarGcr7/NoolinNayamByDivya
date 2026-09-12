'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input, { Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const DEFAULT_CATEGORIES = [
  { value: 'crochet', label: 'Crochet' },
  { value: 'kidswear', label: 'Kids Dresses / Kidswear' },
  { value: 'babywear', label: 'Babywear / Rompers' },
  { value: 'custom', label: 'Custom Made' },
];

export default function AddProductPage() {
  const router = useRouter();

  // Categories state
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORIES);

  // Form State
  const [name, setName]               = useState('');
  const [slug, setSlug]               = useState('');
  const [category, setCategory]       = useState('crochet');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [material, setMaterial]       = useState('100% Soft Cotton Yarn');
  const [care, setCare]               = useState('Hand wash cold · Lay flat to dry');
  const [badge, setBadge]             = useState('');
  const [status, setStatus]           = useState('active');

  // Toggles
  const [featured, setFeatured]         = useState(false);
  const [newArrival, setNewArrival]     = useState(true);
  const [customizable, setCustomizable] = useState(false);

  // Sizes
  const [sizeInput, setSizeInput]   = useState('');
  const [sizes, setSizes]           = useState(['1Y', '2Y', '3Y']);

  // Per-variant stock grid { '1Y': { stock: 5, outOfStock: false } }
  const [variantStock, setVariantStock] = useState({
    '1Y': { stock: 5, outOfStock: false },
    '2Y': { stock: 5, outOfStock: false },
    '3Y': { stock: 5, outOfStock: false },
  });

  // Images
  const [images, setImages]           = useState([]); // Array of uploaded URLs
  const [uploading, setUploading]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);

  // Dynamic Custom Filters State
  const [activeFilters, setActiveFilters]               = useState([]);
  const [customFilterSelections, setCustomFilterSelections] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [filterRes, catRes] = await Promise.all([
          fetch('/api/admin/filters', { credentials: 'include' }),
          fetch('/api/admin/categories', { credentials: 'include' }),
        ]);
        const filterData = await filterRes.json();
        const catData = await catRes.json();

        if (filterData.filters) {
          const custom = filterData.filters.filter(
            (f) => f.active && !['size', 'color'].includes(f.slug?.toLowerCase())
          );
          setActiveFilters(custom);
        }

        if (catData.categories && catData.categories.length > 0) {
          const fetchedOpts = catData.categories.map((c) => ({
            value: c.slug,
            label: c.label,
          }));
          setCategoryOptions(fetchedOpts);
          setCategory(fetchedOpts[0].value);
        }
      } catch (err) {
        console.error('Error fetching filters/categories:', err);
      }
    }
    loadData();
  }, []);

  // Auto-slug generator
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Add Size tag
  const addSize = () => {
    if (sizeInput && !sizes.includes(sizeInput.toUpperCase())) {
      const newSizes = [...sizes, sizeInput.toUpperCase()];
      setSizes(newSizes);
      setSizeInput('');
    }
  };

  const removeSize = (s) => {
    setSizes(sizes.filter((item) => item !== s));
  };

  // Variant Matrix computed (Size based)
  const variantMatrix = useMemo(() => {
    const matrix = [];
    const sizeList = sizes.length > 0 ? sizes : ['One Size'];

    sizeList.forEach((s) => {
      const key = s;
      const existing = variantStock[key] || { stock: 5, outOfStock: false };
      matrix.push({ key, size: s, ...existing });
    });
    return matrix;
  }, [sizes, variantStock]);

  const updateVariant = (key, field, val) => {
    setVariantStock((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  const MAX_PRODUCT_IMAGES = 10;
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Image Upload Handler (Supports up to 10 photos)
  const handleImageFiles = async (files) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > MAX_PRODUCT_IMAGES) {
      setError(`Cannot upload more than ${MAX_PRODUCT_IMAGES} images per product. You currently have ${images.length} image(s).`);
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const uploadedUrls = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('files', file);

        const res = await fetch('/api/admin/products/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Image upload failed.');
        if (data.imageUrls && data.imageUrls.length > 0) {
          uploadedUrls.push(...data.imageUrls);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const moveImage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setImages(updated);
  };

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    moveImage(draggedIdx, targetIdx);
    setDraggedIdx(null);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!name || !price || !category || !description) {
      setError('Please fill in all required fields (Name, Price, Category, Description).');
      setSaving(false);
      return;
    }

    if (!images || images.length === 0) {
      setError('At least 1 product photo is required to publish.');
      setSaving(false);
      return;
    }

    try {
      // Build variants list for API
      const variantsList = variantMatrix.map((v) => ({
        size:       v.size,
        color:      v.color,
        stock:      parseInt(v.stock, 10) || 0,
        outOfStock: Boolean(v.outOfStock),
      }));

      const filterValuesPayload = Object.entries(customFilterSelections)
        .filter(([_, vals]) => Array.isArray(vals) && vals.length > 0)
        .map(([filterId, vals]) => {
          const f = activeFilters.find((x) => x._id === filterId);
          return {
            filterId,
            filterSlug: f?.slug || '',
            values: vals,
          };
        });

      const payload = {
        name,
        slug,
        category,
        subcategory,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        material,
        care,
        badge,
        status,
        featured,
        newArrival,
        customizable,
        sizes,
        colors: [],
        variants: variantsList,
        images,
        filterValues: filterValuesPayload,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product.');

      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <Link href="/admin/products" className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors font-medium">
            ← Back to Products
          </Link>
          <h2 className="font-serif font-light text-charcoal text-3xl mt-1">Add New Product</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="bg-cream border border-border p-6 lg:p-8 space-y-5">
          <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3">
            1. General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Product Name" id="prod-name" required value={name} onChange={handleNameChange} placeholder="e.g. Ivory Bloom Crochet Dress" />
            <Input label="Slug (URL Path)" id="prod-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ivory-bloom-crochet-dress" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Category" id="prod-category" required options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input label="Price (₹)" id="prod-price" type="number" step="1" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2499" />
            <Input label="Compare Price (₹) (Optional)" id="prod-compare" type="number" step="1" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="2999" />
          </div>

          <Textarea label="Description" id="prod-desc" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the handcrafted details, yarn type, design inspiration..." />
        </div>

        {/* Section 2: Media / Images */}
        <div className="bg-cream border border-border p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-serif font-light text-charcoal text-xl">
              2. Product Media (Images)
            </h3>
            <span className={`text-label-md uppercase tracking-[0.14em] font-sans font-medium ${images.length === 0 ? 'text-amber-700' : 'text-charcoal-400'}`}>
              {images.length} of {MAX_PRODUCT_IMAGES} images
            </span>
          </div>

          {/* Upload Area */}
          <div className={`bg-ivory border-2 border-dashed p-6 text-center transition-colors ${images.length >= MAX_PRODUCT_IMAGES ? 'border-border/50 opacity-60' : 'border-border hover:border-charcoal-400'}`}>
            <p className="text-label-md uppercase tracking-[0.16em] text-charcoal font-medium mb-1">
              {uploading ? 'Uploading Images...' : images.length >= MAX_PRODUCT_IMAGES ? 'Maximum Images Reached (10/10)' : 'Upload Product Photos (Multi-Select & Drag)'}
            </p>
            <p className="text-body-xs text-charcoal-400 font-light mb-4">
              Select or drag multiple images. First image in order becomes the primary cover photo across shop grid and search.
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={uploading || images.length >= MAX_PRODUCT_IMAGES}
              onChange={(e) => handleImageFiles(e.target.files)}
              className="text-body-xs font-sans text-charcoal-600 file:mr-4 file:py-2.5 file:px-5 file:border-0 file:bg-cream file:text-charcoal file:text-label-md file:uppercase file:tracking-[0.14em] hover:file:bg-oatmeal cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {/* Image Previews & Reorder Grid */}
          {images.length > 0 && (
            <div>
              <p className="text-body-xs text-charcoal-400 font-light mb-3">
                💡 Drag thumbnails or use ← → arrows to reorder. Cover photo is marked in charcoal.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((url, idx) => (
                  <div
                    key={url + idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`relative group aspect-portrait bg-ivory border transition-all cursor-grab active:cursor-grabbing ${
                      draggedIdx === idx ? 'opacity-40 border-warmBrown' : 'border-border hover:border-charcoal'
                    }`}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                    {/* Sequence Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-charcoal/80 backdrop-blur-xs text-ivory text-[9px] font-sans font-bold uppercase tracking-wider">
                      {idx === 0 ? 'Main Cover' : `#${idx + 1}`}
                    </span>

                    {/* Quick Reorder & Delete Action Controls */}
                    <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          title="Move Left"
                          className="p-2 bg-ivory text-charcoal rounded-full hover:bg-warmBrown hover:text-ivory transition-colors shadow-xs"
                        >
                          ←
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          title="Move Right"
                          className="p-2 bg-ivory text-charcoal rounded-full hover:bg-warmBrown hover:text-ivory transition-colors shadow-xs"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove Photo"
                        className="p-2 bg-ivory text-warmBrown rounded-full hover:bg-warmBrown hover:text-ivory transition-colors shadow-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Sizes & Stock Inventory */}
        <div className="bg-cream border border-border p-6 lg:p-8 space-y-6">
          <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3">
            3. Sizes & Stock Inventory
          </h3>

          {/* Sizes */}
          <div>
            <label className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal block mb-2">Sizes</label>
            <div className="flex gap-2 mb-3 max-w-sm">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="e.g. 6M, 12M, 4Y"
                className="flex-1 px-3 py-2 bg-ivory border border-border text-body-sm text-charcoal uppercase"
              />
              <button type="button" onClick={addSize} className="px-4 py-2 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em]">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-ivory border border-border text-body-xs font-sans font-medium text-charcoal flex items-center gap-2">
                  {s}
                  <button type="button" onClick={() => removeSize(s)} className="text-charcoal-400 hover:text-warmBrown">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Variant Stock Matrix Table */}
          <div>
            <label className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal block mb-2">Per-Size Stock Inventory</label>
            <div className="bg-ivory border border-border overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-cream/50">
                    <th className="px-4 py-2.5 text-label-sm uppercase tracking-[0.14em] text-charcoal-400">Variant Size</th>
                    <th className="px-4 py-2.5 text-label-sm uppercase tracking-[0.14em] text-charcoal-400 w-32">Stock Qty</th>
                    <th className="px-4 py-2.5 text-label-sm uppercase tracking-[0.14em] text-charcoal-400 text-center">Out of Stock Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {variantMatrix.map((v) => (
                    <tr key={v.key}>
                      <td className="px-4 py-2.5 text-body-xs font-sans font-medium text-charcoal">
                        {v.size}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => updateVariant(v.key, 'stock', parseInt(e.target.value, 10) || 0)}
                          className="w-24 px-2.5 py-1 bg-cream border border-border text-body-xs text-charcoal font-medium text-center focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.outOfStock}
                            onChange={(e) => updateVariant(v.key, 'outOfStock', e.target.checked)}
                            className="w-4 h-4 accent-warmBrown"
                          />
                          <span className="text-body-xs text-charcoal-600 font-light">Mark Out of Stock</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Details & Status */}
        <div className="bg-cream border border-border p-6 lg:p-8 space-y-5">
          <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3">
            4. Product Details & Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Material" id="prod-mat" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="100% Organic Cotton Yarn" />
            <Input label="Care Instructions" id="prod-care" value={care} onChange={(e) => setCare(e.target.value)} placeholder="Hand wash cold · Air dry" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Badge / Label (Optional)" id="prod-badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Made to Order, Bestseller" />
            <Select
              label="Visibility Status"
              id="prod-status"
              options={[
                { value: 'active', label: 'Active (Visible on Storefront)' },
                { value: 'draft', label: 'Draft (Owner preview only)' },
                { value: 'hidden', label: 'Hidden (Unpublished)' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          <div className="pt-2 flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-warmBrown" />
              <span className="text-body-sm font-sans font-medium text-charcoal">Featured Product</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="w-4 h-4 accent-warmBrown" />
              <span className="text-body-sm font-sans font-medium text-charcoal">New Arrival</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={customizable} onChange={(e) => setCustomizable(e.target.checked)} className="w-4 h-4 accent-warmBrown" />
              <span className="text-body-sm font-sans font-medium text-charcoal">Customizable</span>
            </label>
          </div>
        </div>

        {/* Section 5: Custom Shop Filters */}
        {activeFilters.length > 0 && (
          <div className="bg-cream border border-border p-6 lg:p-8 space-y-5">
            <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3">
              5. Custom Shop Filters
            </h3>
            <p className="text-body-xs text-charcoal-400 font-light">
              Select filter attributes configured by owner (e.g. Occasion, Age Group, Material). These allow customers to narrow down products on category pages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeFilters.map((filter) => {
                const currentVals = customFilterSelections[filter._id] || [];
                return (
                  <div key={filter._id} className="bg-ivory p-4 border border-border rounded-sm space-y-2">
                    <label className="text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal block">
                      {filter.name}
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {filter.options?.map((opt) => {
                        const checked = currentVals.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`px-3 py-1.5 text-body-xs border rounded-sm cursor-pointer transition-colors flex items-center gap-2 ${
                              checked
                                ? 'bg-warmBrown text-ivory border-warmBrown'
                                : 'bg-cream text-charcoal-600 border-border hover:border-charcoal-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...currentVals, opt.value]
                                  : currentVals.filter((v) => v !== opt.value);
                                setCustomFilterSelections({
                                  ...customFilterSelections,
                                  [filter._id]: updated,
                                });
                              }}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-blush-light text-warmBrown p-4 border border-blush text-body-sm font-sans">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Button type="submit" variant="primary" size="lg" loading={saving} arrow>
            SAVE & PUBLISH PRODUCT
          </Button>
          <Link href="/admin/products" className="px-6 py-4 border border-border text-charcoal-600 text-label-md uppercase tracking-[0.14em] font-medium hover:text-charcoal">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
