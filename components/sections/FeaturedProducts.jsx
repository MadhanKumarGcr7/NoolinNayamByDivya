'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import Badge from '@/components/ui/Badge';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import useAuthStore from '@/store/authStore';
import useAuthModalStore from '@/store/authModalStore';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

// Reusable ProductCard used across the storefront
export function ProductCard({ product }) {
  const [hovering, setHovering] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const wishlisted = isWishlisted(product.id || product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal({ actionType: 'wishlist', product });
      return;
    }
    toggleItem(product);
  };

  const handleQuickAddClick = () => {
    if (isOut) return;
    const defaultSize = product.sizes?.[0] || '1Y';
    if (!isLoggedIn) {
      openAuthModal({
        actionType: 'cart',
        product,
        options: { size: defaultSize },
      });
      return;
    }
    addItem(product, { size: defaultSize });
  };

  const imageList = Array.isArray(product.images)
    ? product.images
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter((url) => typeof url === 'string' && url.trim() !== '')
    : [];

  const mainImage = imageList[0];
  const secondImage = imageList[1];
  const isOut = product.stock <= 0;

  return (
    <article
      className="group flex flex-col"
      aria-label={product.name}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-cream mb-4 aspect-portrait">
        {mainImage ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              className={`w-full h-full object-cover absolute inset-0 transition-all duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 ${
                secondImage ? 'group-hover:opacity-0' : ''
              }`}
            />
            {secondImage && (
              <img
                src={secondImage}
                alt={`${product.name} alternate view`}
                className="w-full h-full object-cover absolute inset-0 transition-all duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] opacity-0 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <PlaceholderImage
            label={`Product: ${product.name}`}
            className="w-full h-full absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
            aspect="3/4"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 shop-badge-container">
          {isOut ? (
            <Badge label="Out of Stock" className="bg-warmBrown text-ivory border-warmBrown shop-badge" />
          ) : product.stock > 0 && product.stock <= (product.lowStockThreshold || 5) ? (
            <Badge label={`Only ${product.stock} Left`} className="bg-amber-100 text-amber-900 border-amber-300 font-medium shop-badge" />
          ) : product.badge ? (
            <Badge label={product.badge} className="shop-badge" />
          ) : null}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`
            absolute top-3 right-3 z-10 w-9 h-9 rounded-full
            flex items-center justify-center
            bg-ivory/80 backdrop-blur-sm
            transition-all duration-300
            ${wishlisted ? 'text-warmBrown' : 'text-charcoal-400 hover:text-warmBrown'}
            opacity-0 group-hover:opacity-100
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Quick Add — appears on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 bg-ivory/95 backdrop-blur-sm transition-all duration-400 ${hovering ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <button
            onClick={handleQuickAddClick}
            disabled={isOut}
            className={`w-full py-2.5 text-label-md uppercase tracking-[0.14em] transition-colors font-medium shop-add-to-cart-btn ${
              isOut
                ? 'text-charcoal-400 cursor-not-allowed'
                : 'text-charcoal hover:text-warmBrown'
            }`}
          >
            {isOut ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-2 flex-1">
        <Link href={`/shop/${product.slug}`} className="group/name">
          <h3 className="text-body-sm font-sans font-medium text-charcoal group-hover/name:text-warmBrown transition-colors duration-200 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-auto">
          <p className="text-body-sm font-sans font-medium text-charcoal">
            {currencySymbol}{product.price?.toLocaleString('en-IN')}
          </p>
          {product.comparePrice && (
            <p className="text-body-xs text-charcoal-400 line-through">
              {currencySymbol}{product.comparePrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch('/api/products?featured=true&limit=4');
        const data = await res.json();
        setFeatured(data.products || []);
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-ivory" aria-labelledby="featured-products-heading">
      <div className="site-container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 reveal">
          <div>
            <p className="section-label mb-3">Handpicked</p>
            <h2 id="featured-products-heading" className="font-serif font-light text-charcoal text-display-md">
              Featured pieces.
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-label-lg uppercase tracking-[0.16em] text-charcoal-400 hover:text-charcoal transition-colors group"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 reveal reveal-delay-2">
            {featured.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
