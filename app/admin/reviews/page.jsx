'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5 text-warmBrown">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill={star <= rating ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/reviews?${params}`, { credentials: 'include' });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      /* ignore */
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this customer review permanently?')) return;

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-label-md uppercase tracking-[0.18em] text-warmBrown font-medium">Customer Feedback</p>
          <h1 className="font-serif font-light text-charcoal text-display-xs">Product Reviews & Ratings</h1>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-ivory border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviewer, product, or comment..."
              className="bg-cream border border-border px-3 py-1.5 text-body-sm font-sans focus:outline-none placeholder:text-charcoal-400"
            />
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>

          <div className="flex gap-1">
            {['all', 'approved', 'pending', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-label-md uppercase tracking-[0.12em] transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-charcoal text-ivory'
                    : 'bg-cream text-charcoal-600 hover:bg-oatmeal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <p className="text-body-xs text-charcoal-400 font-light">
          {reviews.length} review{reviews.length === 1 ? '' : 's'} total
        </p>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <p className="text-body-sm text-charcoal-600 font-light">No customer reviews submitted yet.</p>
        </div>
      ) : (
        <div className="bg-ivory border border-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream/40 text-label-md uppercase tracking-[0.14em] text-charcoal-600">
                <th className="py-3.5 px-4 font-medium">Rating</th>
                <th className="py-3.5 px-4 font-medium">Product</th>
                <th className="py-3.5 px-4 font-medium">Customer Details</th>
                <th className="py-3.5 px-4 font-medium">Feedback & Review</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-body-sm font-sans">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-cream/20 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StarRating rating={r.rating} />
                    <span className="text-body-xs text-charcoal-400 font-mono mt-0.5 block">{r.rating} / 5</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal whitespace-nowrap">
                    {r.productName}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                    <p className="font-medium text-charcoal">{r.customerName}</p>
                    <p className="text-body-xs font-mono text-charcoal-400">{r.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <p className="font-medium text-charcoal">{r.headline}</p>
                    <p className="text-body-xs text-charcoal-600 font-light mt-0.5 line-clamp-2">&ldquo;{r.comment}&rdquo;</p>
                    <span className="text-[10px] text-charcoal-400 mt-1 block">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-label-xs uppercase tracking-[0.14em] font-medium border ${
                      r.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      r.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r._id, 'approved')}
                        className="text-label-sm uppercase tracking-[0.12em] text-emerald-700 hover:underline font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(r._id, 'rejected')}
                        className="text-label-sm uppercase tracking-[0.12em] text-amber-800 hover:underline font-medium"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      className="text-label-sm uppercase tracking-[0.12em] text-rose-600 hover:underline font-medium"
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
