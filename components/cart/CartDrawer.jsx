'use client';

import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '@/store/cartStore';
import { brandConfig } from '@/lib/config';

export default function CartDrawer() {
  const { items, itemCount, subtotal, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCartStore();
  const { currencySymbol } = brandConfig.shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-charcoal/30 backdrop-blur-sm transition-opacity duration-400 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 bottom-0 z-[90] w-full max-w-md bg-ivory flex flex-col shadow-warm-xl transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-serif font-light text-charcoal text-xl tracking-[-0.01em]">Your Cart</h2>
            <p className="text-label-md text-charcoal-400 uppercase tracking-[0.14em] mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={closeDrawer} aria-label="Close cart" className="p-1.5 text-charcoal-400 hover:text-charcoal transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-charcoal-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <p className="font-serif font-light text-charcoal text-xl mb-2">Your cart is empty</p>
              <p className="text-body-sm text-charcoal-400 font-light mb-8">Discover our handcrafted pieces</p>
              <Link href="/shop" onClick={closeDrawer} className="inline-flex items-center gap-2 px-7 py-3.5 bg-charcoal text-ivory text-label-lg uppercase tracking-[0.16em] hover:bg-warmBrown transition-colors duration-400">
                <span>Shop Collection</span>
              </Link>
              <Link href="/cart" onClick={closeDrawer} className="mt-4 text-label-sm uppercase tracking-[0.14em] text-warmBrown font-medium hover:underline block">
                Track Custom Order Inquiries & Quotes →
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border" role="list">
              {items.map((item) => (
                <li key={item.cartId} className="py-5 flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-24 bg-cream flex-shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full bg-oatmeal" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-body-sm font-sans font-medium text-charcoal leading-snug mb-1 truncate">{item.name}</h3>
                    <div className="flex gap-3 mb-2">
                      {item.size && <span className="text-body-xs text-charcoal-400">Size: {item.size}</span>}
                      {item.color && <span className="text-body-xs text-charcoal-400">Color: {item.color.name}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-charcoal transition-colors text-lg leading-none" aria-label="Decrease quantity">−</button>
                        <span className="w-8 h-8 flex items-center justify-center text-body-xs font-medium text-charcoal">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-charcoal-400 hover:text-charcoal transition-colors text-lg leading-none" aria-label="Increase quantity">+</button>
                      </div>
                      <p className="text-body-sm font-medium text-charcoal">{currencySymbol}{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  {/* Remove */}
                  <button onClick={() => removeItem(item.cartId)} aria-label={`Remove ${item.name}`} className="text-charcoal-200 hover:text-warmBrown transition-colors mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary & CTA */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border bg-cream">
            {subtotal < brandConfig.shipping.freeShippingThreshold && (
              <p className="text-body-xs text-charcoal-400 font-light mb-3 text-center">
                Add {currencySymbol}{(brandConfig.shipping.freeShippingThreshold - subtotal).toLocaleString('en-IN')} more for free shipping
              </p>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-label-lg uppercase tracking-[0.14em] text-charcoal-600">Subtotal</span>
              <span className="font-serif font-light text-charcoal text-xl">{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-body-xs text-charcoal-400 font-light mb-4 text-center">Shipping calculated at checkout</p>
            <Link href="/checkout" onClick={closeDrawer} className="w-full flex items-center justify-center gap-2 bg-charcoal text-ivory py-4 text-label-lg uppercase tracking-[0.16em] hover:bg-warmBrown transition-colors duration-400 mb-3">
              Proceed to Checkout
            </Link>
            <Link href="/cart" onClick={closeDrawer} className="w-full flex items-center justify-center gap-2 border border-charcoal text-charcoal py-3.5 text-label-md uppercase tracking-[0.14em] hover:bg-charcoal hover:text-ivory transition-colors duration-400">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
