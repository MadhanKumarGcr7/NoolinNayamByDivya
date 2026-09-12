'use client';

import { useState, useEffect } from 'react';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/inventory', { credentials: 'include' });
        const data = await res.json();
        setProducts(data.products || []);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveStock = async (productId) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editStock }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, stock: data.product.stock } : p))
        );
        setEditing(null);
      }
    } catch { /* */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 text-body-xs font-sans text-charcoal-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-warmBrown/60" />
          Low Stock (≤ threshold)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sage" />
          In Stock
        </span>
      </div>

      {products.length === 0 ? (
        <div className="bg-cream border border-border p-8 text-center">
          <p className="text-body-sm text-charcoal-400 font-light">No products in inventory.</p>
        </div>
      ) : (
        <div className="bg-cream border border-border overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Product</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Price</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 hidden md:table-cell">Sizes</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-center">Stock</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-center">Status</th>
                <th className="px-4 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((product) => {
                const isLow = product.stock <= (product.lowStockThreshold || 5);
                const isEditing = editing === product._id;

                return (
                  <tr key={product._id} className={`transition-colors ${isLow ? 'bg-warmBrown/5' : 'hover:bg-ivory/50'}`}>
                    <td className="px-4 py-3">
                      <p className="text-body-sm font-sans font-medium text-charcoal">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-body-xs text-charcoal-600 font-light capitalize hidden sm:table-cell">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-body-sm font-sans font-medium text-charcoal">
                      {currencySymbol}{product.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-body-xs text-charcoal-400 font-light hidden md:table-cell">
                      {product.sizes?.join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={(e) => setEditStock(parseInt(e.target.value, 10) || 0)}
                          className="w-16 px-2 py-1 bg-ivory border border-border text-body-sm font-sans text-center text-charcoal focus:outline-none focus:border-charcoal"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-body-sm font-sans font-medium ${isLow ? 'text-warmBrown' : 'text-charcoal'}`}>
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium bg-warmBrown/15 text-warmBrown">
                          Low
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-label-sm uppercase tracking-[0.12em] font-sans font-medium bg-sage-light text-sage-dark">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSaveStock(product._id)}
                            disabled={saving}
                            className="text-label-sm uppercase tracking-[0.14em] text-sage-dark hover:text-charcoal transition-colors font-medium"
                          >
                            {saving ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="text-label-sm uppercase tracking-[0.14em] text-charcoal-400 hover:text-charcoal transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditing(product._id); setEditStock(product.stock); }}
                          className="text-label-sm uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
