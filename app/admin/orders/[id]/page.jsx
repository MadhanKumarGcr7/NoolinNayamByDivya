'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

const orderStatuses   = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed'];

const statusColors = {
  Pending: 'bg-sand/40 text-warmBrown',
  Processing: 'bg-blush-light text-blush-dark',
  Shipped: 'bg-sage-light text-sage-dark',
  Delivered: 'bg-sage text-charcoal',
  Cancelled: 'bg-charcoal-200 text-charcoal-600',
};

export default function AdminOrderDetailPage({ params }) {
  const id = params?.id;
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { credentials: 'include' });
        const data = await res.json();
        setOrder(data.order);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, [id]);

  const updateStatus = async (field, value) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setMsg({ type: 'success', text: `${field === 'status' ? 'Order' : 'Payment'} status updated.` });
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to update.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-cream border border-border p-8 text-center">
        <p className="text-body-sm text-charcoal-400">Order not found.</p>
        <Link href="/admin/orders" className="text-warmBrown text-label-md uppercase tracking-[0.14em] mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors font-sans font-medium">
        ← All Orders
      </Link>

      {/* Order Header */}
      <div className="bg-cream border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif font-light text-charcoal text-2xl">
              Order #{order.orderNumber || order._id}
            </h2>
            <p className="text-body-xs text-charcoal-400 font-light mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-block px-3 py-1 text-label-md uppercase tracking-[0.14em] font-sans font-medium ${statusColors[order.status] || ''}`}>
              {order.status}
            </span>
            {order.returnRequested && (
              <span className="px-3 py-1 bg-warmBrown/10 text-warmBrown border border-warmBrown/30 text-label-xs uppercase tracking-[0.14em] font-sans font-medium">
                ✓ Return Requested via WhatsApp
              </span>
            )}
          </div>
        </div>

        {/* Return Policy Agreement & Request Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-ivory border border-border p-3.5 text-body-xs font-sans">
            <span className="text-charcoal-400 block mb-0.5">Return Policy Gate</span>
            {order.returnPolicyAgreed ? (
              <span className="text-sage-dark font-medium flex items-center gap-1">
                ✓ Agreed at Checkout ({order.returnPolicyAgreedAt ? new Date(order.returnPolicyAgreedAt).toLocaleDateString('en-IN') : 'Confirmed'})
              </span>
            ) : (
              <span className="text-charcoal-400 italic">Not recorded</span>
            )}
          </div>

          <div className="bg-ivory border border-border p-3.5 text-body-xs font-sans">
            <span className="text-charcoal-400 block mb-0.5">WhatsApp Return Request</span>
            {order.returnRequested ? (
              <span className="text-warmBrown font-medium flex items-center gap-1">
                ⚠️ Size Return Initiated ({order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleDateString('en-IN') : 'Recent'})
              </span>
            ) : (
              <span className="text-charcoal-400 italic">No return requested</span>
            )}
          </div>
        </div>

        {/* Status Update Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-ivory border border-border/60">
          <div>
            <label className="text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 block mb-2">Order Status</label>
            <select
              value={order.status}
              onChange={(e) => updateStatus('status', e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
            >
              {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 block mb-2">Payment Status</label>
            <select
              value={order.paymentStatus}
              onChange={(e) => updateStatus('paymentStatus', e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
            >
              {paymentStatuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {msg && (
          <div className={`mt-3 p-2 text-body-xs font-sans ${msg.type === 'success' ? 'text-sage-dark bg-sage-light' : 'text-warmBrown bg-blush-light'}`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Items */}
        <div className="bg-cream border border-border p-6">
          <h3 className="font-serif font-light text-charcoal text-lg mb-4 border-b border-border pb-3">
            Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2 text-body-xs font-sans">
                <div>
                  <p className="text-charcoal font-medium">{item.name}</p>
                  <p className="text-charcoal-400 font-light">
                    {item.size && `Size: ${item.size}`}{item.size && item.color ? ' · ' : ''}{item.color && `Color: ${item.color}`}
                    {' · '}Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-charcoal font-medium whitespace-nowrap">
                  {currencySymbol}{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-3 space-y-1 text-body-xs font-sans">
            <div className="flex justify-between text-charcoal-600"><span>Subtotal</span><span>{currencySymbol}{order.subtotal?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-charcoal-600"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `${currencySymbol}${order.shipping}`}</span></div>
            <div className="flex justify-between text-charcoal font-medium pt-2 border-t border-border/60"><span>Total</span><span className="text-body-sm">{currencySymbol}{order.total?.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="space-y-6">
          <div className="bg-cream border border-border p-6">
            <h3 className="font-serif font-light text-charcoal text-lg mb-4 border-b border-border pb-3">Contact Info</h3>
            <div className="space-y-2 text-body-xs font-sans font-light text-charcoal">
              <p><span className="text-charcoal-400">Name:</span> {order.contactInfo?.name}</p>
              <p><span className="text-charcoal-400">Email:</span> {order.contactInfo?.email}</p>
              <p><span className="text-charcoal-400">Phone:</span> {order.contactInfo?.phone}</p>
            </div>
          </div>
          <div className="bg-cream border border-border p-6">
            <h3 className="font-serif font-light text-charcoal text-lg mb-4 border-b border-border pb-3">Shipping Address</h3>
            <div className="text-body-xs font-sans font-light text-charcoal">
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
          {order.notes && (
            <div className="bg-cream border border-border p-6">
              <h3 className="font-serif font-light text-charcoal text-lg mb-3 border-b border-border pb-3">Notes</h3>
              <p className="text-body-xs text-charcoal-600 font-light">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
