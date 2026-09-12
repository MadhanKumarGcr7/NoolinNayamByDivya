'use client';

import { useState, useRef } from 'react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

export default function ProductGallery({ images = [], name = '' }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Normalize images array to list of URL strings
  const imageList = Array.isArray(images) && images.length > 0
    ? images
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter((url) => typeof url === 'string' && url.trim() !== '')
    : [];

  const totalImages = imageList.length;

  // Touch swipe handling for mobile horizontal carousel
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40; // minimum pixels to trigger swipe

    if (diffX > swipeThreshold) {
      // Swiped left -> next image
      setSelectedIdx((prev) => (prev < totalImages - 1 ? prev + 1 : prev));
    } else if (diffX < -swipeThreshold) {
      // Swiped right -> previous image
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : prev));
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const prevImage = () => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const nextImage = () => {
    setSelectedIdx((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  if (totalImages === 0) {
    return (
      <div className="w-full aspect-portrait bg-cream relative overflow-hidden">
        <PlaceholderImage label={name || 'Handcrafted Product'} aspect="3/4" className="w-full h-full" />
      </div>
    );
  }

  const currentImage = imageList[selectedIdx] || imageList[0];

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        {/* Thumbnail Rail (Desktop left column / Mobile bottom row - Supports up to 10 photos) */}
        {totalImages > 1 && (
          <div
            className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[640px] py-1 px-0.5 custom-scrollbar"
            role="tablist"
            aria-label="Product thumbnails"
          >
            {imageList.map((imgUrl, idx) => {
              const active = selectedIdx === idx;
              return (
                <button
                  key={imgUrl + idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border transition-all duration-300 overflow-hidden ${
                    active
                      ? 'border-charcoal ring-1 ring-charcoal shadow-warm-xs'
                      : 'border-border/80 opacity-70 hover:opacity-100 hover:border-charcoal-400'
                  }`}
                  aria-label={`View image ${idx + 1} of ${totalImages}`}
                  aria-selected={active}
                  role="tab"
                >
                  <img
                    src={imgUrl}
                    alt={`${name} thumbnail ${idx + 1}`}
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover"
                  />
                  {active && (
                    <span className="absolute inset-0 bg-charcoal/5 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Display Container */}
        <div
          className="flex-1 relative aspect-portrait bg-cream overflow-hidden group select-none cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsZoomOpen(true)}
        >
          {/* Main Image with Smooth Fade Transition */}
          <img
            key={currentImage}
            src={currentImage}
            alt={`${name} photo ${selectedIdx + 1}`}
            loading={selectedIdx < 2 ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
          />

          {/* Desktop Left/Right Scroll Arrows (Appears on Hover) */}
          {totalImages > 1 && (
            <div className="hidden lg:flex pointer-events-none absolute inset-0 items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="pointer-events-auto p-3 rounded-full bg-ivory/90 backdrop-blur-md text-charcoal shadow-warm-sm hover:bg-charcoal hover:text-ivory transition-colors"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="pointer-events-auto p-3 rounded-full bg-ivory/90 backdrop-blur-md text-charcoal shadow-warm-sm hover:bg-charcoal hover:text-ivory transition-colors"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}

          {/* Zoom Hint Icon */}
          <div className="absolute top-4 right-4 p-2 bg-ivory/80 backdrop-blur-md text-charcoal rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
          </div>

          {/* Mobile Dot Carousel Indicators */}
          {totalImages > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden bg-charcoal/30 backdrop-blur-md px-3 py-1.5 rounded-full">
              {imageList.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedIdx === idx ? 'w-5 bg-ivory' : 'w-1.5 bg-ivory/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 text-ivory/80 hover:text-ivory text-xl font-sans tracking-widest flex items-center gap-1"
            >
              <span className="text-xs uppercase tracking-wider">Close</span> ✕
            </button>

            {/* Lightbox Image */}
            <img
              src={currentImage}
              alt={`${name} zoom preview ${selectedIdx + 1}`}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-xs"
            />

            {/* Lightbox Prev / Next */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-ivory/20 text-ivory hover:bg-ivory hover:text-charcoal transition-colors"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-ivory/20 text-ivory hover:bg-ivory hover:text-charcoal transition-colors"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-body-xs font-sans text-ivory/80 bg-charcoal/60 px-3 py-1 rounded-full">
              {selectedIdx + 1} of {totalImages}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
