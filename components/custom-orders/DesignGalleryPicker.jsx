'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DesignGalleryPicker({ selectedItems, onChange }) {
  const [categories, setCategories]   = useState([]);
  const [images, setImages]           = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch('/api/design-gallery');
        const data = await res.json();
        if (data.success && data.images && data.images.length > 0) {
          setImages(data.images);
          setCategories(data.categories || []);
          if (data.categories && data.categories.length > 0) {
            setActiveCategory('All');
          }
        }
      } catch (err) {
        console.error('Error fetching design gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-ivory/50 border border-border text-center">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-body-xs text-charcoal-400 font-light">Loading design inspiration gallery...</p>
      </div>
    );
  }

  // Graceful empty state: hide section if no active images exist
  if (!images || images.length === 0) {
    return null;
  }

  // Filter images by selected category tab
  const displayedImages = activeCategory && activeCategory !== 'All'
    ? images.filter((img) => img.category === activeCategory)
    : images;

  // Check if image is selected
  const isSelected = (imgId) => selectedItems.some((item) => item.id === imgId);

  // Toggle selection
  const toggleSelect = (img) => {
    if (isSelected(img._id)) {
      onChange(selectedItems.filter((item) => item.id !== img._id));
    } else {
      onChange([
        ...selectedItems,
        {
          id: img._id,
          imageUrl: img.imageUrl,
          caption: img.caption || '',
          category: img.category || '',
          note: '',
        },
      ]);
    }
  };

  // Update note for a selected image
  const updateNote = (imgId, noteText) => {
    onChange(
      selectedItems.map((item) =>
        item.id === imgId ? { ...item, note: noteText } : item
      )
    );
  };

  return (
    <div className="space-y-6 bg-cream/70 border border-border p-6 sm:p-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-warmBrown" />
          <h3 className="font-serif font-light text-charcoal text-2xl">
            Pick & Combine What Inspires You
          </h3>
        </div>
        <p className="text-body-sm text-charcoal-600 font-light">
          Browse our design gallery and choose the details you love — select necklines, sleeves, motifs, or colors and we&apos;ll combine them into your bespoke creation.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-all border whitespace-nowrap ${
            activeCategory === 'All'
              ? 'bg-charcoal text-ivory border-charcoal shadow-sm'
              : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal'
          }`}
        >
          All Details ({images.length})
        </button>
        {categories.map((cat) => {
          const count = images.filter((img) => img.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-all border whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-charcoal text-ivory border-charcoal shadow-sm'
                  : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Inspiration Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayedImages.map((img) => {
          const selected = isSelected(img._id);
          const selectedItem = selectedItems.find((item) => item.id === img._id);

          return (
            <div
              key={img._id}
              onClick={() => toggleSelect(img)}
              className={`group cursor-pointer bg-ivory border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                selected
                  ? 'border-warmBrown ring-2 ring-warmBrown/30 shadow-warm-md bg-cream/40'
                  : 'border-border hover:border-charcoal/40 hover:shadow-warm-xs'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full bg-cream overflow-hidden">
                <Image
                  src={img.imageUrl}
                  alt={img.caption || 'Design Inspiration'}
                  fill
                  className={`object-cover transition-transform duration-500 ${
                    selected ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                />

                {/* Category Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-ivory/90 backdrop-blur-sm text-charcoal text-[9px] uppercase tracking-[0.14em] font-sans font-medium border border-border shadow-xs">
                  {img.category}
                </span>

                {/* Selected Checkmark Overlay */}
                {selected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warmBrown text-ivory flex items-center justify-center shadow-md animate-scale-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Caption & Per-Image Note */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-body-xs font-sans font-medium text-charcoal line-clamp-1">
                    {img.caption || 'Design Detail'}
                  </p>
                  {img.tags && img.tags.length > 0 && (
                    <p className="text-[10px] text-charcoal-400 font-light mt-0.5 truncate">
                      {img.tags.map((t) => `#${t}`).join(' ')}
                    </p>
                  )}
                </div>

                {/* Inline Note Input when Selected */}
                {selected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pt-2 border-t border-warmBrown/20 animate-fade-in"
                  >
                    <input
                      type="text"
                      placeholder="Add a note (e.g. 'shorter length')..."
                      value={selectedItem?.note || ''}
                      onChange={(e) => updateNote(img._id, e.target.value)}
                      className="w-full px-2 py-1 bg-ivory border border-border text-[11px] font-sans text-charcoal focus:outline-none focus:border-warmBrown placeholder:text-charcoal-300"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Running Selection Summary Strip */}
      {selectedItems.length > 0 && (
        <div className="pt-4 border-t border-border bg-cream p-4 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-label-md uppercase tracking-[0.14em] font-sans font-medium text-warmBrown">
              Your Custom Combination ({selectedItems.length} selected)
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-body-xs text-charcoal-400 hover:text-charcoal underline font-light"
            >
              Clear all
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 relative group bg-ivory border border-border p-2 pr-7 flex items-center gap-2.5 shadow-warm-xs"
              >
                <div className="relative w-10 h-10 bg-cream overflow-hidden border border-border/50">
                  <Image src={item.imageUrl} alt={item.caption || 'Thumbnail'} fill className="object-cover" />
                </div>
                <div className="text-left max-w-[120px]">
                  <p className="text-[11px] font-sans font-medium text-charcoal truncate">
                    {item.caption || item.category}
                  </p>
                  {item.note && (
                    <p className="text-[10px] text-warmBrown font-light italic truncate">
                      &quot;{item.note}&quot;
                    </p>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onChange(selectedItems.filter((i) => i.id !== item.id))}
                  className="absolute top-1 right-1 text-charcoal-400 hover:text-charcoal text-xs p-1"
                  title="Remove detail"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
