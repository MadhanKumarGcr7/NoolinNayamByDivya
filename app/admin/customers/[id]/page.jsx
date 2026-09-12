'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

const statusColors = {
  Pending: 'bg-sand/40 text-warmBrown',
  Processing: 'bg-blush-light text-blush-dark',
  Shipped: 'bg-sage-light text-sage-dark',
  Delivered: 'bg-sage text-charcoal',
  Cancelled: 'bg-charcoal-200 text-charcoal-600',
};

export default function AdminCustomerDetailPage({ params }) {
  const id = params?.id;
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/customers/${id}`, { credentials: 'include' });
        const data = await res.json();
        setCustomer(data.customer);
        setOrders(data.orders || []);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-cream border border-border p-8 text-center">
        <p className="text-body-sm text-charcoal-400">Customer not found.</p>
        <Link href="/admin/customers" className="text-warmBrown text-label-md uppercase tracking-[0.14em] mt-4 inline-block">← Back to Customers</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors font-sans font-medium">
        ← All Customers
      </Link>

      {/* Customer Info */}
      <div className="bg-cream border border-border p-6">
        <h2 className="font-serif font-light text-charcoal text-2xl mb-4">{customer.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-body-sm font-sans">
          <div>
            <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-medium mb-1">Email</p>
            <p className="text-charcoal font-light">{customer.email}</p>
          </div>
          <div>
            <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-medium mb-1">Phone</p>
            <p className="text-charcoal font-light">{customer.phone}</p>
          </div>
          <div>
            <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-medium mb-1">Member Since</p>
            <p className="text-charcoal font-light">{new Date(customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Addresses */}
        {customer.addresses?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/60">
            <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-sans font-medium mb-3">Saved Addresses</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.addresses.map((addr, i) => (
                <div key={i} className="bg-ivory border border-border/60 p-3 text-body-xs font-sans font-light text-charcoal">
                  <p className="font-medium text-warmBrown mb-1">{addr.label}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.pincode}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="bg-cream border border-border p-6">
        <h3 className="font-serif font-light text-charcoal text-xl mb-4">
          Order History ({orders.length})
        </h3>
        {orders.length === 0 ? (
          <p className="text-body-sm text-charcoal-400 font-light">No orders from this customer.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order._id} href={`/admin/orders/${order._id}`} className="block bg-ivory border border-border/60 p-4 hover:shadow-warm-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-body-xs font-sans font-medium text-charcoal">#{order._id?.slice(-8).toUpperCase()}</p>
                  <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-body-xs text-charcoal-400 font-light">
                  <span>{order.items?.length} item(s)</span>
                  <span>{currencySymbol}{order.total?.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-body-xs text-charcoal-400 font-light mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
