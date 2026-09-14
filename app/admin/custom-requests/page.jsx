'use client';

import { useState, useEffect } from 'react';

const customStatuses = ['New', 'Reviewed', 'In Progress', 'Completed', 'Declined'];
const contactStatuses = ['New', 'Read', 'Replied', 'Archived'];

const statusColors = {
  New: 'bg-blush-light text-warmBrown',
  Reviewed: 'bg-sand/40 text-charcoal-600',
  Read: 'bg-sand/40 text-charcoal-600',
  'In Progress': 'bg-sage-light text-sage-dark',
  Replied: 'bg-sage-light text-sage-dark',
  Completed: 'bg-sage text-charcoal',
  Archived: 'bg-charcoal-200 text-charcoal-600',
  Declined: 'bg-charcoal-200 text-charcoal-600',
};

export default function AdminCustomRequestsPage() {
  const [activeTab, setActiveTab] = useState('custom-orders'); // 'custom-orders' | 'contact-messages'

  // Custom Orders State
  const [requests, setRequests] = useState([]);
  const [customFilter, setCustomFilter] = useState('');
  const [expandedCustom, setExpandedCustom] = useState(null);

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState([]);
  const [contactFilter, setContactFilter] = useState('');
  const [expandedContact, setExpandedContact] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  // Fetch Custom Orders
  const fetchRequests = async (s = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set('status', s);
      const res = await fetch(`/api/admin/custom-requests?${params}`, { credentials: 'include' });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch { /* */ }
    setLoading(false);
  };

  // Fetch Contact Messages
  const fetchContactMessages = async (s = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set('status', s);
      const res = await fetch(`/api/admin/contact-messages?${params}`, { credentials: 'include' });
      const data = await res.json();
      setContactMessages(data.messages || []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'custom-orders') {
      fetchRequests(customFilter);
    } else {
      fetchContactMessages(contactFilter);
    }
  }, [activeTab, customFilter, contactFilter]);

  const updateCustomRequest = async (id, updatePayload) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/custom-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.request) {
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...data.request } : r))
        );
      }
    } catch { /* */ }
    setSaving(null);
  };

  const updateContactStatus = async (id, newStatus) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setContactMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
        );
      }
    } catch { /* */ }
    setSaving(null);
  };

  const deleteContactMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setContactMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch { /* */ }
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-serif font-light text-charcoal text-2xl">Requests & Customer Messages</h2>
          <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
            View custom order requests and direct inquiry messages sent by customers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex bg-cream border border-border p-1">
          <button
            onClick={() => setActiveTab('custom-orders')}
            className={`px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-colors ${
              activeTab === 'custom-orders' ? 'bg-charcoal text-ivory' : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            Custom Orders ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('contact-messages')}
            className={`px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-colors ${
              activeTab === 'contact-messages' ? 'bg-charcoal text-ivory' : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            Contact Messages ({contactMessages.length})
          </button>
        </div>
      </div>

      {/* Sub-Filters */}
      {activeTab === 'custom-orders' ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {['', ...customStatuses].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setCustomFilter(s)}
              className={`px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium whitespace-nowrap border transition-colors ${
                customFilter === s
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-transparent text-charcoal-400 border-border hover:border-charcoal hover:text-charcoal'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {['', ...contactStatuses].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setContactFilter(s)}
              className={`px-4 py-2 text-label-md uppercase tracking-[0.14em] font-sans font-medium whitespace-nowrap border transition-colors ${
                contactFilter === s
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-transparent text-charcoal-400 border-border hover:border-charcoal hover:text-charcoal'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'custom-orders' ? (
        /* CUSTOM ORDERS VIEW */
        requests.length === 0 ? (
          <div className="bg-cream border border-border p-8 text-center">
            <p className="text-body-sm text-charcoal-400 font-light">No custom order requests found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req._id} className="bg-cream border border-border">
                {/* Summary row */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-ivory/50 transition-colors"
                  onClick={() => setExpandedCustom(expandedCustom === req._id ? null : req._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-body-sm font-sans font-medium text-charcoal truncate">{req.name}</p>
                      <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium flex-shrink-0 ${statusColors[req.status] || ''}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
                      {req.productType} · {req.email} · {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-charcoal-400 transition-transform ${expandedCustom === req._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {expandedCustom === req._id && (
                  <div className="pt-4 border-t border-border/60 space-y-4">
                    {/* Base Product Information */}
                    {(req.baseProductNameSnapshot || req.baseProduct) && (
                      <div className="bg-cream border border-border/80 p-3.5 rounded-xs flex items-center gap-3">
                        {req.baseProduct?.image && (
                          <img
                            src={req.baseProduct.image}
                            alt={req.baseProductNameSnapshot}
                            className="w-12 h-14 object-cover border border-border/60 flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="text-[10px] uppercase font-sans font-medium tracking-wider text-warmBrown block">
                            ✨ Base Shop Product Selected
                          </span>
                          <p className="text-body-sm font-sans font-medium text-charcoal">
                            {req.baseProductNameSnapshot || req.baseProduct?.name}
                          </p>
                          {req.baseProduct?.slug ? (
                            <a
                              href={`/shop/${req.baseProduct.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-body-xs text-warmBrown hover:underline inline-block mt-0.5"
                            >
                              View Catalog Item →
                            </a>
                          ) : (
                            <p className="text-[10px] text-charcoal-400 italic mt-0.5">Historical Snapshot (Item edited or unlisted from catalog)</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-body-xs font-sans">
                      <div><span className="text-charcoal-400 block mb-0.5">Phone</span><span className="text-charcoal font-light">{req.phone}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Product Type</span><span className="text-charcoal font-light">{req.productType}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Age/Size Range</span><span className="text-charcoal font-light">{req.ageGroup || '—'}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Custom Size</span><span className="text-charcoal font-light">{req.customSize || '—'}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Preferred Color</span><span className="text-charcoal font-light">{req.preferredColor || '—'}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Occasion</span><span className="text-charcoal font-light">{req.occasion || '—'}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Desired Date</span><span className="text-charcoal font-light">{req.desiredDate}</span></div>
                      {req.referenceImageUrl && (
                        <div><span className="text-charcoal-400 block mb-0.5">Reference Image</span><a href={req.referenceImageUrl} target="_blank" rel="noopener noreferrer" className="text-warmBrown hover:underline">View →</a></div>
                      )}
                    </div>

                    {/* Selected Design Gallery Inspiration */}
                    {req.selectedGalleryImages && req.selectedGalleryImages.length > 0 && (
                      <div className="space-y-2 border-t border-border/60 pt-3">
                        <span className="text-body-xs font-sans font-medium text-warmBrown uppercase tracking-[0.14em] block">
                          Selected Gallery Inspiration ({req.selectedGalleryImages.length})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {req.selectedGalleryImages.map((item, idx) => (
                            <div key={idx} className="bg-cream border border-border p-2 space-y-1.5 flex flex-col justify-between">
                              <div className="relative aspect-square w-full bg-ivory border border-border/60 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.imageUrl}
                                  alt={item.caption || 'Gallery detail'}
                                  className="object-cover w-full h-full"
                                />
                                {item.category && (
                                  <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-ivory/90 text-charcoal text-[9px] uppercase font-sans font-medium">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] font-sans font-medium text-charcoal line-clamp-1">
                                  {item.caption || 'Inspiration Detail'}
                                </p>
                                {item.note ? (
                                  <p className="text-[10px] text-warmBrown font-light italic mt-0.5 bg-ivory p-1 border border-border/40">
                                    Note: &quot;{item.note}&quot;
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-charcoal-400 font-light italic">No note attached</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {req.customRequirements && (
                      <div>
                        <span className="text-body-xs text-charcoal-400 block mb-1">Requirements</span>
                        <p className="text-body-sm text-charcoal font-light bg-cream border border-border/60 p-3">{req.customRequirements}</p>
                      </div>
                    )}

                    {req.additionalNotes && (
                      <div>
                        <span className="text-body-xs text-charcoal-400 block mb-1">Additional Notes</span>
                        <p className="text-body-sm text-charcoal font-light bg-cream border border-border/60 p-3">{req.additionalNotes}</p>
                      </div>
                    )}

                    {/* Owner Status, Quoted Price, & Response Form */}
                    <div className="pt-3 border-t border-border/60 space-y-3 bg-ivory p-4 border">
                      <p className="text-label-md uppercase tracking-[0.14em] font-sans font-medium text-warmBrown">
                        Owner Review & Pricing Update
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-body-xs text-charcoal-500 font-medium block mb-1">Status</label>
                          <select
                            defaultValue={req.status}
                            id={`status-${req._id}`}
                            className="w-full px-3 py-2 bg-cream border border-border text-body-xs font-sans text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
                          >
                            {customStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-body-xs text-charcoal-500 font-medium block mb-1">Quoted Price (₹)</label>
                          <input
                            type="number"
                            id={`price-${req._id}`}
                            defaultValue={req.quotedPrice || ''}
                            placeholder="e.g. 2499"
                            className="w-full px-3 py-2 bg-cream border border-border text-body-xs font-sans text-charcoal focus:outline-none focus:border-charcoal"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-body-xs text-charcoal-500 font-medium block mb-1">Owner Response Note for Customer</label>
                        <textarea
                          id={`note-${req._id}`}
                          defaultValue={req.ownerResponse || ''}
                          rows={2}
                          placeholder="e.g. Reviewed design inspiration. Yarn selected: Blush Pink. Ready to begin!"
                          className="w-full px-3 py-2 bg-cream border border-border text-body-xs font-sans text-charcoal focus:outline-none focus:border-charcoal"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={saving === req._id}
                          onClick={() => {
                            const newStatus = document.getElementById(`status-${req._id}`).value;
                            const priceVal  = document.getElementById(`price-${req._id}`).value;
                            const noteVal   = document.getElementById(`note-${req._id}`).value;
                            updateCustomRequest(req._id, {
                              status: newStatus,
                              quotedPrice: priceVal ? parseFloat(priceVal) : 0,
                              ownerResponse: noteVal,
                            });
                          }}
                          className="px-4 py-2 bg-charcoal text-ivory text-label-sm uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors"
                        >
                          {saving === req._id ? 'Saving...' : 'Save & Update Customer Status'}
                        </button>
                        {saving === req._id && <div className="w-4 h-4 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* CONTACT MESSAGES VIEW */
        contactMessages.length === 0 ? (
          <div className="bg-cream border border-border p-8 text-center">
            <p className="text-body-sm text-charcoal-400 font-light">No contact form messages found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contactMessages.map((msg) => (
              <div key={msg._id} className="bg-cream border border-border">
                {/* Summary row */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-ivory/50 transition-colors"
                  onClick={() => setExpandedContact(expandedContact === msg._id ? null : msg._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-body-sm font-sans font-medium text-charcoal truncate">{msg.name}</p>
                      <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium flex-shrink-0 ${statusColors[msg.status] || ''}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
                      Subject: {msg.subject} · {msg.email} {msg.phone ? `· ${msg.phone}` : ''} · {new Date(msg.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-charcoal-400 transition-transform ${expandedContact === msg._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {expandedContact === msg._id && (
                  <div className="border-t border-border/60 p-4 bg-ivory/50 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-body-xs font-sans">
                      <div><span className="text-charcoal-400 block mb-0.5">Email</span><a href={`mailto:${msg.email}`} className="text-warmBrown hover:underline">{msg.email}</a></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Phone</span><span className="text-charcoal font-light">{msg.phone || '—'}</span></div>
                      <div><span className="text-charcoal-400 block mb-0.5">Date Received</span><span className="text-charcoal font-light">{new Date(msg.createdAt).toLocaleString('en-IN')}</span></div>
                    </div>

                    <div>
                      <span className="text-body-xs text-charcoal-400 block mb-1">Subject</span>
                      <p className="text-body-sm font-sans font-medium text-charcoal">{msg.subject}</p>
                    </div>

                    <div>
                      <span className="text-body-xs text-charcoal-400 block mb-1">Message Content</span>
                      <p className="text-body-sm text-charcoal font-light bg-cream border border-border/60 p-4 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>

                    {/* Actions & Status update */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60">
                      <div className="flex items-center gap-3">
                        <label className="text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Update Status:</label>
                        <select
                          value={msg.status}
                          onChange={(e) => updateContactStatus(msg._id, e.target.value)}
                          disabled={saving === msg._id}
                          className="px-3 py-1.5 bg-cream border border-border text-body-xs font-sans text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
                        >
                          {contactStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {saving === msg._id && <div className="w-4 h-4 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />}
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                          className="px-4 py-1.5 bg-charcoal text-ivory text-label-sm uppercase tracking-[0.12em] font-medium hover:bg-warmBrown transition-colors"
                        >
                          Reply via Email
                        </a>
                        <button
                          onClick={() => deleteContactMessage(msg._id)}
                          disabled={saving === msg._id}
                          className="px-4 py-1.5 border border-red-300 text-red-700 text-label-sm uppercase tracking-[0.12em] font-medium hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
