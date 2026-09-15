'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const SIZE_CHARTS = [
  {
    id: 'frock',
    title: 'Frock',
    subtitle: 'Dresses & Frocks',
    image: '/assets/size-guide/frock-size-chart.jpg',
    description: 'Bust front alone and dress length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'short-top',
    title: 'Short Top',
    subtitle: 'Crochet Tops & Blouses',
    image: '/assets/size-guide/short-top-size-chart.jpg',
    description: 'Bust front alone and garment length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'full-skirt',
    title: 'Full Skirt',
    subtitle: 'Full Length Twirl Skirts',
    image: '/assets/size-guide/full-skirt-size-chart.jpg',
    description: 'Waist and full floor/ankle length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'half-skirt',
    title: 'Half Skirt',
    subtitle: 'Knee & Mid-Length Skirts',
    image: '/assets/size-guide/half-skirt-size-chart.jpg',
    description: 'Waist and mid-length skirt measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'pants',
    title: 'Pants',
    subtitle: 'Trousers & Comfort Pants',
    image: '/assets/size-guide/pant-size-chart.jpg',
    description: 'Waist and outseam length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'shorts',
    title: 'Shorts',
    subtitle: 'Casual Shorts',
    image: '/assets/size-guide/shorts-size-chart.jpg',
    description: 'Waist and side length measurements in inches for ages 1 to 15 years.',
  },
];

export default function SizeGuideModal({ isOpen, onClose, initialChartId = 'short-top' }) {
  const [activeChartId, setActiveChartId] = useState(initialChartId);
  const [zoomImage, setZoomImage] = useState(null);

  if (!isOpen) return null;

  const currentChart = SIZE_CHARTS.find((c) => c.id === activeChartId) || SIZE_CHARTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-ivory rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 border border-warmBrown/20">
        
        {/* Header Banner */}
        <div className="section-highlight-copper px-6 py-5 flex items-center justify-between text-charcoal shadow-sm">
          <div>
            <span className="text-label-sm uppercase tracking-[0.2em] text-warmBrown-700 font-semibold block mb-0.5">
              Noolin Nayam by Divya
            </span>
            <h2 className="font-serif text-heading-md font-semibold text-charcoal">
              Size & Fit Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-ivory/80 hover:bg-ivory text-charcoal flex items-center justify-center transition-all shadow-sm hover:scale-105"
            aria-label="Close size guide modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-oatmeal/60 border-b border-border px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {SIZE_CHARTS.map((chart) => {
            const isActive = chart.id === activeChartId;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChartId(chart.id)}
                className={`px-4 py-2 text-label-md rounded-full font-sans transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-charcoal text-ivory border-charcoal shadow-sm'
                    : 'bg-ivory/80 text-charcoal border-border hover:border-warmBrown hover:bg-ivory'
                }`}
              >
                {chart.title}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Active Chart Image */}
          <div className="w-full md:w-3/5 bg-white rounded-xl p-3 border border-border shadow-inner relative group cursor-zoom-in flex items-center justify-center"
               onClick={() => setZoomImage(currentChart.image)}>
            <div className="relative w-full aspect-[2/3] max-h-[500px] overflow-hidden rounded-lg">
              <Image
                src={currentChart.image}
                alt={`${currentChart.title} Size Chart - Noolin Nayam by Divya`}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
            </div>
            <div className="absolute bottom-4 right-4 bg-charcoal/80 text-ivory text-xs px-3 py-1.5 rounded-full backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              <span>🔍 Tap to expand</span>
            </div>
          </div>

          {/* Details & Measurement Instructions */}
          <div className="w-full md:w-2/5 flex flex-col justify-between h-full gap-6">
            <div>
              <h3 className="font-serif text-heading-sm font-semibold text-charcoal mb-1">
                {currentChart.title} Size Chart
              </h3>
              <p className="text-body-sm text-charcoal-600 mb-4">
                {currentChart.description}
              </p>

              <div className="space-y-4 bg-oatmeal/40 p-4 rounded-xl border border-border/80">
                <h4 className="text-label-md font-sans uppercase tracking-wider text-warmBrown font-semibold flex items-center gap-2">
                  <span>📐</span> How to Measure
                </h4>
                <ul className="text-body-xs text-charcoal-700 space-y-2.5 list-disc list-inside font-sans">
                  <li>
                    <strong>Chest/Bust:</strong> Measure around the fullest part of the chest, keeping the tape horizontal.
                  </li>
                  <li>
                    <strong>Waist:</strong> Measure around the natural waistline (narrowest part of the torso).
                  </li>
                  <li>
                    <strong>Garment Length:</strong> Measure from the top shoulder seam down to the hemline.
                  </li>
                  <li>
                    <strong>All measurements</strong> in the chart above are given in <em>inches</em>.
                  </li>
                </ul>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-warmBrown/10 border border-warmBrown/20 text-body-xs text-charcoal-700">
                💡 <strong>Need Custom Sizing?</strong> We specialize in custom made-to-measure hand-crafted outfits tailored precisely for your child.
              </div>
            </div>

            {/* Custom Order CTA Button */}
            <div className="pt-2">
              <Link
                href="/custom-orders"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-label-md font-medium uppercase tracking-[0.16em] bg-charcoal text-ivory hover:bg-warmBrown hover:text-charcoal transition-all rounded-lg shadow-sm"
              >
                Request Custom Sizing ↗
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Full Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-2xl font-bold bg-white/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40"
            onClick={() => setZoomImage(null)}
          >
            ✕
          </button>
          <div className="relative max-w-4xl max-h-[95vh] w-full h-full">
            <Image
              src={zoomImage}
              alt="Zoomed Size Chart"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
