'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { currencySymbol } = brandConfig.shipping;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Live API search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal/40 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl bg-ivory shadow-warm-xl border border-border overflow-hidden animate-scale-in">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-cream/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crochet dresses, kidswear, custom orders..."
            className="flex-1 bg-transparent text-charcoal text-body-md font-sans focus:outline-none placeholder:text-charcoal-300"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-charcoal"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
            </div>
          ) : query.trim() === '' ? (
            <div className="text-center py-8 text-charcoal-400">
              <p className="text-body-sm font-light">Start typing to search our handcrafted collection.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-body-sm text-charcoal-600 font-light mb-1">No products matching &ldquo;{query}&rdquo;</p>
              <p className="text-body-xs text-charcoal-400 font-light">Try searching for &lsquo;crochet&rsquo;, &lsquo;romper&rsquo;, or &lsquo;dress&rsquo;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((product) => (
                <Link
                  key={product.id || product._id}
                  href={`/shop/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 bg-cream hover:bg-oatmeal/40 border border-border/60 transition-colors group"
                >
                  <div className="w-14 h-16 bg-ivory flex-shrink-0 overflow-hidden relative border border-border/40">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-oatmeal flex items-center justify-center text-[10px] text-charcoal-400">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md uppercase tracking-[0.14em] text-warmBrown mb-0.5">{product.category}</p>
                    <p className="text-body-xs font-sans font-medium text-charcoal group-hover:text-warmBrown transition-colors truncate">
                      {product.name}
                    </p>
                    <p className="text-body-xs font-sans font-medium text-charcoal mt-1">
                      {currencySymbol}{product.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
