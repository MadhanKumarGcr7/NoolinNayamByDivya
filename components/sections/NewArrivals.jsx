'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/sections/FeaturedProducts';

export default function NewArrivals() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function loadNewArrivals() {
      try {
        const res = await fetch('/api/products?newArrival=true&limit=5');
        const data = await res.json();
        setNewArrivals(data.products || []);
      } catch {
        setNewArrivals([]);
      } finally {
        setLoading(false);
      }
    }
    loadNewArrivals();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-ivory overflow-hidden" aria-labelledby="new-arrivals-heading">
      <div className="site-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 reveal">
          <div>
            <p className="section-label mb-2">Fresh Off The Hook</p>
            <h2 id="new-arrivals-heading" className="font-serif font-light text-charcoal text-display-md">
              New arrivals.
            </h2>
          </div>
          <Link
            href="/shop?category=new-arrivals"
            className="hidden sm:inline-flex items-center gap-2 text-label-lg uppercase tracking-[0.16em] text-charcoal-400 hover:text-charcoal transition-colors group"
          >
            <span>Explore all new</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="reveal reveal-delay-2">
            {/* Mobile Strip (Scrollable) */}
            <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory gap-4 -mx-5 px-5 pb-6 scrollbar-none">
              {newArrivals.map((product) => (
                <div key={product.id || product._id} className="snap-start shrink-0 w-[72vw]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Desktop Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile View All button below strip */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop?category=new-arrivals"
            className="inline-flex items-center gap-2 text-label-md uppercase tracking-[0.16em] text-charcoal border-b border-charcoal pb-1"
          >
            <span>Explore all new arrivals</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
