'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminNewCouponPage() {
  const router = useRouter();

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minOrderValue: '',
    validFrom: todayStr,
    validUntil: defaultUntil,
    usageLimit: '',
    perCustomerLimit: '1',
    active: true,
    internalNote: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'code') {
      setFormData({ ...formData, code: value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create coupon.');
      }

      router.push('/admin/coupons');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/coupons" className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors font-sans font-medium">
        ← Back to Coupons
      </Link>

      <div className="bg-cream border border-border p-6 sm:p-8 space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="font-serif font-light text-charcoal text-2xl">Create New Coupon</h1>
          <p className="text-body-xs text-charcoal-400 font-light mt-1">
            Configure discount amount, validity period, and usage restrictions.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-blush-light text-warmBrown border border-warmBrown/20 text-body-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          {/* Code & Active status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2">
              <Input
                label="Coupon Code *"
                id="code"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                placeholder="WELCOME10"
              />
              <p className="text-[11px] text-charcoal-400 mt-1 font-light">
                Auto-converted to uppercase (e.g. DIVYA200). Customers type this code to redeem.
              </p>
            </div>

            <div className="pt-7">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-warmBrown cursor-pointer"
                />
                <span className="text-body-xs text-charcoal font-medium">Active Immediately</span>
              </label>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-xs text-charcoal-600 font-medium mb-1">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full bg-ivory border border-border px-3 py-2 text-body-sm text-charcoal focus:outline-none focus:border-warmBrown transition-colors"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="flat">Flat Amount Off (₹)</option>
              </select>
            </div>

            <Input
              label={formData.discountType === 'percentage' ? 'Percentage Value (%) *' : 'Flat Amount (₹) *'}
              id="discountValue"
              name="discountValue"
              type="number"
              min="1"
              max={formData.discountType === 'percentage' ? '100' : '100000'}
              required
              value={formData.discountValue}
              onChange={handleChange}
              placeholder={formData.discountType === 'percentage' ? '10' : '200'}
            />
          </div>

          {/* Max Cap & Min Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Maximum Discount Cap (₹) (Optional)"
              id="maxDiscount"
              name="maxDiscount"
              type="number"
              min="0"
              value={formData.maxDiscount}
              onChange={handleChange}
              placeholder="500 (e.g. 20% off up to ₹500)"
            />

            <Input
              label="Minimum Order Value (₹) (Optional)"
              id="minOrderValue"
              name="minOrderValue"
              type="number"
              min="0"
              value={formData.minOrderValue}
              onChange={handleChange}
              placeholder="999"
            />
          </div>

          {/* Validity Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-xs text-charcoal-600 font-medium mb-1">
                Valid From *
              </label>
              <input
                type="date"
                name="validFrom"
                required
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full bg-ivory border border-border px-3 py-2 text-body-sm text-charcoal focus:outline-none focus:border-warmBrown transition-colors"
              />
            </div>

            <div>
              <label className="block text-body-xs text-charcoal-600 font-medium mb-1">
                Valid Until *
              </label>
              <input
                type="date"
                name="validUntil"
                required
                value={formData.validUntil}
                onChange={handleChange}
                className="w-full bg-ivory border border-border px-3 py-2 text-body-sm text-charcoal focus:outline-none focus:border-warmBrown transition-colors"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Usage Limit across all customers (Optional)"
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="50 (Leave blank for unlimited)"
            />

            <Input
              label="Per-Customer Limit"
              id="perCustomerLimit"
              name="perCustomerLimit"
              type="number"
              min="1"
              value={formData.perCustomerLimit}
              onChange={handleChange}
              placeholder="1"
            />
          </div>

          {/* Owner Note */}
          <div>
            <label className="block text-body-xs text-charcoal-600 font-medium mb-1">
              Internal Owner Note (Private, not shown to customers)
            </label>
            <textarea
              name="internalNote"
              rows={2}
              value={formData.internalNote}
              onChange={handleChange}
              placeholder="Shared on WhatsApp community for Diwali launch..."
              className="w-full bg-ivory border border-border p-3 text-body-sm text-charcoal focus:outline-none focus:border-warmBrown transition-colors"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="submit" variant="primary" size="lg" loading={saving}>
              CREATE COUPON
            </Button>
            <Link
              href="/admin/coupons"
              className="px-6 py-3 border border-border text-charcoal text-label-md uppercase tracking-[0.14em] font-medium hover:bg-ivory transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
