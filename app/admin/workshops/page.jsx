'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal]   = useState({ isOpen: false, id: null, title: '' });
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, [statusFilter]);

  async function fetchWorkshops() {
    setLoading(true);
    try {
      const url = statusFilter !== 'all' ? `/api/admin/workshops?status=${statusFilter}` : '/api/admin/workshops';
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      setWorkshops(data.workshops || []);
    } catch {
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/workshops/${deleteModal.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setWorkshops((prev) => prev.filter((w) => w._id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, title: '' });
      }
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (workshop) => {
    try {
      const copyData = {
        ...workshop,
        title: `${workshop.title} (Copy)`,
        seatsFilled: 0,
        status: 'draft',
      };
      delete copyData._id;
      delete copyData.createdAt;
      delete copyData.updatedAt;

      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyData),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchWorkshops();
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
          <p className="text-label-md uppercase tracking-[0.18em] text-warmBrown font-medium">Crochet Community</p>
          <h1 className="font-serif font-light text-charcoal text-display-xs">Workshops Management</h1>
        </div>
        <Link href="/admin/workshops/new">
          <Button variant="primary" size="md">
            + CREATE WORKSHOP
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-ivory border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'published', 'full', 'completed', 'draft', 'cancelled'].map((st) => (
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
        <p className="text-body-xs text-charcoal-400 font-light">
          Showing {workshops.length} workshop{workshops.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Workshops List Table */}
      {loading ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : workshops.length === 0 ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <p className="text-body-sm text-charcoal-600 font-light mb-4">No workshops found.</p>
          <Link href="/admin/workshops/new">
            <Button variant="secondary" size="sm">Create First Workshop</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-ivory border border-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream/40 text-label-md uppercase tracking-[0.14em] text-charcoal-600">
                <th className="py-3.5 px-4 font-medium">Workshop</th>
                <th className="py-3.5 px-4 font-medium">Date & Time</th>
                <th className="py-3.5 px-4 font-medium">Location</th>
                <th className="py-3.5 px-4 font-medium">Seats Filled</th>
                <th className="py-3.5 px-4 font-medium">Price</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-body-sm font-sans">
              {workshops.map((w) => {
                const formattedDate = new Date(w.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={w._id} className="hover:bg-cream/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-oatmeal shrink-0 border border-border overflow-hidden">
                          {w.coverImage ? (
                            <img src={w.coverImage} alt={w.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-charcoal-400">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal leading-snug">{w.title}</p>
                          <p className="text-body-xs text-charcoal-400">{w.skillLevel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                      <p className="font-medium">{formattedDate}</p>
                      <p className="text-body-xs">{w.time}</p>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600">
                      {w.isOnline ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-sky-50 text-sky-800 border border-sky-200">
                          Online
                        </span>
                      ) : (
                        <span className="truncate max-w-[150px] inline-block">{w.location}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      <span className={w.seatsFilled >= w.seatsTotal ? 'text-rose-600 font-bold' : ''}>
                        {w.seatsFilled} / {w.seatsTotal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal font-medium">
                      {w.isFree ? 'Free' : `₹${w.price?.toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-label-xs uppercase tracking-[0.14em] font-medium border ${
                        w.status === 'published' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        w.status === 'full' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        w.status === 'completed' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        w.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-cream text-charcoal-600 border-border'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/admin/workshops/${w._id}/registrations`}
                        className="text-label-sm uppercase tracking-[0.12em] text-warmBrown hover:underline font-medium"
                      >
                        Registrations ({w.seatsFilled})
                      </Link>
                      <Link
                        href={`/admin/workshops/${w._id}/edit`}
                        className="text-label-sm uppercase tracking-[0.12em] text-charcoal-600 hover:text-charcoal font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(w)}
                        className="text-label-sm uppercase tracking-[0.12em] text-charcoal-400 hover:text-charcoal font-medium"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: w._id, title: w.title })}
                        className="text-label-sm uppercase tracking-[0.12em] text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 max-w-md w-full shadow-warm-xl">
            <h3 className="font-serif text-lg text-charcoal font-light mb-2">Delete Workshop</h3>
            <p className="text-body-sm text-charcoal-600 font-light mb-6">
              Are you sure you want to delete &ldquo;{deleteModal.title}&rdquo;? All attendee registration records for this workshop will also be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
              >
                CANCEL
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-ivory border-rose-700"
                onClick={handleDelete}
                loading={deleting}
              >
                DELETE PERMANENTLY
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
