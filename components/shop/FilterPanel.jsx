'use client';

import { useState, useEffect } from 'react';
import { seedCategories } from '@/lib/seed-data';

export default function FilterPanel({
  categories = seedCategories,
  selectedCategory = 'all',
  setSelectedCategory,
  onSelectCategory,

  // Built-in filter states
  selectedSizes = [],
  setSelectedSizes,
  onSelectSize,
  priceRange = 10000,
  setPriceRange,
  onPriceChange,

  // Generic custom filter selections: { [filterSlug]: [values] }
  customFilterSelections = {},
  onCustomFilterChange,

  resetFilters,
  onReset,
  totalResults,
}) {
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [navCategories, setNavCategories] = useState([]);

  // Fetch dynamic navigation category links from API
  useEffect(() => {
    let isMounted = true;
    async function fetchNavCategories() {
      try {
        const res = await fetch('/api/navigation');
        const data = await res.json();
        if (isMounted && data?.items) {
          const cats = data.items
            .filter((item) => item.linkType === 'category')
            .map((item) => ({
              id: item._id,
              name: item.label,
              slug: item.categorySlug || item.label.toLowerCase().replace(/\s+/g, '-'),
            }));
          if (cats.length > 0) {
            setNavCategories([{ id: 'all', name: 'All', slug: 'all' }, ...cats]);
          }
        }
      } catch (err) {
        console.error('Error fetching navigation categories for filter panel:', err);
      }
    }
    fetchNavCategories();
    return () => { isMounted = false; };
  }, []);

  // Fetch category-aware filters from API
  useEffect(() => {
    let isMounted = true;
    async function loadCategoryFilters() {
      setLoadingFilters(true);
      try {
        const url = `/api/filters?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && data?.filters) {
          setDynamicFilters(data.filters);
        }
      } catch (err) {
        console.error('Error fetching category filters:', err);
      } finally {
        if (isMounted) setLoadingFilters(false);
      }
    }
    loadCategoryFilters();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const handleCategorySelect = (slug) => {
    if (onSelectCategory) onSelectCategory(slug);
    else if (setSelectedCategory) setSelectedCategory(slug);
  };

  const toggleSize = (size) => {
    if (onSelectSize) {
      onSelectSize(size);
    } else if (setSelectedSizes) {
      setSelectedSizes((prev) =>
        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
      );
    }
  };

  const handlePriceChange = (newVal) => {
    if (onPriceChange) onPriceChange(newVal);
    else if (setPriceRange) setPriceRange(newVal);
  };

  const handleCustomToggle = (filterSlug, value, isSingleSelect = false) => {
    if (!onCustomFilterChange) return;
    const current = customFilterSelections[filterSlug] || [];
    let updated = [];
    if (isSingleSelect) {
      updated = current.includes(value) ? [] : [value];
    } else {
      updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
    }
    onCustomFilterChange(filterSlug, updated);
  };

  const handleReset = () => {
    if (onReset) onReset();
    else if (resetFilters) resetFilters();
  };

  const hasCustomActive = Object.values(customFilterSelections).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    priceRange < 10000 ||
    hasCustomActive;

  const categoryList = navCategories.length > 0 ? navCategories : (categories || seedCategories);

  // Filter out size and color from custom dynamic list if they are rendered explicitly
  const customFiltersToRender = dynamicFilters.filter(
    (f) => !['size', 'color'].includes(f.slug?.toLowerCase())
  );

  const sizeFilterDef = dynamicFilters.find((f) => f.slug?.toLowerCase() === 'size');

  const sizeOptions = sizeFilterDef?.options?.length
    ? sizeFilterDef.options.map((o) => o.label || o.value)
    : ['1Y', '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y'];

  return (
    <aside
      className="w-full flex flex-col gap-6 bg-cream/30 border border-border/80 p-6 shadow-warm-xs sticky top-28"
      aria-label="Product Filters"
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-serif font-light text-charcoal text-xl">Filters</h2>
          {totalResults !== undefined && (
            <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors font-medium underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories List */}
      <div>
        <h3 className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal mb-4">
          Category
        </h3>
        <ul className="flex flex-col gap-2.5" role="list">
          {categoryList.map((cat) => {
            const isSelected =
              (selectedCategory || 'all').toLowerCase().replace(/[^a-z0-9]/g, '') ===
              (cat.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');

            return (
              <li key={cat.id || cat.slug}>
                <button
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`text-body-sm font-sans transition-colors w-full text-left flex items-center justify-between ${
                    isSelected
                      ? 'text-warmBrown font-medium'
                      : 'text-charcoal-600 hover:text-charcoal font-light'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-warmBrown" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Size Filter (if active for this category/global) */}
      {(!dynamicFilters.length || sizeFilterDef) && (
        <div className="border-t border-border/60 pt-6">
          <h3 className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal mb-4">
            Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 text-label-md font-sans transition-all border ${
                    active
                      ? 'bg-charcoal text-ivory border-charcoal'
                      : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal-400'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Owner-Defined Category Filters (e.g. Occasion, Material, Age Group) */}
      {customFiltersToRender.map((filter) => {
        const selectedVals = customFilterSelections[filter.slug] || [];
        const isSingle = filter.type === 'single-select';

        return (
          <div key={filter._id} className="border-t border-border/60 pt-6">
            <h3 className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal mb-4">
              {filter.name}
            </h3>

            {filter.type === 'color-swatch' ? (
              <div className="flex flex-wrap gap-3">
                {filter.options?.map((opt) => {
                  const active = selectedVals.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleCustomToggle(filter.slug, opt.value, isSingle)}
                      title={opt.label}
                      aria-label={`Filter by ${filter.name} ${opt.label}`}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform ${
                        active
                          ? 'scale-110 border-charcoal ring-2 ring-warmBrown/40 ring-offset-2'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: opt.hex || '#FAF7F2' }}
                    >
                      {active && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ['#FAF7F2', '#F5EFE4', '#E8DDD0'].includes(opt.hex)
                              ? 'bg-charcoal'
                              : 'bg-ivory'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filter.options?.map((opt) => {
                  const active = selectedVals.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleCustomToggle(filter.slug, opt.value, isSingle)}
                      className={`px-3 py-1.5 text-label-md font-sans transition-all border ${
                        active
                          ? 'bg-charcoal text-ivory border-charcoal'
                          : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Max Price Range Slider */}
      <div className="border-t border-border/60 pt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal">
            Max Price
          </h3>
          <span className="text-body-sm font-sans font-medium text-charcoal">
            ₹{priceRange.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={10000}
          step={250}
          value={priceRange}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full accent-warmBrown cursor-pointer bg-cream h-2 rounded-lg"
        />
        <div className="flex justify-between text-body-xs text-charcoal-400 font-light mt-2">
          <span>₹1,000</span>
          <span>₹10,000</span>
        </div>
      </div>

      {/* Slow Craft Pledge */}
      <div className="border-t border-border/60 pt-6 mt-2">
        <div className="p-3 bg-ivory border border-border text-body-xs text-charcoal-600 font-light leading-relaxed space-y-1">
          <p className="font-medium text-charcoal uppercase tracking-[0.1em]">🌿 Slow Craft Pledge</p>
          <p>Every piece is individually handcrafted with 100% organic cotton yarn.</p>
        </div>
      </div>
    </aside>
  );
}
