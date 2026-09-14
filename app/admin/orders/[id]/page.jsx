'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

const orderStatuses   = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

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
        setOrder(prev => ({ ...prev, ...data.order }));
        setMsg({ type: 'success', text: `${field === 'status' ? 'Order status' : 'Payment status'} updated to "${value}".` });
      } else {
        setMsg({ type: 'error', text: data.message || data.error || 'Failed to update.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to update.' });
    }
    setSaving(false);
  };

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to refund this order? This action will mark payment as Refunded and cancel the order.')) {
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setMsg({ type: 'success', text: 'Order refunded successfully.' });
      } else {
        setMsg({ type: 'error', text: data.error || data.message || 'Refund failed.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to process refund.' });
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
      <div className="bg-cream border border-border p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-light text-charcoal text-2xl">
              Order #{order.orderNumber || order._id}
            </h2>
            <p className="text-body-xs text-charcoal-400 font-light mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-block px-3 py-1 text-label-md uppercase tracking-[0.14em] font-sans font-medium ${statusColors[order.status] || 'bg-sand/40 text-warmBrown'}`}>
              Order: {order.status}
            </span>
            <span className={`inline-block px-3 py-1 text-label-md uppercase tracking-[0.14em] font-sans font-medium ${
              order.paymentStatus === 'paid' ? 'bg-sage-light text-sage-dark' :
              order.paymentStatus === 'refunded' ? 'bg-charcoal-200 text-charcoal-600' :
              order.paymentStatus === 'failed' ? 'bg-blush-light text-blush-dark' :
              'bg-sand/40 text-warmBrown'
            }`}>
              Payment: {order.paymentStatus || 'pending'}
            </span>
            {order.returnRequested && (
              <span className="px-3 py-1 bg-warmBrown/10 text-warmBrown border border-warmBrown/30 text-label-xs uppercase tracking-[0.14em] font-sans font-medium">
                ✓ Return Requested via WhatsApp
              </span>
            )}
          </div>
        </div>

        {/* Update Order Status Controls */}
        <div className="p-5 bg-ivory border border-warmBrown/20 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h3 className="text-label-md uppercase tracking-[0.16em] font-sans font-medium text-warmBrown">
              Update Order Status & Fulfillment
            </h3>
            {saving && (
              <span className="text-body-xs text-charcoal-400 animate-pulse font-sans">
                Saving changes...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fulfillment Status Select & Quick Buttons */}
            <div className="space-y-3">
              <label className="block text-body-xs font-sans text-charcoal-600 font-medium">
                Order Fulfillment Status
              </label>
              <select
                value={order.status || 'Pending'}
                onChange={(e) => updateStatus('status', e.target.value)}
                disabled={saving}
                className="w-full bg-cream border border-border px-3 py-2 text-body-sm text-charcoal font-sans rounded-none focus:outline-none focus:border-warmBrown transition-colors"
              >
                {orderStatuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={saving || order.status === 'Processing'}
                  onClick={() => updateStatus('status', 'Processing')}
                  className="px-3 py-1 bg-blush-light text-blush-dark hover:bg-blush border border-blush-dark/30 text-label-xs uppercase tracking-wider font-sans transition-colors cursor-pointer disabled:opacity-50"
                >
                  Mark Processing
                </button>
                <button
                  type="button"
                  disabled={saving || order.status === 'Shipped'}
                  onClick={() => updateStatus('status', 'Shipped')}
                  className="px-3 py-1 bg-sage-light text-sage-dark hover:bg-sage border border-sage-dark/30 text-label-xs uppercase tracking-wider font-sans transition-colors cursor-pointer disabled:opacity-50"
                >
                  Mark Shipped
                </button>
                <button
                  type="button"
                  disabled={saving || order.status === 'Delivered'}
                  onClick={() => updateStatus('status', 'Delivered')}
                  className="px-3 py-1 bg-sage text-charcoal hover:opacity-90 border border-charcoal/20 text-label-xs uppercase tracking-wider font-sans transition-colors cursor-pointer disabled:opacity-50"
                >
                  Mark Delivered
                </button>
                <button
                  type="button"
                  disabled={saving || order.status === 'Cancelled'}
                  onClick={() => updateStatus('status', 'Cancelled')}
                  className="px-3 py-1 bg-charcoal-200 text-charcoal-600 hover:bg-charcoal hover:text-ivory text-label-xs uppercase tracking-wider font-sans transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            {/* Payment Status Select */}
            <div className="space-y-3">
              <label className="block text-body-xs font-sans text-charcoal-600 font-medium">
                Payment Status
              </label>
              <select
                value={order.paymentStatus || 'pending'}
                onChange={(e) => updateStatus('paymentStatus', e.target.value)}
                disabled={saving}
                className="w-full bg-cream border border-border px-3 py-2 text-body-sm text-charcoal font-sans rounded-none focus:outline-none focus:border-warmBrown transition-colors capitalize"
              >
                {paymentStatuses.map((st) => (
                  <option key={st} value={st} className="capitalize">{st}</option>
                ))}
              </select>

              <p className="text-body-xs text-charcoal-400 font-light pt-1">
                Updating payment status reflects immediately on admin records and customer transaction view.
              </p>
            </div>
          </div>
        </div>

        {/* Return Policy Agreement & Request Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Razorpay Gateway Verification & Refund Controls */}
        <div className="p-4 bg-ivory border border-border/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-xs font-sans">
            <div>
              <span className="text-label-xs uppercase tracking-[0.16em] text-warmBrown font-medium block">Razorpay Verification Details</span>
              <p className="text-charcoal font-medium mt-1">
                Order ID: <code className="bg-sand/30 px-1 py-0.5 rounded">{order.razorpayOrderId || 'N/A'}</code>
                {' · '}
                Payment ID: <code className="bg-sand/30 px-1 py-0.5 rounded">{order.razorpayPaymentId || 'N/A'}</code>
              </p>
              {order.paymentVerifiedAt && (
                <p className="text-charcoal-400 font-light mt-0.5">
                  Verified at: {new Date(order.paymentVerifiedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {order.paymentStatus === 'paid' && (
              <button
                type="button"
                onClick={handleRefund}
                disabled={saving}
                className="px-4 py-2 bg-warmBrown/10 text-warmBrown hover:bg-warmBrown hover:text-ivory border border-warmBrown/30 text-label-xs uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer self-start sm:self-auto"
              >
                Refund via Razorpay
              </button>
            )}
          </div>
        </div>

        {msg && (
          <div className={`p-3 text-body-xs font-sans rounded-none ${msg.type === 'success' ? 'text-sage-dark bg-sage-light border border-sage-dark/20' : 'text-warmBrown bg-blush-light border border-warmBrown/20'}`}>
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
            {order.couponCode && (
              <div className="flex justify-between text-sage-dark font-medium">
                <span>Coupon ({order.couponCode})</span>
                <span>−{currencySymbol}{order.discountAmount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-600"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `${currencySymbol}${order.shipping}`}</span></div>
            <div className="flex justify-between text-charcoal font-medium pt-2 border-t border-border/60"><span>Total</span><span className="text-body-sm">{currencySymbol}{order.total?.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="space-y-6">
          <div className="bg-cream border border-border p-6">
            <h3 className="font-serif font-light text-charcoal text-lg mb-4 border-b border-border pb-3">Contact Info</h3>
            <div className="space-y-2 text-body-xs font-sans font-light text-charcoal">
              <p><span className="text-charcoal-400">Name:</span> <span className="font-medium text-charcoal">{order.contactInfo?.name || order.user?.name || 'Customer'}</span></p>
              <p><span className="text-charcoal-400">Email:</span> {order.contactInfo?.email}</p>
              <p><span className="text-charcoal-400">Phone:</span> {order.contactInfo?.phone}</p>
            </div>
          </div>
          <div className="bg-cream border border-border p-6">
            <h3 className="font-serif font-light text-charcoal text-lg mb-4 border-b border-border pb-3">Shipping Address</h3>
            <div className="text-body-xs font-sans font-light text-charcoal space-y-1">
              <p className="font-medium text-charcoal">
                {order.shippingAddress?.street || order.shippingAddress?.line1 || 'N/A'}
              </p>
              {order.shippingAddress?.line2 && (
                <p className="text-charcoal-600">{order.shippingAddress?.line2}</p>
              )}
              <p className="text-charcoal-600">
                {order.shippingAddress?.city}{order.shippingAddress?.city && order.shippingAddress?.state ? ', ' : ''}
                {order.shippingAddress?.state} {order.shippingAddress?.pincode}
              </p>
              <p className="text-charcoal-400 font-normal">{order.shippingAddress?.country || 'India'}</p>
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
