'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';

export default function AdminDesignGalleryPage() {
  const [images, setImages]           = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Upload / Add New Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [uploadFiles, setUploadFiles]         = useState([]);
  const [uploadCategory, setUploadCategory]   = useState('');
  const [uploadTags, setUploadTags]           = useState('');
  const [uploadCaption, setUploadCaption]     = useState('');
  const [uploadVisible, setUploadVisible]     = useState(true);
  const [uploadError, setUploadError]         = useState(null);

  // Category Manager Modal State
  const [showCatModal, setShowCatModal]   = useState(false);
  const [newCatName, setNewCatName]       = useState('');
  const [catError, setCatError]           = useState(null);
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Edit Modal State
  const [editingImage, setEditingImage]   = useState(null);
  const [editCaption, setEditCaption]     = useState('');
  const [editTags, setEditTags]           = useState('');
  const [editCategory, setEditCategory]   = useState('');
  const [editVisible, setEditVisible]     = useState(true);
  const [savingEdit, setSavingEdit]       = useState(false);

  // Tab State: 'images' | 'products'
  const [activeTab, setActiveTab] = useState('images');

  // Product Picker State
  const [products, setProducts]                     = useState([]);
  const [productsLoading, setProductsLoading]         = useState(false);
  const [productSearch, setProductSearch]           = useState('');
  const [productFilter, setProductFilter]           = useState('all'); // all | selected | unselected
  const [updatingProductId, setUpdatingProductId] = useState(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const catRes = await fetch('/api/admin/design-gallery/categories', { credentials: 'include' });
      const catData = await catRes.json();
      const loadedCats = (catData.categories || []).map((c) => c.name);
      setCategories(catData.categories || []);
      if (!uploadCategory && loadedCats.length > 0) {
        setUploadCategory(loadedCats[0]);
      }

      // Fetch images
      const query = new URLSearchParams();
      if (selectedCat) query.set('category', selectedCat);
      if (search) query.set('q', search);

      const imgRes = await fetch(`/api/admin/design-gallery?${query.toString()}`, { credentials: 'include' });
      const imgData = await imgRes.json();
      setImages(imgData.images || []);
    } catch (err) {
      console.error('Failed to load design gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsData = async () => {
    setProductsLoading(true);
    try {
      const query = new URLSearchParams();
      if (productSearch) query.set('q', productSearch);
      if (productFilter) query.set('filter', productFilter);

      const res = await fetch(`/api/admin/design-gallery/products?${query.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products for design gallery:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCat, search]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductsData();
    }
  }, [activeTab, productSearch, productFilter]);

  // Product Design Gallery Quick Toggle
  const handleProductGalleryToggle = async (product, newShowState) => {
    setUpdatingProductId(product.id);
    try {
      const defaultGalleryCat = categories[0]?.name || 'Finished Garments';
      const res = await fetch('/api/admin/design-gallery/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          showInDesignGallery: newShowState,
          designGalleryCategory: product.designGalleryCategory || defaultGalleryCat,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, ...data.product } : p))
        );
      }
    } catch (err) {
      console.error('Failed to update product gallery toggle:', err);
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Product Design Gallery Category Change
  const handleProductCategoryChange = async (product, newCategory) => {
    setUpdatingProductId(product.id);
    try {
      const res = await fetch('/api/admin/design-gallery/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          designGalleryCategory: newCategory,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, ...data.product } : p))
        );
      }
    } catch (err) {
      console.error('Failed to update product gallery category:', err);
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Handle Image Upload & Submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      setUploadError('Please select at least one image file.');
      return;
    }
    if (!uploadCategory) {
      setUploadError('Please select a category.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      for (const file of uploadFiles) {
        formData.append('files', file);
      }

      const uploadRes = await fetch('/api/admin/design-gallery/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.urls) {
        throw new Error(uploadData.message || 'Image upload failed.');
      }

      // Create gallery entries for each uploaded URL
      for (const url of uploadData.urls) {
        await fetch('/api/admin/design-gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: url,
            category: uploadCategory,
            tags: uploadTags,
            caption: uploadCaption,
            visible: uploadVisible,
          }),
          credentials: 'include',
        });
      }

      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadTags('');
      setUploadCaption('');
      fetchData();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Toggle Image Visibility Quick Action
  const toggleVisibility = async (img) => {
    try {
      const res = await fetch(`/api/admin/design-gallery/${img._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !img.visible }),
        credentials: 'include',
      });
      if (res.ok) {
        setImages(images.map((item) => (item._id === img._id ? { ...item, visible: !img.visible } : item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Image
  const handleDeleteImage = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item? Past custom requests will preserve their snapshot.')) return;
    try {
      const res = await fetch(`/api/admin/design-gallery/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setImages(images.filter((img) => img._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modal
  const openEditModal = (img) => {
    setEditingImage(img);
    setEditCaption(img.caption || '');
    setEditTags((img.tags || []).join(', '));
    setEditCategory(img.category || '');
    setEditVisible(img.visible ?? true);
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/design-gallery/${editingImage._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editCaption,
          tags: editTags,
          category: editCategory,
          visible: editVisible,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setImages(images.map((item) => (item._id === editingImage._id ? data.image : item)));
        setEditingImage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatSubmitting(true);
    setCatError(null);

    try {
      const res = await fetch('/api/admin/design-gallery/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to add category.');

      setNewCatName('');
      fetchData();
    } catch (err) {
      setCatError(err.message);
    } finally {
      setCatSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Delete category "${name}"? Existing images in this category will remain.`)) return;
    try {
      const res = await fetch(`/api/admin/design-gallery/categories?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif font-light text-charcoal text-3xl">Design Gallery Library</h1>
          <p className="text-body-sm text-charcoal-600 font-light mt-1">
            Upload and organize design inspiration elements (necklines, sleeves, motifs, colors) for customers to combine.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => setShowCatModal(true)}>
            Manage Categories
          </Button>
          <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
            + Add Gallery Images
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border space-x-6 sm:space-x-8">
        <button
          onClick={() => setActiveTab('images')}
          className={`pb-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'images'
              ? 'border-warmBrown text-warmBrown font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal'
          }`}
        >
          <span>🖼️ Uploaded Inspiration</span>
          <span className="px-2 py-0.5 text-[10px] bg-cream border border-border/80 rounded-xs">
            {images.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-warmBrown text-warmBrown font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal'
          }`}
        >
          <span>🛍️ Products in Gallery</span>
          <span className="px-2 py-0.5 text-[10px] bg-warmBrown/10 text-warmBrown font-medium rounded-xs border border-warmBrown/30">
            {products.filter((p) => p.showInDesignGallery).length} Selected
          </span>
        </button>
      </div>

      {/* TAB 1: UPLOADED IMAGES VIEW */}
      {activeTab === 'images' && (
        <>
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-cream p-4 border border-border">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search captions or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 bg-ivory border border-border text-body-xs font-sans focus:outline-none focus:border-warmBrown"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCat('')}
                className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-colors border ${
                  selectedCat === ''
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal'
                }`}
              >
                All ({images.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCat(cat.name)}
                  className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium transition-colors border whitespace-nowrap ${
                    selectedCat === cat.name
                      ? 'bg-charcoal text-ivory border-charcoal'
                      : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid View */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-body-xs text-charcoal-400 font-light">Loading design inspiration gallery...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="bg-cream border border-border p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-warmBrown/10 text-warmBrown flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-light text-charcoal mb-2">No Gallery Images Found</h3>
              <p className="text-body-xs text-charcoal-600 font-light mb-6">
                Upload design elements such as necklines, sleeves, or pattern motifs to build your customer inspiration library.
              </p>
              <Button variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
                Upload Inspiration Images
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {images.map((img) => (
                <div
                  key={img._id}
                  className={`group bg-cream border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-warm-xs ${
                    !img.visible ? 'opacity-60 border-dashed border-charcoal-300' : 'border-border hover:shadow-warm-md'
                  }`}
                >
                  {/* Image Thumbnail Container */}
                  <div className="relative aspect-square bg-ivory border-b border-border overflow-hidden">
                    <Image
                      src={img.imageUrl}
                      alt={img.caption || 'Design Inspiration'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-ivory/90 backdrop-blur-sm text-charcoal text-[10px] uppercase tracking-[0.14em] font-sans font-medium border border-border shadow-sm">
                      {img.category}
                    </span>

                    {/* Visibility Badge */}
                    {!img.visible && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-charcoal text-ivory text-[9px] uppercase tracking-[0.14em] font-sans font-medium shadow-sm">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Information & Actions Footer */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p className="text-body-xs font-sans font-medium text-charcoal line-clamp-1">
                        {img.caption || 'Untitled Detail'}
                      </p>
                      {img.tags && img.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {img.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] text-charcoal-500 font-light bg-ivory px-1.5 py-0.5 border border-border/50">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-body-xs font-sans">
                      <button
                        onClick={() => toggleVisibility(img)}
                        className="text-label-md uppercase tracking-[0.14em] text-charcoal-600 hover:text-warmBrown transition-colors"
                      >
                        {img.visible ? 'Hide' : 'Show'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(img)}
                          className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img._id)}
                          className="text-label-md uppercase tracking-[0.14em] text-blush-dark hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CATALOG PRODUCTS VIEW */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Products Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-cream p-4 border border-border">
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-4 py-2 bg-ivory border border-border text-body-xs font-sans focus:outline-none focus:border-warmBrown"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-xs font-sans text-charcoal-500">Filter:</span>
              <button
                onClick={() => setProductFilter('all')}
                className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium border ${
                  productFilter === 'all'
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setProductFilter('selected')}
                className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium border ${
                  productFilter === 'selected'
                    ? 'bg-warmBrown text-ivory border-warmBrown'
                    : 'bg-ivory text-charcoal-600 border-border hover:border-warmBrown'
                }`}
              >
                In Gallery ({products.filter((p) => p.showInDesignGallery).length})
              </button>
              <button
                onClick={() => setProductFilter('unselected')}
                className={`px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium border ${
                  productFilter === 'unselected'
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-ivory text-charcoal-600 border-border hover:border-charcoal'
                }`}
              >
                Not In Gallery
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-body-xs text-charcoal-400 font-light">Loading catalog products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-cream border border-border p-12 text-center max-w-md mx-auto">
              <h3 className="font-serif text-xl font-light text-charcoal mb-2">No Matching Products</h3>
              <p className="text-body-xs text-charcoal-600 font-light">
                No catalog products found matching your current search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => {
                const isUpdating = updatingProductId === prod.id;
                const defaultCat = categories[0]?.name || 'Finished Garments';
                const currentGalleryCat = prod.designGalleryCategory || defaultCat;

                return (
                  <div
                    key={prod.id}
                    className={`bg-cream border p-4 transition-all duration-300 flex items-start gap-4 rounded-xs shadow-warm-xs ${
                      prod.showInDesignGallery
                        ? 'border-warmBrown/60 bg-warmBrown/5'
                        : 'border-border opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 bg-ivory border border-border flex-shrink-0 overflow-hidden">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-body-sm font-sans font-medium text-charcoal truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] uppercase font-sans tracking-wider px-1.5 py-0.5 bg-ivory border border-border/60 text-charcoal-500 flex-shrink-0">
                            {prod.categoryName}
                          </span>
                        </div>
                        <p className="text-body-xs font-sans text-warmBrown font-medium mt-0.5">
                          ₹{prod.price}
                        </p>
                      </div>

                      {/* Toggle & Dropdown Section */}
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        {/* Toggle Checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer text-body-xs font-sans font-medium text-charcoal select-none">
                          <input
                            type="checkbox"
                            checked={prod.showInDesignGallery}
                            disabled={isUpdating}
                            onChange={(e) => handleProductGalleryToggle(prod, e.target.checked)}
                            className="w-4 h-4 text-warmBrown border-border rounded focus:ring-warmBrown cursor-pointer"
                          />
                          <span>Show in Design Gallery</span>
                          {isUpdating && (
                            <div className="w-3 h-3 border-2 border-warmBrown border-t-transparent rounded-full animate-spin ml-auto" />
                          )}
                        </label>

                        {/* Gallery Category Selector */}
                        {prod.showInDesignGallery && (
                          <div className="flex items-center gap-2 pt-1 animate-fade-in">
                            <span className="text-[11px] font-sans text-charcoal-500 flex-shrink-0">
                              Gallery Section:
                            </span>
                            <select
                              value={currentGalleryCat}
                              disabled={isUpdating}
                              onChange={(e) => handleProductCategoryChange(prod, e.target.value)}
                              className="w-full text-[11px] font-sans bg-ivory border border-border px-2 py-1 focus:outline-none focus:border-warmBrown text-charcoal"
                            >
                              {categories.map((c) => (
                                <option key={c._id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 sm:p-8 max-w-lg w-full shadow-warm-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
              <h3 className="font-serif font-light text-charcoal text-xl">Upload Inspiration Images</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-charcoal-400 hover:text-charcoal text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* File Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal-600">
                  Select Reference Image(s) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  required
                  onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  className="w-full text-body-xs font-sans text-charcoal p-2 border border-border bg-cream"
                />
                <p className="text-body-xs text-charcoal-400 font-light">
                  Supports multiple uploads at once (.jpg, .png, .webp).
                </p>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Select
                  label="Category *"
                  id="upload-category"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Caption */}
              <Input
                label="Caption / Title (Optional)"
                id="upload-caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="e.g. Scalloped Floral Neckline"
              />

              {/* Tags */}
              <Input
                label="Tags (Comma-Separated)"
                id="upload-tags"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="e.g. scalloped, floral, puff sleeve, pastel"
              />

              {/* Visible Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="upload-visible"
                  checked={uploadVisible}
                  onChange={(e) => setUploadVisible(e.target.checked)}
                  className="w-4 h-4 accent-warmBrown"
                />
                <label htmlFor="upload-visible" className="text-body-sm font-sans text-charcoal font-light cursor-pointer">
                  Visible in customer custom order inspiration picker
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-blush-light text-warmBrown border border-blush text-body-xs font-sans">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" size="md" type="button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" loading={uploading}>
                  Save to Gallery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingImage && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 sm:p-8 max-w-lg w-full shadow-warm-xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
              <h3 className="font-serif font-light text-charcoal text-xl">Edit Gallery Item</h3>
              <button onClick={() => setEditingImage(null)} className="text-charcoal-400 hover:text-charcoal text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="relative w-24 h-24 bg-cream border border-border mx-auto overflow-hidden">
                <Image src={editingImage.imageUrl} alt="Edit thumbnail" fill className="object-cover" />
              </div>

              <Select
                label="Category *"
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Caption / Label"
                id="edit-caption"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
              />

              <Input
                label="Tags (Comma-Separated)"
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-visible"
                  checked={editVisible}
                  onChange={(e) => setEditVisible(e.target.checked)}
                  className="w-4 h-4 accent-warmBrown"
                />
                <label htmlFor="edit-visible" className="text-body-sm font-sans text-charcoal font-light cursor-pointer">
                  Visible in customer inspiration gallery
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" size="md" type="button" onClick={() => setEditingImage(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" loading={savingEdit}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGER MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 sm:p-8 max-w-md w-full shadow-warm-xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
              <h3 className="font-serif font-light text-charcoal text-xl">Manage Design Categories</h3>
              <button onClick={() => setShowCatModal(false)} className="text-charcoal-400 hover:text-charcoal text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Add New Category */}
              <form onSubmit={handleAddCategory} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="New Category Name"
                    id="new-category"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Buttons & Fasteners"
                  />
                </div>
                <Button variant="primary" size="md" type="submit" loading={catSubmitting}>
                  Add
                </Button>
              </form>

              {catError && (
                <div className="p-2 bg-blush-light text-warmBrown border border-blush text-body-xs font-sans">
                  {catError}
                </div>
              )}

              {/* Existing Categories List */}
              <div className="border border-border bg-cream divide-y divide-border/60 max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat._id} className="p-3 flex items-center justify-between text-body-xs font-sans">
                    <span className="text-charcoal font-medium">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="text-blush-dark hover:text-red-700 text-label-md uppercase tracking-[0.14em]"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-right">
                <Button variant="secondary" size="md" onClick={() => setShowCatModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
