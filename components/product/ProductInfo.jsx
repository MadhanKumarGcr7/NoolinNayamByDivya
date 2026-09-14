'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SizeSelector } from '@/components/product/VariantSelectors';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import useAuthStore from '@/store/authStore';
import useAuthModalStore from '@/store/authModalStore';
import { brandConfig, getWhatsAppUrl } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

export default function ProductInfo({ product }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '1Y');
  const [quantity, setQuantity]         = useState(1);
  const [activeTab, setActiveTab]       = useState('details');

  const { addItem } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();
  const wishlisted = isWishlisted(product.id || product._id);

  // Check variant stock map if present
  const getVariant = (size) => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => v.size === size || !v.size);
  };

  const isVariantOutOfStock = (size) => {
    const v = getVariant(size);
    if (!v) return false;
    return v.outOfStock || v.stock <= 0;
  };

  const currentVariantOut = isVariantOutOfStock(selectedSize);
  const totalOut = product.stock <= 0 && product.badge !== 'Made to Order';

  const handleAddToCart = () => {
    if (totalOut || currentVariantOut) return;
    if (!isLoggedIn) {
      openAuthModal({
        actionType: 'cart',
        product,
        options: { size: selectedSize, quantity },
      });
      return;
    }
    addItem(product, { size: selectedSize, quantity });
  };

  const handleBuyNow = () => {
    if (totalOut || currentVariantOut) return;
    if (!isLoggedIn) {
      openAuthModal({
        actionType: 'buynow',
        product,
        options: { size: selectedSize, quantity },
      });
      return;
    }
    addItem(product, { size: selectedSize, quantity });
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isLoggedIn) {
      openAuthModal({ actionType: 'wishlist', product });
      return;
    }
    toggleItem(product);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Category / Badge row */}
      <div className="flex items-center justify-between">
        <span className="text-label-md uppercase tracking-[0.18em] font-sans text-warmBrown">
          {product.category}
        </span>
        {totalOut ? (
          <Badge label="Currently Unavailable" className="bg-warmBrown text-ivory border-warmBrown" />
        ) : product.badge ? (
          <Badge label={product.badge} />
        ) : null}
      </div>

      {/* Name */}
      <h1 className="font-serif font-light text-charcoal text-display-sm leading-tight">
        {product.name}
      </h1>

      {/* Price row */}
      <div className="flex items-center gap-3">
        <span className="font-serif font-light text-charcoal text-2xl">
          {currencySymbol}{product.price?.toLocaleString('en-IN')}
        </span>
        {product.comparePrice && (
          <span className="text-body-sm text-charcoal-400 line-through">
            {currencySymbol}{product.comparePrice?.toLocaleString('en-IN')}
          </span>
        )}
        <span className="text-body-xs text-charcoal-400 font-light ml-2">(Taxes included)</span>
      </div>

      {/* Description */}
      <p className="text-body-sm text-charcoal-600 font-light leading-relaxed">
        {product.description}
      </p>

      <div className="h-px bg-border/60 my-2" />

      {/* Size Selector */}
      <SizeSelector
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        isSizeDisabled={(s) => isVariantOutOfStock(s)}
      />

      {/* Quantity Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal">
          Quantity:
        </label>
        <div className="flex items-center w-36 border border-border bg-ivory">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:text-charcoal text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex-1 text-center font-sans font-medium text-body-sm text-charcoal">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:text-charcoal text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* CTAs Action Block */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button
          onClick={handleAddToCart}
          variant="secondary"
          size="lg"
          disabled={totalOut || currentVariantOut}
          className={`flex-1 ${
            totalOut || currentVariantOut
              ? 'opacity-50 bg-charcoal-400 border-charcoal-400 cursor-not-allowed text-ivory'
              : ''
          }`}
        >
          {totalOut
            ? 'UNAVAILABLE'
            : currentVariantOut
            ? 'OUT OF STOCK'
            : 'ADD TO CART'}
        </Button>

        {!(totalOut || currentVariantOut) && (
          <Button
            onClick={handleBuyNow}
            variant="primary"
            size="lg"
            className="flex-1"
            arrow
          >
            BUY NOW
          </Button>
        )}

        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`p-4 border transition-colors flex items-center justify-center ${
            wishlisted ? 'border-warmBrown text-warmBrown bg-blush-light/30' : 'border-border text-charcoal hover:border-charcoal'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* WhatsApp Customization Inquiry Banner */}
      {product.customizable && (
        <div className="bg-cream border border-border p-4 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-body-xs font-medium text-charcoal uppercase tracking-[0.1em]">Need custom sizing or color?</p>
            <p className="text-body-xs text-charcoal-600 font-light">We can crochet this item tailored to your requirements.</p>
          </div>
          <a
            href={getWhatsAppUrl(`Hi! I'd like to ask about customizing the "${product.name}".`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-medium whitespace-nowrap hover:underline"
          >
            Custom Inquiry →
          </a>
        </div>
      )}

      {/* Accordion Info Tabs */}
      <div className="border-t border-border mt-6 divide-y divide-border">
        {/* Tab 1: Details & Materials */}
        <div className="py-4">
          <button
            onClick={() => setActiveTab(activeTab === 'details' ? '' : 'details')}
            className="w-full flex items-center justify-between text-label-lg uppercase tracking-[0.16em] font-medium text-charcoal text-left"
          >
            <span>Materials & Handmade Craft</span>
            <span>{activeTab === 'details' ? '−' : '+'}</span>
          </button>
          {activeTab === 'details' && (
            <div className="mt-3 text-body-sm text-charcoal-600 font-light leading-relaxed space-y-2 animate-fade-in">
              <p><strong>Material:</strong> {product.material || '100% Organic Soft Cotton Yarn'}</p>
              <p><strong>Craftsmanship:</strong> Individually hand-crocheted stitch by stitch. Minor subtle variations are natural signatures of true handmade craft.</p>
            </div>
          )}
        </div>

        {/* Tab 2: Care Instructions */}
        <div className="py-4">
          <button
            onClick={() => setActiveTab(activeTab === 'care' ? '' : 'care')}
            className="w-full flex items-center justify-between text-label-lg uppercase tracking-[0.16em] font-medium text-charcoal text-left"
          >
            <span>Care Guide</span>
            <span>{activeTab === 'care' ? '−' : '+'}</span>
          </button>
          {activeTab === 'care' && (
            <div className="mt-3 text-body-sm text-charcoal-600 font-light leading-relaxed animate-fade-in">
              <p>{product.care || 'Hand wash cold in gentle detergent. Lay flat on clean towel to dry. Do not wring or hang to preserve shape.'}</p>
            </div>
          )}
        </div>

        {/* Tab 3: Delivery & Shipping */}
        <div className="py-4">
          <button
            onClick={() => setActiveTab(activeTab === 'shipping' ? '' : 'shipping')}
            className="w-full flex items-center justify-between text-label-lg uppercase tracking-[0.16em] font-medium text-charcoal text-left"
          >
            <span>Made to Order & Shipping</span>
            <span>{activeTab === 'shipping' ? '−' : '+'}</span>
          </button>
          {activeTab === 'shipping' && (
            <div className="mt-3 text-body-sm text-charcoal-600 font-light leading-relaxed animate-fade-in space-y-2">
              <p>Every piece is made slowly upon order. Production time is typically 4–7 working days prior to dispatch.</p>
              <p>Free standard shipping across India on orders over ₹999.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
