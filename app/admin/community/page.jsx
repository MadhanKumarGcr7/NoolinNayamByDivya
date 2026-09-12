'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function AdminCommunityPage() {
  const [members, setMembers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  async function fetchMembers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/community?${params}`, { credentials: 'include' });
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleToggleStatus = async (memberId, currentStatus) => {
    const nextStatus = currentStatus === 'requested' ? 'added_to_group' : 'requested';
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, status: nextStatus }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m._id === memberId ? { ...m, status: nextStatus } : m))
        );
      }
    } catch {
      /* ignore */
    }
  };

  const copyPhoneNumbers = () => {
    const phones = members.map((m) => m.phone).filter(Boolean).join('\n');
    if (!phones) {
      alert('No phone numbers available to copy.');
      return;
    }
    navigator.clipboard.writeText(phones);
    alert(`Copied ${phones.split('\n').length} phone numbers to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-label-md uppercase tracking-[0.18em] text-warmBrown font-medium">WhatsApp Community</p>
          <h1 className="font-serif font-light text-charcoal text-display-xs">Community Members</h1>
        </div>
        <Button variant="secondary" size="md" onClick={copyPhoneNumbers}>
          📋 COPY PHONE NUMBERS
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-ivory border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or phone..."
              className="bg-cream border border-border px-3 py-1.5 text-body-sm font-sans focus:outline-none placeholder:text-charcoal-400"
            />
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>

          <div className="flex gap-1">
            {['all', 'requested', 'added_to_group'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-label-md uppercase tracking-[0.12em] transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-charcoal text-ivory'
                    : 'bg-cream text-charcoal-600 hover:bg-oatmeal'
                }`}
              >
                {st === 'added_to_group' ? 'Added' : st}
              </button>
            ))}
          </div>
        </div>

        <p className="text-body-xs text-charcoal-400 font-light">
          {members.length} member{members.length === 1 ? '' : 's'} logged
        </p>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : members.length === 0 ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <p className="text-body-sm text-charcoal-600 font-light">No community interest entries recorded yet.</p>
        </div>
      ) : (
        <div className="bg-ivory border border-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream/40 text-label-md uppercase tracking-[0.14em] text-charcoal-600">
                <th className="py-3.5 px-4 font-medium">Member</th>
                <th className="py-3.5 px-4 font-medium">Contact</th>
                <th className="py-3.5 px-4 font-medium">Source</th>
                <th className="py-3.5 px-4 font-medium">Date Requested</th>
                <th className="py-3.5 px-4 font-medium">Group Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-body-sm font-sans">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-cream/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    {m.name || 'Anonymous Visitor'}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600">
                    <p>{m.email || '—'}</p>
                    <p className="text-body-xs font-mono text-charcoal-400">{m.phone || '—'}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 text-label-xs uppercase tracking-[0.1em] bg-cream text-charcoal-600 border border-border">
                      {m.source?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-label-xs uppercase tracking-[0.14em] font-medium border ${
                      m.status === 'added_to_group'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {m.status === 'added_to_group' ? 'Added to WhatsApp Group' : 'Requested'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(m._id, m.status)}
                      className={`text-label-sm uppercase tracking-[0.12em] font-medium ${
                        m.status === 'added_to_group'
                          ? 'text-charcoal-400 hover:text-charcoal'
                          : 'text-warmBrown hover:underline'
                      }`}
                    >
                      {m.status === 'added_to_group' ? 'Mark as Requested' : 'Mark as Added'}
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
