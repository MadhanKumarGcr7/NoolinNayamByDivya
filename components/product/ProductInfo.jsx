'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

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
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
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

      {/* Stock warning */}
      {currentVariantOut && (
        <p className="text-body-xs text-warmBrown font-medium">
          Note: Selected size ({selectedSize}) is currently out of stock or requires custom pre-order.
        </p>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <Button
          variant="primary"
          fullWidth
          disabled={totalOut || currentVariantOut}
          onClick={handleAddToCart}
        >
          {totalOut || currentVariantOut ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={totalOut || currentVariantOut}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>

          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-12 h-12 border flex items-center justify-center transition-all ${
              wishlisted
                ? 'border-warmBrown text-warmBrown bg-warmBrown/10'
                : 'border-border text-charcoal-600 hover:border-charcoal hover:text-charcoal'
            }`}
          >
            {wishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {/* WhatsApp Quick Order / Inquiry */}
      <a
        href={getWhatsAppUrl(`Hi Divya! I am interested in ordering ${product.name} (Size: ${selectedSize}).`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 p-3 text-body-xs font-sans text-charcoal hover:text-warmBrown bg-oatmeal/60 hover:bg-oatmeal border border-border transition-colors text-center"
      >
        <span>💬</span> Have sizing questions? Chat directly on WhatsApp
      </a>

      <div className="h-px bg-border/60 my-2" />

      {/* Product Information Accordions */}
      <div className="divide-y divide-border/60">
        {/* Tab 1: Details & Specs */}
        <div className="py-4">
          <button
            onClick={() => setActiveTab(activeTab === 'details' ? '' : 'details')}
            className="w-full flex items-center justify-between text-label-lg uppercase tracking-[0.16em] font-medium text-charcoal text-left"
          >
            <span>Details & Craftsmanship</span>
            <span>{activeTab === 'details' ? '−' : '+'}</span>
          </button>
          {activeTab === 'details' && (
            <div className="mt-3 text-body-sm text-charcoal-600 font-light leading-relaxed animate-fade-in space-y-2">
              {product.material && <p><strong>Material:</strong> {product.material}</p>}
              {product.care && <p><strong>Care:</strong> {product.care}</p>}
              <p>Hand-crafted individually with premium cotton and gentle non-toxic threads safe for delicate baby skin.</p>
            </div>
          )}
        </div>

        {/* Tab 2: Customization */}
        <div className="py-4">
          <button
            onClick={() => setActiveTab(activeTab === 'custom' ? '' : 'custom')}
            className="w-full flex items-center justify-between text-label-lg uppercase tracking-[0.16em] font-medium text-charcoal text-left"
          >
            <span>Custom Sizing & Personalization</span>
            <span>{activeTab === 'custom' ? '−' : '+'}</span>
          </button>
          {activeTab === 'custom' && (
            <div className="mt-3 text-body-sm text-charcoal-600 font-light leading-relaxed animate-fade-in space-y-2">
              <p>Custom colors, sleeve modifications, and custom measurements available upon request.</p>
              <p>
                <a href="/custom-orders" className="text-warmBrown underline font-medium">Request a Custom Order ↗</a>
              </p>
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

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}
