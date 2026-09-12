'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        const json = await res.json();
        setData(json);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};

  const cards = [
    { label: 'Total Customers', value: stats.totalCustomers || 0, href: '/admin/customers', color: 'bg-sage-light text-sage-dark' },
    { label: 'Total Orders',    value: stats.totalOrders || 0,    href: '/admin/orders',    color: 'bg-blush-light text-blush-dark' },
    { label: 'Pending Orders',  value: stats.pendingOrders || 0,  href: '/admin/orders?status=Pending', color: 'bg-sand/40 text-warmBrown' },
    { label: 'Low Stock',       value: stats.lowStockProducts || 0, href: '/admin/inventory', color: 'bg-warmBrown/10 text-warmBrown' },
  ];

  const statusColors = {
    Pending: 'bg-sand/40 text-warmBrown',
    Processing: 'bg-blush-light text-blush-dark',
    Shipped: 'bg-sage-light text-sage-dark',
    Delivered: 'bg-sage text-charcoal',
    Cancelled: 'bg-charcoal-200 text-charcoal-600',
    New: 'bg-blush-light text-warmBrown',
    Reviewed: 'bg-sand/40 text-charcoal-600',
    'In Progress': 'bg-sage-light text-sage-dark',
    Completed: 'bg-sage text-charcoal',
    Declined: 'bg-charcoal-200 text-charcoal-600',
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-cream border border-border p-5 hover:shadow-warm-md transition-shadow duration-300 group"
          >
            <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-sans mb-2">
              {card.label}
            </p>
            <p className="font-serif text-3xl font-light text-charcoal group-hover:text-warmBrown transition-colors">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-cream border border-border p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-light text-charcoal text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors font-medium">
              View All →
            </Link>
          </div>
          {(data?.recentOrders || []).length === 0 ? (
            <p className="text-body-sm text-charcoal-400 font-light py-4">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {(data?.recentOrders || []).map((order) => (
                <Link key={order._id} href={`/admin/orders/${order._id}`} className="flex items-center justify-between py-3 hover:bg-ivory/50 -mx-2 px-2 transition-colors">
                  <div>
                    <p className="text-body-xs font-sans font-medium text-charcoal">
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-body-xs text-charcoal-400 font-light">
                      {order.contactInfo?.name} · {currencySymbol}{order.total?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium ${statusColors[order.status] || ''}`}>
                    {order.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Custom Requests */}
        <div className="bg-cream border border-border p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-light text-charcoal text-xl">Custom Requests</h2>
            <Link href="/admin/custom-requests" className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors font-medium">
              View All →
            </Link>
          </div>
          {(data?.recentCustomRequests || []).length === 0 ? (
            <p className="text-body-sm text-charcoal-400 font-light py-4">No custom requests yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {(data?.recentCustomRequests || []).map((req) => (
                <div key={req._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-body-xs font-sans font-medium text-charcoal">
                      {req.name}
                    </p>
                    <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium ${statusColors[req.status] || ''}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
                    {req.productType} · {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
