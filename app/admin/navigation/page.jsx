'use client';

import { useState, useEffect } from 'react';

const PRESET_PAGES = [
  { label: 'Shop (/shop)', value: '/shop' },
  { label: 'Workshops (/workshops)', value: '/workshops' },
  { label: 'Our Story (/our-story)', value: '/our-story' },
  { label: 'Contact (/contact)', value: '/contact' },
  { label: 'Custom Orders (/custom-orders)', value: '/custom-orders' },
  { label: 'Journal (/journal)', value: '/journal' },
  { label: 'Craftsmanship (/craftsmanship)', value: '/craftsmanship' },
  { label: 'FAQ (/faq)', value: '/faq' },
];

export default function AdminNavigationPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allFilters, setAllFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Drawer state for Add / Edit
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = add, object = edit

  // Form state
  const [formLabel, setFormLabel] = useState('');
  const [formLinkType, setFormLinkType] = useState('category'); // 'category' | 'page' | 'external'
  const [formCategorySlug, setFormCategorySlug] = useState('');
  const [formNewCategoryName, setFormNewCategoryName] = useState('');
  const [formPageSlug, setFormPageSlug] = useState('/shop');
  const [formCustomPageSlug, setFormCustomPageSlug] = useState('');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [formVisible, setFormVisible] = useState(true);
  const [formAssignedFilterIds, setFormAssignedFilterIds] = useState([]);

  // Inline filter creation state
  const [showInlineFilterForm, setShowInlineFilterForm] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterType, setNewFilterType] = useState('multi-select');
  const [newFilterOptLabel, setNewFilterOptLabel] = useState('');
  const [newFilterOptValue, setNewFilterOptValue] = useState('');
  const [newFilterOptHex, setNewFilterOptHex] = useState('#FAF7F2');
  const [newFilterOptions, setNewFilterOptions] = useState([]);
  const [creatingInlineFilter, setCreatingInlineFilter] = useState(false);
  const [inlineFilterMsg, setInlineFilterMsg] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, deleteCategory: false });
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [navRes, catRes, filterRes] = await Promise.all([
        fetch('/api/admin/navigation', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/filters', { credentials: 'include' }),
      ]);

      const navData = await navRes.json();
      const catData = await catRes.json();
      const filterData = await filterRes.json();

      if (navData.items) setItems(navData.items);
      if (catData.categories) setCategories(catData.categories);
      if (filterData.filters) setAllFilters(filterData.filters);
    } catch (err) {
      console.error('Failed to load navigation data:', err);
      setError('Failed to load navigation data.');
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

  // Open Add Panel
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormLabel('');
    setFormLinkType('category');
    setFormCategorySlug(categories[0]?.slug || '');
    setFormNewCategoryName('');
    setFormPageSlug('/shop');
    setFormCustomPageSlug('');
    setFormExternalUrl('');
    setFormVisible(true);
    setFormAssignedFilterIds(allFilters.map((f) => f._id));
    setError('');
    setPanelOpen(true);
  };

  // Open Edit Panel
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormLabel(item.label);
    setFormLinkType(item.linkType || 'page');
    setFormCategorySlug(item.categorySlug || '');
    setFormNewCategoryName('');
    setFormPageSlug(item.pageSlug || '/');
    setFormCustomPageSlug(item.pageSlug && !PRESET_PAGES.some((p) => p.value === item.pageSlug) ? item.pageSlug : '');
    setFormExternalUrl(item.externalUrl || '');
    setFormVisible(item.visible !== undefined ? item.visible : true);
    setFormAssignedFilterIds(
      item.assignedFilters && item.assignedFilters.length > 0
        ? item.assignedFilters.map((af) => af.filterId?._id || af.filterId)
        : allFilters.map((f) => f._id)
    );
    setError('');
    setShowInlineFilterForm(false);
    setInlineFilterMsg('');
    setPanelOpen(true);
  };

  const handleAddInlineOption = () => {
    if (!newFilterOptLabel.trim()) return;
    const val = newFilterOptValue.trim() || newFilterOptLabel.trim();
    if (newFilterOptions.some((o) => o.value.toLowerCase() === val.toLowerCase())) return;

    setNewFilterOptions([...newFilterOptions, { label: newFilterOptLabel.trim(), value: val, hex: newFilterOptHex }]);
    setNewFilterOptLabel('');
    setNewFilterOptValue('');
  };

  const handleCreateInlineFilter = async () => {
    if (!newFilterName.trim()) {
      setInlineFilterMsg('Filter name is required');
      return;
    }
    setCreatingInlineFilter(true);
    setInlineFilterMsg('');
    try {
      const res = await fetch('/api/admin/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFilterName.trim(),
          type: newFilterType,
          options: newFilterOptions,
          active: true,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create filter.');
      }

      const created = data.filter;
      setAllFilters((prev) => [...prev, created]);
      setFormAssignedFilterIds((prev) => [...prev, created._id]);

      setInlineFilterMsg(`Filter "${created.name}" created and assigned to this link!`);
      setNewFilterName('');
      setNewFilterOptions([]);
      setNewFilterOptLabel('');
      setNewFilterOptValue('');
      setShowInlineFilterForm(false);
      setTimeout(() => setInlineFilterMsg(''), 4000);
    } catch (err) {
      setInlineFilterMsg(err.message || 'Error creating filter');
    }
    setCreatingInlineFilter(false);
  };

  // Submit Add / Edit Form
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formLabel.trim()) {
      setError('Label is required.');
      return;
    }

    setSaving(true);
    setError('');

    let finalCategorySlug = formCategorySlug;
    if (formLinkType === 'category') {
      if (formCategorySlug === '__NEW__') {
        if (!formNewCategoryName.trim()) {
          setError('Category name is required.');
          setSaving(false);
          return;
        }
        finalCategorySlug = formNewCategoryName.trim();
      } else if (!formCategorySlug) {
        finalCategorySlug = formLabel.trim();
      }
    }

    let finalPageSlug = formPageSlug;
    if (formLinkType === 'page' && formPageSlug === '__CUSTOM__') {
      finalPageSlug = formCustomPageSlug.trim();
      if (!finalPageSlug) {
        setError('Custom page URL path is required.');
        setSaving(false);
        return;
      }
    }

    const payload = {
      label: formLabel.trim(),
      linkType: formLinkType,
      categorySlug: finalCategorySlug,
      pageSlug: finalPageSlug,
      externalUrl: formExternalUrl.trim(),
      visible: formVisible,
      assignedFilters: formAssignedFilterIds.map((id, idx) => ({ filterId: id, order: idx })),
    };

    try {
      const url = editingItem
        ? `/api/admin/navigation/${editingItem._id}`
        : '/api/admin/navigation';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save navigation item');
      }

      showFeedback(editingItem ? 'Navigation item updated!' : 'Navigation item created!');
      setPanelOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    }
    setSaving(false);
  };

  // Quick Toggle Visibility
  const toggleVisibility = async (item) => {
    if (item.isFixed) return;
    try {
      const res = await fetch(`/api/admin/navigation/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !item.visible }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, visible: !i.visible } : i))
        );
        showFeedback(`"${item.label}" visibility updated.`);
      }
    } catch (err) {
      console.error('Visibility toggle error:', err);
    }
  };

  // Move item Up or Down
  const moveItem = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Home (index 0) stays at 0
    if (items[index].isFixed || items[targetIndex].isFixed) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate orders
    const reordered = newItems.map((item, idx) => ({
      id: item._id,
      order: idx,
    }));

    setItems(newItems);

    try {
      const res = await fetch('/api/admin/navigation/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reordered }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Reorder error:', err);
      fetchData();
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    const { item, deleteCategory } = deleteModal;
    if (!item) return;

    setDeleting(true);
    try {
      // 1. Delete Navigation Item
      const res = await fetch(`/api/admin/navigation/${item._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete item.');
      }

      // 2. If deleteCategory is checked and categorySlug exists, delete product category
      if (deleteCategory && data.categorySlug) {
        await fetch(`/api/admin/categories?slug=${encodeURIComponent(data.categorySlug)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }

      showFeedback(`"${item.label}" removed from navigation.`);
      setDeleteModal({ isOpen: false, item: null, deleteCategory: false });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete navigation item.');
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-light text-charcoal text-2xl">Navigation Links</h2>
          <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
            Manage links displayed in the storefront navigation bar. Add new categories, page links, or reorder items.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-warmBrown hover:bg-warmBrown-600 text-ivory text-body-xs tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Nav Item
        </button>
      </div>

      {/* Alert Banner */}
      <div className="bg-sand/30 border border-sand rounded-sm p-4 text-body-xs text-charcoal-600 flex items-start gap-3">
        <svg className="w-5 h-5 text-warmBrown shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="font-medium text-charcoal">Fixed items:</span> The <strong>Home</strong> link is pinned to position 1 and cannot be deleted or reordered. All other links can be renamed, reordered, hidden, or deleted. Navigation updates reflect immediately across your storefront.
        </div>
      </div>

      {/* Success Feedback Banner */}
      {successMsg && (
        <div className="bg-sage-light/60 border border-sage-dark/30 text-sage-dark text-body-xs px-4 py-3 rounded-sm shadow-xs flex items-center justify-between">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Items List */}
      <div className="bg-ivory border border-sand/40 rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal-400 text-body-sm font-light">Loading navigation items...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-charcoal-400 text-body-sm font-light">No navigation items found.</div>
        ) : (
          <ul className="divide-y divide-sand/30">
            {items.map((item, index) => {
              const isFirstEditable = index === 1 || (index === 0 && !item.isFixed);
              const isLast = index === items.length - 1;

              return (
                <li
                  key={item._id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !item.visible ? 'opacity-60 bg-sand/10' : 'hover:bg-ivory-cream/40'
                  }`}
                >
                  {/* Left: Reorder controls & Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Up / Down Order Buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={item.isFixed || isFirstEditable}
                        title="Move Up"
                        className="p-1 rounded text-charcoal-400 hover:text-warmBrown disabled:opacity-20 disabled:hover:text-charcoal-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={item.isFixed || isLast}
                        title="Move Down"
                        className="p-1 rounded text-charcoal-400 hover:text-warmBrown disabled:opacity-20 disabled:hover:text-charcoal-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Order Number Badge */}
                    <span className="w-6 h-6 rounded-full bg-sand/30 text-charcoal-500 font-mono text-body-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Item Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-charcoal text-body-sm truncate">{item.label}</h3>
                        {item.isFixed && (
                          <span className="bg-charcoal/10 text-charcoal-600 text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded">
                            Fixed
                          </span>
                        )}
                        {!item.visible && (
                          <span className="bg-sand/50 text-charcoal-600 text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-body-xs text-charcoal-400 font-light truncate mt-0.5">
                        {item.linkType === 'category' && (
                          <span className="text-warmBrown font-medium">Category: /shop?category={item.categorySlug}</span>
                        )}
                        {item.linkType === 'page' && (
                          <span className="text-charcoal-500">Page: {item.pageSlug}</span>
                        )}
                        {item.linkType === 'external' && (
                          <span className="text-sage-dark">External: {item.externalUrl}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Visibility Toggle */}
                    {!item.isFixed && (
                      <button
                        onClick={() => toggleVisibility(item)}
                        className={`text-body-xs font-mono px-2.5 py-1 rounded transition-colors ${
                          item.visible
                            ? 'bg-sage-light text-sage-dark hover:bg-sage-light/80'
                            : 'bg-sand/40 text-charcoal-500 hover:bg-sand/60'
                        }`}
                      >
                        {item.visible ? 'Visible' : 'Hidden'}
                      </button>
                    )}

                    {/* Edit Button */}
                    {!item.isFixed && (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-charcoal-400 hover:text-warmBrown hover:bg-sand/20 rounded transition-colors"
                        title="Edit Item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}

                    {/* Delete Button */}
                    {!item.isFixed && (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, item, deleteCategory: false })}
                        className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add / Edit Slide-over Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-ivory h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-sand/40 flex items-center justify-between bg-ivory-cream/50">
              <h3 className="font-serif font-light text-charcoal text-xl">
                {editingItem ? `Edit Link: ${editingItem.label}` : 'Add Navigation Link'}
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

            {/* Form */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-5 flex-1">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-body-xs p-3 rounded-sm">
                  {error}
                </div>
              )}

              {/* Label */}
              <div>
                <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Festive Edit, Accessories, Journal"
                  className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown transition-colors"
                />
              </div>

              {/* Link Type Radio */}
              <div>
                <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider mb-2">
                  Link Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'category', label: 'Product Category', desc: 'Routes to /shop?category=...' },
                    { id: 'page', label: 'Internal Page', desc: 'Routes to store page' },
                    { id: 'external', label: 'External URL', desc: 'External link' },
                  ].map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setFormLinkType(type.id)}
                      className={`p-3 text-left border rounded-sm transition-all ${
                        formLinkType === type.id
                          ? 'border-warmBrown bg-warmBrown/5 text-warmBrown shadow-xs font-medium'
                          : 'border-sand bg-white text-charcoal-600 hover:border-sand-dark'
                      }`}
                    >
                      <div className="text-body-xs uppercase tracking-wider">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Specific Fields */}
              {formLinkType === 'category' && (
                <div className="space-y-3 p-4 bg-sand/20 rounded-sm border border-sand/40">
                  <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider">
                    Select Category
                  </label>
                  <select
                    value={formCategorySlug}
                    onChange={(e) => setFormCategorySlug(e.target.value)}
                    className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown"
                  >
                    <option value="">-- Choose existing category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.label} ({cat.slug})
                      </option>
                    ))}
                    <option value="__NEW__">+ Add New Category Name</option>
                  </select>

                  {(formCategorySlug === '__NEW__' || categories.length === 0) && (
                    <div>
                      <label className="block text-body-xs font-medium text-charcoal-600 mb-1">
                        New Category Name
                      </label>
                      <input
                        type="text"
                        value={formNewCategoryName}
                        onChange={(e) => setFormNewCategoryName(e.target.value)}
                        placeholder="e.g. Winter Collection"
                        className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown"
                      />
                    </div>
                  )}
                  {/* Filters shown for this category */}
                  <div className="pt-3 border-t border-sand/40 space-y-2">
                    <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider">
                      Filters Shown For This Category
                    </label>
                    <p className="text-body-xs text-charcoal-400 font-light">
                      Select which shop filters appear on the storefront sidebar when browsing this category.
                    </p>

                    {allFilters.length === 0 ? (
                      <p className="text-body-xs text-charcoal-400 font-light italic">No filters created yet. Create filters under Shop Filters menu.</p>
                    ) : (
                      <div className="space-y-1.5 bg-white p-3 border border-sand rounded-sm max-h-40 overflow-y-auto">
                        {allFilters.map((flt) => {
                          const isChecked = formAssignedFilterIds.includes(flt._id);
                          return (
                            <label key={flt._id} className="flex items-center gap-2.5 text-body-xs text-charcoal cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormAssignedFilterIds([...formAssignedFilterIds, flt._id]);
                                  } else {
                                    setFormAssignedFilterIds(formAssignedFilterIds.filter((id) => id !== flt._id));
                                  }
                                }}
                                className="rounded border-sand text-warmBrown focus:ring-warmBrown"
                              />
                              <span className="font-medium">{flt.name}</span>
                              <span className="text-charcoal-400 font-mono text-[11px]">({flt.type})</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline New Filter Button & Sub-form */}
                    {inlineFilterMsg && (
                      <div className="text-body-xs text-warmBrown bg-warmBrown/10 p-2 rounded border border-warmBrown/30 font-medium">
                        {inlineFilterMsg}
                      </div>
                    )}

                    {!showInlineFilterForm ? (
                      <button
                        type="button"
                        onClick={() => setShowInlineFilterForm(true)}
                        className="text-body-xs font-medium text-warmBrown hover:text-warmBrown-600 underline flex items-center gap-1 pt-1"
                      >
                        + Create New Filter for this Link
                      </button>
                    ) : (
                      <div className="bg-white p-3 border border-warmBrown/40 rounded-sm space-y-3 mt-2 shadow-xs">
                        <div className="flex justify-between items-center border-b border-sand/40 pb-1.5">
                          <h4 className="text-body-xs font-medium text-charcoal uppercase tracking-wider">
                            New Filter for this Link
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowInlineFilterForm(false)}
                            className="text-charcoal-400 hover:text-charcoal text-body-xs"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-charcoal-600 uppercase mb-1">
                            Filter Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sleeve Length, Neckline, Occasion"
                            value={newFilterName}
                            onChange={(e) => setNewFilterName(e.target.value)}
                            className="w-full bg-ivory border border-sand px-2.5 py-1.5 text-body-xs text-charcoal rounded-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-charcoal-600 uppercase mb-1">
                              Filter Type
                            </label>
                            <select
                              value={newFilterType}
                              onChange={(e) => setNewFilterType(e.target.value)}
                              className="w-full bg-ivory border border-sand px-2 py-1.5 text-body-xs text-charcoal rounded-sm"
                            >
                              <option value="multi-select">Multi-Select</option>
                              <option value="single-select">Single-Select</option>
                              <option value="color-swatch">Color Swatch</option>
                            </select>
                          </div>
                        </div>

                        {/* Options Input */}
                        <div className="space-y-2 bg-sand/10 p-2.5 border border-sand/30 rounded-sm">
                          <label className="block text-[11px] font-medium text-charcoal-600 uppercase">
                            Add Options ({newFilterOptions.length})
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Option (e.g. Full Sleeves)"
                              value={newFilterOptLabel}
                              onChange={(e) => {
                                setNewFilterOptLabel(e.target.value);
                                if (!newFilterOptValue) setNewFilterOptValue(e.target.value);
                              }}
                              className="w-full bg-white border border-sand px-2 py-1 text-body-xs text-charcoal rounded-sm"
                            />
                            {newFilterType === 'color-swatch' && (
                              <input
                                type="color"
                                value={newFilterOptHex}
                                onChange={(e) => setNewFilterOptHex(e.target.value)}
                                className="w-8 h-7 border border-sand cursor-pointer rounded-sm"
                              />
                            )}
                            <button
                              type="button"
                              onClick={handleAddInlineOption}
                              className="bg-sand hover:bg-sand-dark text-charcoal text-body-xs px-2.5 py-1 rounded-sm shrink-0"
                            >
                              + Add
                            </button>
                          </div>

                          {newFilterOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {newFilterOptions.map((opt, idx) => (
                                <span key={idx} className="bg-ivory border border-sand px-2 py-0.5 text-[11px] rounded flex items-center gap-1 text-charcoal">
                                  {opt.label}
                                  <button type="button" onClick={() => setNewFilterOptions(newFilterOptions.filter((_, i) => i !== idx))} className="text-red-600 font-bold">✕</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowInlineFilterForm(false)}
                            className="px-3 py-1 text-body-xs text-charcoal-500 hover:text-charcoal"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateInlineFilter}
                            disabled={creatingInlineFilter}
                            className="bg-warmBrown hover:bg-warmBrown-600 text-ivory text-body-xs px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            {creatingInlineFilter ? 'Creating...' : 'Create & Assign Filter'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formLinkType === 'page' && (
                <div className="space-y-3 p-4 bg-sand/20 rounded-sm border border-sand/40">
                  <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider">
                    Select Target Page
                  </label>
                  <select
                    value={formPageSlug}
                    onChange={(e) => setFormPageSlug(e.target.value)}
                    className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown"
                  >
                    {PRESET_PAGES.map((page) => (
                      <option key={page.value} value={page.value}>
                        {page.label}
                      </option>
                    ))}
                    <option value="__CUSTOM__">Custom Path (e.g. /custom-path)</option>
                  </select>

                  {formPageSlug === '__CUSTOM__' && (
                    <div>
                      <label className="block text-body-xs font-medium text-charcoal-600 mb-1">
                        Custom Page Path
                      </label>
                      <input
                        type="text"
                        value={formCustomPageSlug}
                        onChange={(e) => setFormCustomPageSlug(e.target.value)}
                        placeholder="/blog/my-first-post"
                        className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown"
                      />
                    </div>
                  )}
                </div>
              )}

              {formLinkType === 'external' && (
                <div className="space-y-3 p-4 bg-sand/20 rounded-sm border border-sand/40">
                  <label className="block text-body-xs font-medium text-charcoal uppercase tracking-wider">
                    External URL
                  </label>
                  <input
                    type="url"
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    placeholder="https://instagram.com/noolinnayam"
                    className="w-full bg-white border border-sand px-3 py-2 text-body-sm text-charcoal rounded-sm focus:outline-none focus:border-warmBrown"
                  />
                </div>
              )}

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formVisible"
                  checked={formVisible}
                  onChange={(e) => setFormVisible(e.target.checked)}
                  className="rounded border-sand text-warmBrown focus:ring-warmBrown"
                />
                <label htmlFor="formVisible" className="text-body-xs text-charcoal font-medium">
                  Visible in store header immediately
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {saving ? 'Saving...' : editingItem ? 'Update Link' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory max-w-md w-full rounded-sm p-6 shadow-xl border border-sand space-y-4">
            <h3 className="font-serif font-light text-charcoal text-xl">Delete Navigation Link</h3>
            <p className="text-body-xs text-charcoal-600">
              Are you sure you want to remove <strong>&quot;{deleteModal.item.label}&quot;</strong> from your store navigation?
            </p>

            {deleteModal.item.linkType === 'category' && deleteModal.item.categorySlug && (
              <div className="bg-sand/30 border border-sand p-3 rounded-sm flex items-start gap-2">
                <input
                  type="checkbox"
                  id="deleteCategoryCheck"
                  checked={deleteModal.deleteCategory}
                  onChange={(e) => setDeleteModal({ ...deleteModal, deleteCategory: e.target.checked })}
                  className="mt-0.5 rounded border-sand text-warmBrown focus:ring-warmBrown"
                />
                <label htmlFor="deleteCategoryCheck" className="text-body-xs text-charcoal-700">
                  Also delete the product category <strong>&quot;{deleteModal.item.categorySlug}&quot;</strong> from database. (Existing products tagged with this category will remain intact).
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, item: null, deleteCategory: false })}
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
