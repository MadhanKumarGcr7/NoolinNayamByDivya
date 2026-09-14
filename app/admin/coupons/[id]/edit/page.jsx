'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminEditCouponPage({ params }) {
  const id = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minOrderValue: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    perCustomerLimit: '1',
    active: true,
    internalNote: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/coupons/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.coupon) {
          const c = data.coupon;
          setFormData({
            code: c.code || '',
            discountType: c.discountType || 'percentage',
            discountValue: c.discountValue || '',
            maxDiscount: c.maxDiscount || '',
            minOrderValue: c.minOrderValue || '',
            validFrom: c.validFrom ? new Date(c.validFrom).toISOString().split('T')[0] : '',
            validUntil: c.validUntil ? new Date(c.validUntil).toISOString().split('T')[0] : '',
            usageLimit: c.usageLimit !== null && c.usageLimit !== undefined ? c.usageLimit : '',
            perCustomerLimit: c.perCustomerLimit || '1',
            active: Boolean(c.active),
            internalNote: c.internalNote || '',
          });
        }
      } catch {
        setError('Failed to load coupon.');
      }
      setLoading(false);
    }
    load();
  }, [id]);

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
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update coupon.');
      }

      router.push('/admin/coupons');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/coupons" className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors font-sans font-medium">
        ← Back to Coupons
      </Link>

      <div className="bg-cream border border-border p-6 sm:p-8 space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="font-serif font-light text-charcoal text-2xl">Edit Coupon &quot;{formData.code}&quot;</h1>
          <p className="text-body-xs text-charcoal-400 font-light mt-1">
            Update discount values, validity range, or usage limits.
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
                <span className="text-body-xs text-charcoal font-medium">Active</span>
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
            />

            <Input
              label="Minimum Order Value (₹) (Optional)"
              id="minOrderValue"
              name="minOrderValue"
              type="number"
              min="0"
              value={formData.minOrderValue}
              onChange={handleChange}
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
              label="Total Usage Limit (Optional)"
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Leave blank for unlimited"
            />

            <Input
              label="Per-Customer Limit"
              id="perCustomerLimit"
              name="perCustomerLimit"
              type="number"
              min="1"
              value={formData.perCustomerLimit}
              onChange={handleChange}
            />
          </div>

          {/* Owner Note */}
          <div>
            <label className="block text-body-xs text-charcoal-600 font-medium mb-1">
              Internal Owner Note (Private)
            </label>
            <textarea
              name="internalNote"
              rows={2}
              value={formData.internalNote}
              onChange={handleChange}
              className="w-full bg-ivory border border-border p-3 text-body-sm text-charcoal focus:outline-none focus:border-warmBrown transition-colors"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="submit" variant="primary" size="lg" loading={saving}>
              SAVE CHANGES
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
