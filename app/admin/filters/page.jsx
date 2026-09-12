'use client';

import { useState, useEffect } from 'react';

const FILTER_TYPES = [
  { id: 'multi-select', label: 'Multi-Select', desc: 'Customer can pick multiple values (e.g. Sizes)' },
  { id: 'single-select', label: 'Single-Select', desc: 'Customer picks one value' },
  { id: 'color-swatch', label: 'Color Swatch', desc: 'Visual color dots with hex values' },
  { id: 'range', label: 'Price / Numeric Range', desc: 'Slider with min and max' },
];

export default function AdminFiltersPage() {
  const [filters, setFilters] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Drawer panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('multi-select');
  const [formActive, setFormActive] = useState(true);
  const [formOptions, setFormOptions] = useState([]); // [{ label, value, hex }]
  const [formRangeMin, setFormRangeMin] = useState(0);
  const [formRangeMax, setFormRangeMax] = useState(10000);
  const [formRangeUnit, setFormRangeUnit] = useState('₹');
  const [formRangeStep, setFormRangeStep] = useState(100);

  // Option input state for building list
  const [optLabel, setOptLabel] = useState('');
  const [optValue, setOptValue] = useState('');
  const [optHex, setOptHex] = useState('#FAF7F2');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, filter: null });
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [filterRes, navRes] = await Promise.all([
        fetch('/api/admin/filters', { credentials: 'include' }),
        fetch('/api/admin/navigation', { credentials: 'include' }),
      ]);
      const filterData = await filterRes.json();
      const navData = await navRes.json();

      if (filterData.filters) setFilters(filterData.filters);
      if (navData.items) setNavItems(navData.items);
    } catch (err) {
      console.error('Error loading filters data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Calculate assigned categories count for a filter
  const getAssignedCount = (filterId) => {
    return navItems.filter((item) =>
      item.assignedFilters?.some((af) => (af.filterId?._id || af.filterId) === filterId)
    ).length;
  };

  const handleOpenAdd = () => {
    setEditingFilter(null);
    setFormName('');
    setFormType('multi-select');
    setFormActive(true);
    setFormOptions([]);
    setFormRangeMin(0);
    setFormRangeMax(10000);
    setFormRangeUnit('₹');
    setFormRangeStep(100);
    setOptLabel('');
    setOptValue('');
    setOptHex('#FAF7F2');
    setError('');
    setPanelOpen(true);
  };

  const handleOpenEdit = (filter) => {
    setEditingFilter(filter);
    setFormName(filter.name);
    setFormType(filter.type);
    setFormActive(filter.active !== undefined ? filter.active : true);
    setFormOptions(filter.options || []);
    setFormRangeMin(filter.rangeMin ?? 0);
    setFormRangeMax(filter.rangeMax ?? 10000);
    setFormRangeUnit(filter.rangeUnit || '₹');
    setFormRangeStep(filter.rangeStep ?? 100);
    setOptLabel('');
    setOptValue('');
    setOptHex('#FAF7F2');
    setError('');
    setPanelOpen(true);
  };

  // Add Option helper
  const handleAddOption = () => {
    if (!optLabel.trim()) return;
    const val = optValue.trim() || optLabel.trim();
    if (formOptions.some((o) => o.value.toLowerCase() === val.toLowerCase())) return;

    setFormOptions([...formOptions, { label: optLabel.trim(), value: val, hex: optHex }]);
    setOptLabel('');
    setOptValue('');
  };

  const handleRemoveOption = (index) => {
    setFormOptions(formOptions.filter((_, i) => i !== index));
  };

  const handleSaveFilter = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Filter name is required.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: formName.trim(),
      type: formType,
      active: formActive,
      options: formType !== 'range' ? formOptions : [],
      rangeMin: formType === 'range' ? Number(formRangeMin) : 0,
      rangeMax: formType === 'range' ? Number(formRangeMax) : 10000,
      rangeUnit: formType === 'range' ? formRangeUnit : '₹',
      rangeStep: formType === 'range' ? Number(formRangeStep) : 100,
    };

    try {
      const url = editingFilter
        ? `/api/admin/filters/${editingFilter._id}`
        : '/api/admin/filters';
      const method = editingFilter ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save filter.');
      }

      showFeedback(editingFilter ? 'Filter updated successfully!' : 'Filter created successfully!');
      setPanelOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    }
    setSaving(false);
  };

  const toggleActive = async (filter) => {
    try {
      const res = await fetch(`/api/admin/filters/${filter._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !filter.active }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setFilters((prev) =>
          prev.map((f) => (f._id === filter._id ? { ...f, active: !f.active } : f))
        );
        showFeedback(`Filter "${filter.name}" status updated.`);
      }
    } catch (err) {
      console.error('Active toggle error:', err);
    }
  };

  const moveFilter = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filters.length) return;

    const newFilters = [...filters];
    const temp = newFilters[index];
    newFilters[index] = newFilters[targetIndex];
    newFilters[targetIndex] = temp;

    const reordered = newFilters.map((f, idx) => ({ id: f._id, order: idx }));
    setFilters(newFilters);

    try {
      const res = await fetch('/api/admin/filters/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reordered }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.filters) {
        setFilters(data.filters);
      }
    } catch (err) {
      console.error('Reorder error:', err);
      fetchData();
    }
  };

  const confirmDelete = async () => {
    const { filter } = deleteModal;
    if (!filter) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/filters/${filter._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Filter "${filter.name}" deleted.`);
        setDeleteModal({ isOpen: false, filter: null });
        fetchData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-light text-charcoal text-2xl">Shop Filters Management</h2>
          <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
            Define owner-managed filters, options, and swatch colors to link with navigation categories.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-warmBrown hover:bg-warmBrown-600 text-ivory text-body-xs tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Filter
        </button>
      </div>

      {/* Success Feedback Banner */}
      {successMsg && (
        <div className="bg-sage-light/60 border border-sage-dark/30 text-sage-dark text-body-xs px-4 py-3 rounded-sm shadow-xs flex items-center justify-between">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters List */}
      <div className="bg-ivory border border-sand/40 rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal-400 text-body-sm font-light">Loading filters...</div>
        ) : filters.length === 0 ? (
          <div className="p-8 text-center text-charcoal-400 text-body-sm font-light">
            No shop filters configured yet. Click <strong>+ Add New Filter</strong> above to get started.
          </div>
        ) : (
          <ul className="divide-y divide-sand/30">
            {filters.map((filter, index) => {
              const assignedCount = getAssignedCount(filter._id);

              return (
                <li
                  key={filter._id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !filter.active ? 'opacity-60 bg-sand/10' : 'hover:bg-ivory-cream/40'
                  }`}
                >
                  {/* Left: Reorder & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveFilter(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded text-charcoal-400 hover:text-warmBrown disabled:opacity-20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveFilter(index, 'down')}
                        disabled={index === filters.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-charcoal-400 hover:text-warmBrown disabled:opacity-20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <span className="w-6 h-6 rounded-full bg-sand/30 text-charcoal-500 font-mono text-body-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-charcoal text-body-sm truncate">{filter.name}</h3>
                        <span className="bg-sand/40 text-charcoal-600 text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded">
                          {filter.type}
                        </span>
                        {!filter.active && (
                          <span className="bg-red-100 text-red-700 text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-body-xs text-charcoal-400 font-light truncate mt-0.5">
                        {filter.type === 'range' ? (
                          <span>Range: {filter.rangeUnit}{filter.rangeMin} – {filter.rangeUnit}{filter.rangeMax}</span>
                        ) : (
                          <span>{filter.options?.length || 0} option(s): {filter.options?.map((o) => o.label).join(', ')}</span>
                        )}
                        <span className="ml-2 font-medium text-warmBrown">• Assigned to {assignedCount} category link(s)</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleActive(filter)}
                      className={`text-body-xs font-mono px-2.5 py-1 rounded transition-colors ${
                        filter.active
                          ? 'bg-sage-light text-sage-dark hover:bg-sage-light/80'
                          : 'bg-sand/40 text-charcoal-500 hover:bg-sand/60'
                      }`}
                    >
                      {filter.active ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(filter)}
                      className="p-1.5 text-charcoal-400 hover:text-warmBrown hover:bg-sand/20 rounded transition-colors"
                      title="Edit Filter"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setDeleteModal({ isOpen: true, filter })}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Filter"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add / Edit Drawer */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-ivory h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-sand/40 flex items-center justify-between bg-ivory-cream/50">
              <h3 className="font-serif font-light text-charcoal text-xl">
                {editingFilter ? `Edit Filter: ${editingFilter.name}` : 'Add New Filter'}
              </h3>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-charcoal-400 hover:text-charcoal p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveFilter} className="p-6 space-y-5 flex-1">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-body-xs p-3 rounded-sm">
                  {error}
                </div>
              )}

              {/* Filter Name */}
              <div>
                <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider mb-1">
                  Filter Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Size, Color, Age Group, Occasion, Material"
                  className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown"
                />
              </div>

              {/* Filter Type */}
              <div>
                <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider mb-2">
                  Filter Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setFormType(t.id)}
                      className={`p-3 text-left border rounded-sm transition-all ${
                        formType === t.id
                          ? 'border-warmBrown bg-warmBrown/5 text-warmBrown shadow-xs font-medium'
                          : 'border-sand bg-white text-charcoal-600 hover:border-sand-dark'
                      }`}
                    >
                      <div className="text-body-xs uppercase font-medium">{t.label}</div>
                      <div className="text-[11px] text-charcoal-400 font-light mt-0.5 leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options Builder (for select and color-swatch types) */}
              {formType !== 'range' && (
                <div className="space-y-3 p-4 bg-sand/20 rounded-sm border border-sand/40">
                  <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider">
                    Filter Options ({formOptions.length})
                  </label>

                  {/* Add option row */}
                  <div className="space-y-2 bg-white p-3 border border-sand rounded-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Option Label (e.g. 2-3Y, Birthday)"
                        value={optLabel}
                        onChange={(e) => {
                          setOptLabel(e.target.value);
                          if (!optValue) setOptValue(e.target.value);
                        }}
                        className="bg-ivory border border-sand px-2.5 py-1.5 text-body-xs text-charcoal rounded-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value slug (e.g. 2-3y)"
                        value={optValue}
                        onChange={(e) => setOptValue(e.target.value)}
                        className="bg-ivory border border-sand px-2.5 py-1.5 text-body-xs text-charcoal rounded-sm font-mono"
                      />
                    </div>

                    {formType === 'color-swatch' && (
                      <div className="flex items-center gap-3 pt-1">
                        <label className="text-body-xs text-charcoal-600 font-medium">Hex Color:</label>
                        <input
                          type="color"
                          value={optHex}
                          onChange={(e) => setOptHex(e.target.value)}
                          className="w-8 h-8 rounded border border-sand cursor-pointer"
                        />
                        <input
                          type="text"
                          value={optHex}
                          onChange={(e) => setOptHex(e.target.value)}
                          placeholder="#FAF7F2"
                          className="w-24 bg-ivory border border-sand px-2 py-1 text-body-xs font-mono text-charcoal rounded-sm"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="w-full bg-warmBrown text-ivory text-body-xs uppercase tracking-wider py-1.5 rounded-sm hover:bg-warmBrown-600 transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>

                  {/* Existing Options List */}
                  {formOptions.length > 0 && (
                    <ul className="divide-y divide-sand/40 bg-white border border-sand rounded-sm max-h-48 overflow-y-auto">
                      {formOptions.map((opt, i) => (
                        <li key={i} className="p-2.5 flex items-center justify-between gap-2 text-body-xs">
                          <div className="flex items-center gap-2">
                            {formType === 'color-swatch' && (
                              <span
                                className="w-4 h-4 rounded-full border border-sand shrink-0"
                                style={{ backgroundColor: opt.hex || '#ccc' }}
                              />
                            )}
                            <span className="font-medium text-charcoal">{opt.label}</span>
                            <span className="text-charcoal-400 font-mono text-[11px]">({opt.value})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(i)}
                            className="text-red-600 hover:text-red-800 text-body-xs font-bold"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Range settings */}
              {formType === 'range' && (
                <div className="space-y-3 p-4 bg-sand/20 rounded-sm border border-sand/40">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-body-xs font-medium text-charcoal-600 mb-1">Min Value</label>
                      <input
                        type="number"
                        value={formRangeMin}
                        onChange={(e) => setFormRangeMin(e.target.value)}
                        className="w-full bg-white border border-sand px-3 py-1.5 text-body-sm text-charcoal rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-body-xs font-medium text-charcoal-600 mb-1">Max Value</label>
                      <input
                        type="number"
                        value={formRangeMax}
                        onChange={(e) => setFormRangeMax(e.target.value)}
                        className="w-full bg-white border border-sand px-3 py-1.5 text-body-sm text-charcoal rounded-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-body-xs font-medium text-charcoal-600 mb-1">Unit Symbol</label>
                      <input
                        type="text"
                        value={formRangeUnit}
                        onChange={(e) => setFormRangeUnit(e.target.value)}
                        className="w-full bg-white border border-sand px-3 py-1.5 text-body-sm text-charcoal rounded-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-body-xs font-medium text-charcoal-600 mb-1">Step</label>
                      <input
                        type="number"
                        value={formRangeStep}
                        onChange={(e) => setFormRangeStep(e.target.value)}
                        className="w-full bg-white border border-sand px-3 py-1.5 text-body-sm text-charcoal rounded-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded border-sand text-warmBrown focus:ring-warmBrown"
                />
                <label htmlFor="formActive" className="text-body-xs text-charcoal font-medium">
                  Active (visible on storefront filter sidebar)
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-6 flex items-center justify-end gap-3 border-t border-sand/40">
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="px-4 py-2 text-body-xs text-charcoal-600 hover:text-charcoal uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-warmBrown hover:bg-warmBrown-600 text-ivory text-body-xs uppercase tracking-wider px-5 py-2.5 rounded-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingFilter ? 'Update Filter' : 'Add Filter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.filter && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory max-w-md w-full rounded-sm p-6 shadow-xl border border-sand space-y-4">
            <h3 className="font-serif font-light text-charcoal text-xl">Delete Shop Filter</h3>
            <p className="text-body-xs text-charcoal-600">
              Are you sure you want to delete filter <strong>&quot;{deleteModal.filter.name}&quot;</strong>? It will be removed from all assigned category links and product filter fields.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, filter: null })}
                className="px-4 py-2 text-body-xs text-charcoal-600 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white text-body-xs uppercase tracking-wider px-4 py-2 rounded-sm transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
