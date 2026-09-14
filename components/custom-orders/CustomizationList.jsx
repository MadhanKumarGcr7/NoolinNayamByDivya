'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

export default function CustomizationList({ onSelectBaseProduct }) {
  const [customizableProducts, setCustomizableProducts] = useState([]);
  const [loading, setLoading]                         = useState(true);

  useEffect(() => {
    async function loadCustomizable() {
      try {
        const res = await fetch('/api/products?status=active');
        const data = await res.json();
        const allProds = data.products || [];
        const customizableOnly = allProds.filter((p) => p.customizable === true);
        setCustomizableProducts(customizableOnly);
      } catch (err) {
        console.error('Error fetching customizable products:', err);
        setCustomizableProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadCustomizable();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-body-xs text-charcoal-400 font-light">Loading customizable collection...</p>
      </div>
    );
  }

  if (customizableProducts.length === 0) {
    return (
      <div className="bg-cream border border-border p-8 md:p-12 text-center max-w-xl mx-auto space-y-4 shadow-warm-xs">
        <div className="w-12 h-12 rounded-full bg-warmBrown/10 text-warmBrown flex items-center justify-center mx-auto mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h3 className="font-serif font-light text-charcoal text-2xl">No pieces open for customization</h3>
        <p className="text-body-sm text-charcoal-600 font-light leading-relaxed">
          No pieces are currently open for customization — check back soon, or share your own idea with us using our general custom order form.
        </p>
        <Link
          href="/custom-orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors shadow-warm-xs"
        >
          Share Your Custom Vision →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium">
            Available for Customization ({customizableProducts.length})
          </p>
          <h2 className="font-serif font-light text-charcoal text-3xl mt-1">
            Choose a Base Piece to Customize
          </h2>
        </div>
        <p className="text-body-xs text-charcoal-500 font-light max-w-sm">
          Select any item below to pre-attach it to your custom order request and request custom colors, sizing, or modifications.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {customizableProducts.map((product) => {
          const imageList = Array.isArray(product.images)
            ? product.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
            : [];
          const mainImage = imageList[0];

          return (
            <article key={product.id || product._id} className="group flex flex-col bg-cream/30 border border-border/60 p-3 shadow-warm-xs hover:shadow-warm-sm transition-all">
              {/* Product Image */}
              <div className="relative overflow-hidden bg-ivory aspect-portrait mb-3">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <PlaceholderImage label={product.name} aspect="3/4" />
                )}
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] uppercase font-sans font-medium tracking-wider bg-warmBrown text-ivory">
                  Customizable
                </span>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 gap-1">
                <h3 className="text-body-sm font-sans font-medium text-charcoal leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-body-xs font-sans text-charcoal-500 font-light">
                  Base Price: {currencySymbol}{product.price?.toLocaleString('en-IN')}
                </p>

                {/* CTA Button */}
                <div className="mt-auto pt-3">
                  {onSelectBaseProduct ? (
                    <button
                      type="button"
                      onClick={() => onSelectBaseProduct(product)}
                      className="w-full py-2 bg-charcoal text-ivory text-label-xs uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Customize This Piece</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <Link
                      href={`/custom-orders?baseProductId=${product.id || product._id}&baseProductName=${encodeURIComponent(product.name)}`}
                      className="w-full py-2 bg-charcoal text-ivory text-label-xs uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Customize This Piece</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
