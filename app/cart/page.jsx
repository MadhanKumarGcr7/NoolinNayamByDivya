'use client';

import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { brandConfig } from '@/lib/config';

import CustomInquiriesCartSection from '@/components/cart/CustomInquiriesCartSection';

const { currencySymbol, freeShippingThreshold } = brandConfig.shipping;

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCartStore();
  const { toggleItem } = useWishlistStore();

  const handleMoveToWishlist = (item) => {
    toggleItem({ id: item.productId, name: item.name, slug: item.slug, images: [item.image], price: item.price });
    removeItem(item.cartId);
  };

  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="site-container">
        {/* Page Title */}
        <div className="text-center mb-12">
          <SectionHeading
            label="Shopping Bag"
            headline="Your Selection"
            align="center"
            as="h1"
            headlineClassName="text-display-md"
          />
        </div>

        {/* Custom Inquiries & Owner Status Tracking */}
        <CustomInquiriesCartSection />

        {items.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 bg-cream border border-border p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-charcoal-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            <h2 className="font-serif font-light text-charcoal text-2xl mb-2">Your cart is empty</h2>
            <p className="text-body-sm text-charcoal-600 font-light mb-8">
              Explore our handmade collections and discover special pieces crafted with care.
            </p>
            <Button href="/shop" variant="primary" size="lg">
              DISCOVER SHOP
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Items Table / List (8 cols) */}
            <div className="lg:col-span-8">
              {/* Header Row (Desktop) */}
              <div className="hidden sm:grid sm:grid-cols-12 pb-4 border-b border-border text-label-md uppercase tracking-[0.16em] text-charcoal-400 font-sans">
                <div className="sm:col-span-6">Product</div>
                <div className="sm:col-span-3 text-center">Quantity</div>
                <div className="sm:col-span-3 text-right">Total</div>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-border/60" role="list">
                {items.map((item) => (
                  <li key={item.cartId} className="py-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                    {/* Product Details */}
                    <div className="sm:col-span-6 flex gap-4 w-full">
                      <div className="w-20 h-24 bg-cream flex-shrink-0 relative overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full bg-oatmeal" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <Link href={`/shop/${item.slug}`} className="font-sans font-medium text-body-sm text-charcoal hover:text-warmBrown transition-colors block truncate">
                            {item.name}
                          </Link>
                          <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>Color: {item.color.name}</span>}
                          </p>
                          <p className="text-body-xs text-charcoal font-medium mt-1">
                            {currencySymbol}{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Move to Wishlist / Delete */}
                        <div className="flex gap-4 text-body-xs font-sans text-charcoal-400 mt-2">
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="hover:text-warmBrown transition-colors underline"
                          >
                            Move to Wishlist
                          </button>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="hover:text-warmBrown transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="sm:col-span-3 flex justify-center w-full sm:w-auto">
                      <div className="flex items-center border border-border bg-ivory">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-charcoal-600 hover:text-charcoal"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-body-xs font-medium text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-charcoal-600 hover:text-charcoal"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="sm:col-span-3 text-right w-full sm:w-auto">
                      <span className="font-serif text-lg font-light text-charcoal">
                        {currencySymbol}{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Summary Box (4 cols) */}
            <div className="lg:col-span-4 bg-cream border border-border p-6 lg:p-8">
              <h2 className="font-serif font-light text-charcoal text-2xl border-b border-border pb-4 mb-6">
                Order Summary
              </h2>

              {subtotal < freeShippingThreshold && (
                <div className="bg-ivory p-3 border border-border mb-6 text-body-xs text-charcoal-600 font-light text-center">
                  Add <strong className="font-medium text-charcoal">{currencySymbol}{(freeShippingThreshold - subtotal).toLocaleString('en-IN')}</strong> more for Free Shipping
                </div>
              )}

              <div className="space-y-3 text-body-sm font-sans mb-6">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal">{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Estimated Shipping</span>
                  <span>{subtotal >= freeShippingThreshold ? 'FREE' : 'Calculated at checkout'}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-8 flex justify-between items-baseline">
                <span className="text-label-lg uppercase tracking-[0.16em] text-charcoal">Total</span>
                <span className="font-serif text-2xl font-light text-charcoal">{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <Button href="/checkout" variant="primary" size="xl" className="w-full" arrow>
                PROCEED TO CHECKOUT
              </Button>

              <div className="mt-6 text-center">
                <Link href="/shop" className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-charcoal transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
