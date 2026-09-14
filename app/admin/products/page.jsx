'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DeleteProductModal from '@/components/admin/DeleteProductModal';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

const categories = ['all', 'crochet', 'kidswear', 'babywear', 'custom'];
const statusOptions = ['all', 'active', 'draft', 'hidden'];

const statusColors = {
  active: 'bg-sage-light text-sage-dark',
  draft:  'bg-sand/40 text-warmBrown',
  hidden: 'bg-charcoal-200 text-charcoal-600',
  deleted: 'bg-red-100 text-red-800',
};

export default function AdminProductsPage() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
  const [deleting, setDeleting]       = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/products?${params}`, { credentials: 'include' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [category, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Quick action: Toggle Visibility (Active <-> Hidden)
  const toggleVisibility = async (product) => {
    const newStatus = product.status === 'hidden' ? 'active' : 'hidden';
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, status: newStatus } : p))
        );
      }
    } catch { /* */ }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteModal.productId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteModal.productId));
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
      }
    } catch { /* */ }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-light text-charcoal text-2xl">Products ({products.length})</h2>
          <p className="text-body-xs text-charcoal-400 font-light mt-0.5">Manage your catalog, stock, and live storefront availability.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal text-ivory text-label-md uppercase tracking-[0.16em] font-sans font-medium hover:bg-warmBrown transition-colors"
        >
          + Add New Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-cream border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 bg-ivory border border-border text-charcoal text-body-sm font-sans font-light focus:outline-none focus:border-charcoal"
          />
          <button type="submit" className="px-4 py-2 bg-charcoal text-ivory text-label-sm uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-ivory border border-border text-body-xs font-sans text-charcoal capitalize cursor-pointer focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-ivory border border-border text-body-xs font-sans text-charcoal capitalize cursor-pointer focus:outline-none"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-cream border border-border p-12 text-center max-w-md mx-auto">
          <h3 className="font-serif font-light text-charcoal text-xl mb-2">No Products Found</h3>
          <p className="text-body-sm text-charcoal-600 font-light mb-6">Create your first product or clear filters.</p>
          <Link href="/admin/products/new" className="inline-block px-6 py-3 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em]">
            Add Product Now
          </Link>
        </div>
      ) : (
        <div className="bg-cream border border-border overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Product</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Price</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-center">Total Stock</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-center">Status</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((product) => {
                const isLow = product.stock <= (product.lowStockThreshold || 5);
                const isOut = product.stock <= 0;

                return (
                  <tr key={product._id} className={`transition-colors ${isOut ? 'bg-warmBrown/10' : isLow ? 'bg-warmBrown/5' : 'hover:bg-ivory/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-ivory border border-border/60 flex-shrink-0 relative overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-oatmeal flex items-center justify-center text-[10px] text-charcoal-400">No img</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-body-sm font-sans font-medium text-charcoal line-clamp-1">{product.name}</p>
                            {product.customizable && (
                              <span className="px-1.5 py-0.5 text-[10px] font-sans uppercase tracking-wider font-semibold bg-warmBrown/15 text-warmBrown border border-warmBrown/30 rounded-xs flex-shrink-0" title="Available for Customization in Customization List">
                                ✨ Customizable
                              </span>
                            )}
                          </div>
                          <p className="text-body-xs text-charcoal-400 font-light truncate max-w-xs">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-xs text-charcoal-600 font-light capitalize hidden sm:table-cell">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-body-sm font-sans font-medium text-charcoal whitespace-nowrap">
                      {currencySymbol}{product.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-body-sm font-sans font-medium ${isOut ? 'text-warmBrown font-bold' : isLow ? 'text-warmBrown' : 'text-charcoal'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium ${statusColors[product.status] || ''}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="text-label-sm uppercase tracking-[0.12em] font-sans font-medium text-charcoal-600 hover:text-warmBrown transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleVisibility(product)}
                          className="text-label-sm uppercase tracking-[0.12em] font-sans font-medium text-charcoal-600 hover:text-charcoal transition-colors"
                        >
                          {product.status === 'hidden' ? 'Unhide' : 'Hide'}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, productId: product._id, productName: product.name })}
                          className="text-label-sm uppercase tracking-[0.12em] font-sans font-medium text-warmBrown hover:text-charcoal transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
        onConfirm={confirmDelete}
        productName={deleteModal.productName}
        loading={deleting}
      />
    </div>
  );
}
