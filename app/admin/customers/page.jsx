'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchCustomers = async (p = 1, s = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (s) params.set('search', s);
      const res = await fetch(`/api/admin/customers?${params}`, { credentials: 'include' });
      const data = await res.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination || {});
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers(page, search);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(1, search);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2.5 bg-ivory border border-border text-charcoal text-body-sm font-sans font-light placeholder:text-charcoal-200 focus:outline-none focus:border-charcoal transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em] font-sans font-medium hover:bg-warmBrown transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-cream border border-border p-8 text-center">
          <p className="text-body-sm text-charcoal-400 font-light">No customers found.</p>
        </div>
      ) : (
        <div className="bg-cream border border-border overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Name</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Email</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-center">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-ivory/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c._id}`} className="text-body-sm font-sans font-medium text-charcoal hover:text-warmBrown transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-body-xs text-charcoal-600 font-light">{c.email}</td>
                  <td className="px-4 py-3 text-body-xs text-charcoal-600 font-light hidden sm:table-cell">{c.phone}</td>
                  <td className="px-4 py-3 text-body-xs text-charcoal-400 font-light hidden md:table-cell">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-sans font-medium text-charcoal text-center">{c.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-body-xs text-charcoal-400 font-sans">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
