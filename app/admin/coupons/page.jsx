'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

const statusColors = {
  Active: 'bg-sage-light text-sage-dark border border-sage-dark/30',
  Scheduled: 'bg-sand/40 text-warmBrown border border-warmBrown/30',
  Expired: 'bg-charcoal-200 text-charcoal-600 border border-charcoal/20',
  Disabled: 'bg-blush-light text-blush-dark border border-blush-dark/30',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [actionMsg, setActionMsg] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', { credentials: 'include' });
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const toggleActive = async (id, currentActive) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `Coupon updated successfully.` });
        fetchCoupons();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed to update.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'An error occurred.' });
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `Coupon "${code}" deleted.` });
        fetchCoupons();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed to delete.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'An error occurred.' });
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    if (filter === 'all') return true;
    return c.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-serif font-light text-charcoal text-display-xs">Coupons & Promo Codes</h1>
          <p className="text-body-xs text-charcoal-400 font-light mt-1">
            Create discount codes to share with customers via WhatsApp, Instagram, or email.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="px-5 py-2.5 bg-warmBrown text-ivory text-label-md uppercase tracking-[0.14em] font-sans font-medium hover:bg-charcoal transition-colors shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+ Create Coupon</span>
        </Link>
      </div>

      {actionMsg && (
        <div
          className={`p-3 text-body-xs font-sans border ${
            actionMsg.type === 'success'
              ? 'bg-sage-light text-sage-dark border-sage-dark/30'
              : 'bg-blush-light text-blush-dark border-blush-dark/30'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {['all', 'active', 'scheduled', 'expired', 'disabled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 text-label-xs uppercase tracking-[0.14em] font-sans font-medium whitespace-nowrap border transition-colors ${
              filter === st
                ? 'bg-charcoal text-ivory border-charcoal'
                : 'bg-transparent text-charcoal-400 border-border hover:border-charcoal hover:text-charcoal'
            }`}
          >
            {st === 'all' ? 'All Coupons' : st}
          </button>
        ))}
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-cream border border-border p-10 text-center space-y-3">
          <p className="text-body-sm text-charcoal-400 font-light">No coupons found matching status &quot;{filter}&quot;.</p>
          <Link href="/admin/coupons/new" className="text-warmBrown text-label-xs uppercase tracking-[0.14em] font-medium inline-block underline">
            Create your first coupon →
          </Link>
        </div>
      ) : (
        <div className="bg-cream border border-border overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-border bg-ivory/50">
                <th className="px-4 py-3 text-label-xs uppercase tracking-[0.14em] font-medium text-charcoal-400">Code</th>
                <th className="px-4 py-3 text-label-xs uppercase tracking-[0.14em] font-medium text-charcoal-400">Discount</th>
                <th className="px-4 py-3 text-label-xs uppercase tracking-[0.14em] font-medium text-charcoal-400 hidden sm:table-cell">Validity</th>
                <th className="px-4 py-3 text-label-xs uppercase tracking-[0.14em] font-medium text-charcoal-400">Uses</th>
                <th className="px-4 py-3 text-label-xs uppercase tracking-[0.14em] font-medium text-charcoal-400">Status</th>
                <th className="px-4 py-3 text-label-xs uppercase tracking-[0.14em] font-medium text-charcoal-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-body-xs font-light text-charcoal">
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-ivory/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <code className="text-body-xs font-mono font-bold bg-sand/30 px-2 py-0.5 rounded text-charcoal tracking-wide">
                        {c.code}
                      </code>
                      {c.internalNote && (
                        <p className="text-[11px] text-charcoal-400 italic truncate max-w-xs">{c.internalNote}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-charcoal">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${currencySymbol}${c.discountValue} OFF`}
                    </p>
                    <p className="text-[11px] text-charcoal-400">
                      {c.maxDiscount ? `Max ${currencySymbol}${c.maxDiscount}` : ''}
                      {c.maxDiscount && c.minOrderValue ? ' · ' : ''}
                      {c.minOrderValue ? `Min order ${currencySymbol}${c.minOrderValue}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-charcoal-600">
                    <p>{new Date(c.validFrom).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(c.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-charcoal">
                    {c.usageCount} {c.usageLimit !== null ? `/ ${c.usageLimit}` : '(Unlimited)'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] font-medium ${statusColors[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => toggleActive(c.id, c.active)}
                      className="text-label-xs uppercase tracking-wider text-charcoal-400 hover:text-charcoal transition-colors underline"
                      title={c.active ? 'Disable Coupon' : 'Enable Coupon'}
                    >
                      {c.active ? 'Disable' : 'Enable'}
                    </button>
                    <Link
                      href={`/admin/coupons/${c.id}/edit`}
                      className="text-label-xs uppercase tracking-wider text-warmBrown hover:text-charcoal transition-colors font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="text-label-xs uppercase tracking-wider text-blush-dark hover:text-warmBrown transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
