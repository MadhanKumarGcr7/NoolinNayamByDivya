'use client';

import { useState } from 'react';
import useCartStore from '@/store/cartStore';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

export default function CouponInput({ className = '' }) {
  const { subtotal, appliedCoupon, setAppliedCoupon, removeCoupon } = useCartStore();

  const [isOpen, setIsOpen]   = useState(Boolean(appliedCoupon));
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.message || 'This coupon code is not valid.');
      }

      setAppliedCoupon(data.coupon);
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className={`p-3 bg-sage-light/60 border border-sage-dark/30 rounded-none text-body-xs font-sans space-y-1 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sage-dark font-bold">✓</span>
            <span className="font-medium text-charcoal">Coupon</span>
            <code className="bg-ivory/80 text-charcoal px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">
              {appliedCoupon.code}
            </code>
            <span className="text-sage-dark font-medium whitespace-nowrap">
              applied (−{currencySymbol}{appliedCoupon.discountAmount?.toLocaleString('en-IN')})
            </span>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-label-xs uppercase tracking-wider text-warmBrown hover:text-charcoal transition-colors font-medium flex-shrink-0 underline"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`font-sans text-body-xs ${className}`}>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-warmBrown hover:text-charcoal transition-colors text-label-xs uppercase tracking-[0.14em] font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>Have a coupon code?</span>
          <span>+</span>
        </button>
      ) : (
        <form onSubmit={handleApply} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="ENTER CODE"
              className="flex-1 bg-ivory border border-border px-3 py-1.5 text-body-xs font-mono font-semibold uppercase text-charcoal placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-charcoal-400 focus:outline-none focus:border-warmBrown transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-4 py-1.5 bg-charcoal text-ivory text-label-xs uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors disabled:opacity-40"
            >
              {loading ? '...' : 'Apply'}
            </button>
          </div>

          {error && (
            <p className="text-[11px] text-blush-dark font-medium leading-tight">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
