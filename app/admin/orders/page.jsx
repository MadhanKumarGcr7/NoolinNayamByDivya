'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

const statuses = ['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColors = {
  Pending: 'bg-sand/40 text-warmBrown',
  Processing: 'bg-blush-light text-blush-dark',
  Shipped: 'bg-sage-light text-sage-dark',
  Delivered: 'bg-sage text-charcoal',
  Cancelled: 'bg-charcoal-200 text-charcoal-600',
};

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState(initialStatus);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchOrders = async (p = 1, s = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (s) params.set('status', s);
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(page, status);
  }, [page, status]);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`
              px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium whitespace-nowrap border transition-colors
              ${status === s
                ? 'bg-charcoal text-ivory border-charcoal'
                : 'bg-transparent text-charcoal-400 border-border hover:border-charcoal hover:text-charcoal'}
            `}
          >
            {s || 'All Orders'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-cream border border-border p-8 text-center">
          <p className="text-body-sm text-charcoal-400 font-light">No orders found.</p>
        </div>
      ) : (
        <div className="bg-cream border border-border overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Order ID</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Customer</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden sm:table-cell">Items</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Total</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-ivory/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order._id}`} className="text-body-xs font-sans font-medium text-charcoal hover:text-warmBrown transition-colors">
                      #{order.orderNumber || `NY-${new Date(order.createdAt).getFullYear()}${String(new Date(order.createdAt).getMonth() + 1).padStart(2, '0')}-${order._id?.slice(-4).toUpperCase()}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-body-xs text-charcoal font-light">
                    {order.contactInfo?.name || order.guestInfo?.name || 'Guest'}
                  </td>
                  <td className="px-4 py-3 text-body-xs text-charcoal-600 font-light hidden sm:table-cell">
                    {order.items?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-sans font-medium text-charcoal">
                    {currencySymbol}{order.total?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-body-xs text-charcoal-400 font-light hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                      {order.paymentStatus && (
                        <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] font-sans font-medium ${
                          order.paymentStatus === 'paid' ? 'bg-sage-light text-sage-dark' :
                          order.paymentStatus === 'refunded' ? 'bg-charcoal-200 text-charcoal-600' :
                          order.paymentStatus === 'failed' ? 'bg-blush-light text-blush-dark' :
                          'bg-sand/40 text-warmBrown'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      )}
                      {order.returnRequested && (
                        <span className="px-1.5 py-0.5 bg-warmBrown/10 text-warmBrown border border-warmBrown/30 text-[9px] uppercase tracking-[0.12em] font-sans font-medium">
                          Return Requested
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-4 py-2 text-label-md text-charcoal-400 hover:text-charcoal disabled:opacity-30 transition-colors">
            ← Previous
          </button>
          <span className="text-body-xs text-charcoal-400">Page {page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="px-4 py-2 text-label-md text-charcoal-400 hover:text-charcoal disabled:opacity-30 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
