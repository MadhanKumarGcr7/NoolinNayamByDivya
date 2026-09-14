'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SectionHeading from '@/components/ui/SectionHeading';
import FilterPanel from '@/components/shop/FilterPanel';
import ProductGrid from '@/components/shop/ProductGrid';
import SearchModal from '@/components/shop/SearchModal';
import WorkshopsSection from '@/components/sections/WorkshopsSection';
import WhatsAppCommunityCTA from '@/components/sections/WhatsAppCommunityCTA';
import Galaxy from '@/components/ui/Galaxy';
import { seedCategories } from '@/lib/seed-data';

const categorySEOConfig = {
  crochet: {
    title: 'Handmade Crochet Products | Noolin Nayam by Divya',
    description: 'Explore handmade crochet creations from Noolin Nayam by Divya, featuring unique designs carefully handcrafted with beautiful yarn, creativity and love.',
    keywords: 'handmade crochet, crochet products, crochet shop, crochet creations, crochet designs, handmade crochet items, custom crochet, crochet accessories',
    h1: 'Handmade Crochet Creations',
    subtext: 'Explore unique designs carefully handcrafted with beautiful yarn, creativity and love.',
  },
  kidswear: {
    title: 'Handmade Kids Dresses | Crochet Dresses for Kids',
    description: 'Shop beautiful handmade kids dresses from Noolin Nayam by Divya, featuring unique crochet dresses and carefully crafted designs for little ones.',
    keywords: 'kids dresses, handmade kids dresses, crochet kids dresses, crochet dresses for kids, handmade crochet dresses, kids crochet dresses, dresses for girls, handmade children\'s dresses',
    h1: 'Handmade Kids Dresses & Crochet Dresses',
    subtext: 'Shop beautiful handmade kids dresses and carefully crafted crochet designs for little ones.',
  },
  'kids-dresses': {
    title: 'Handmade Kids Dresses | Crochet Dresses for Kids',
    description: 'Shop beautiful handmade kids dresses from Noolin Nayam by Divya, featuring unique crochet dresses and carefully crafted designs for little ones.',
    keywords: 'kids dresses, handmade kids dresses, crochet kids dresses, crochet dresses for kids, handmade crochet dresses, kids crochet dresses, dresses for girls, handmade children\'s dresses',
    h1: 'Handmade Kids Dresses & Crochet Dresses',
    subtext: 'Shop beautiful handmade kids dresses and carefully crafted crochet designs for little ones.',
  },
  'kids-crochet': {
    title: 'Kids Crochet | Handmade Crochet for Kids | Noolin Nayam by Divya',
    description: 'Discover adorable handmade crochet creations for kids, crafted with care at Noolin Nayam by Divya. Explore unique designs made for little ones.',
    keywords: 'kids crochet, crochet for kids, handmade crochet for kids, crochet kids products, crochet kids accessories, crochet baby items, handmade kids crochet',
    h1: 'Handmade Crochet for Kids',
    subtext: 'Discover adorable handmade crochet creations crafted with care for little ones.',
  },
  'floral-crochet': {
    title: 'Floral Crochet & Handmade Crochet Flowers | Noolin Nayam by Divya',
    description: 'Explore beautiful floral crochet creations and handmade crochet flowers from Noolin Nayam by Divya, crafted into unique designs with love and creativity.',
    keywords: 'floral crochet, crochet flowers, handmade crochet flowers, crochet flower designs, crochet floral designs, handmade floral crochet, crochet flower accessories, crochet flower gifts',
    h1: 'Floral Crochet & Handmade Crochet Flowers',
    subtext: 'Explore beautiful floral crochet creations and handmade crochet flowers crafted with love.',
  },
  gifts: {
    title: 'Handmade Crochet Gifts | Unique Crochet Gift Ideas',
    description: 'Find unique handmade crochet gifts from Noolin Nayam by Divya, including floral crochet, kids creations and beautiful handcrafted pieces made with love.',
    keywords: 'crochet gifts, handmade crochet gifts, crochet gift ideas, unique handmade gifts, crochet gifts for kids, handmade gifts',
    h1: 'Unique Handmade Crochet Gifts',
    subtext: 'Find unique handmade crochet gifts, floral creations, and beautiful handcrafted pieces made with love.',
  },
  all: {
    title: 'Noolin Nayam by Divya | Handmade Crochet & Kids Dresses',
    description: 'Discover Noolin Nayam by Divya, a handmade crochet shop creating beautiful crochet designs, kids dresses, floral crochet, accessories and unique handmade pieces crafted with love.',
    keywords: 'handmade crochet, crochet shop, handmade crochet shop, crochet products, crochet dresses, handmade crochet dresses, kids dresses, handmade kids dresses, crochet kids dresses, crochet dresses for kids, kids crochet, handmade crochet for kids, floral crochet, crochet flowers, handmade crochet flowers, crochet floral designs, crochet flower designs, custom crochet, personalized crochet, handmade crochet gifts, unique handmade gifts, crochet accessories, handmade creations, Noolin Nayam by Divya',
    h1: 'Handcrafted Collection',
    subtext: 'Explore our curated collection of organic crochet apparel, kids dresses, and slow fashion creations.',
  },
};

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [productsList, setProductsList]       = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSizes, setSelectedSizes]       = useState([]);
  const [priceRange, setPriceRange]             = useState(10000);
  const [customFilterSelections, setCustomFilterSelections] = useState({});
  const [sortBy, setSortBy]                     = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);

  // Sync category param if present in URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Update dynamic document head for SEO when selectedCategory changes
  useEffect(() => {
    const seo = categorySEOConfig[selectedCategory] || categorySEOConfig.all;
    if (typeof document !== 'undefined') {
      document.title = seo.title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = seo.description;

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = seo.keywords;
    }
  }, [selectedCategory]);

  // Fetch live active products from MongoDB API
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProductsList(data.products || []);
      } catch {
        setProductsList([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setPriceRange(10000);
    setCustomFilterSelections({});
  };

  const handleCustomFilterChange = (filterSlug, values) => {
    setCustomFilterSelections((prev) => ({
      ...prev,
      [filterSlug]: values,
    }));
  };

  // Filter & sort logic over live products
  const filteredProducts = useMemo(() => {
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return productsList
      .filter((product) => {
        if (selectedCategory !== 'all') {
          const normCat = norm(selectedCategory);

          if (selectedCategory === 'new-arrivals' && !product.newArrival) return false;
          if (selectedCategory === 'custom' && !product.customizable) return false;
          if (selectedCategory === 'crochet' && normCat === 'crochet') {
            const isCrochet = norm(product.category) === 'crochet' || product.tags?.some((t) => norm(t) === 'crochet');
            if (!isCrochet) return false;
          } else if (['kidswear', 'kids-dresses'].includes(selectedCategory)) {
            const isKid = norm(product.category) === 'kidswear' || product.subcategory === 'dresses' || product.tags?.some((t) => ['kids', 'dress', 'frock'].includes(t.toLowerCase()));
            if (!isKid) return false;
          } else if (selectedCategory === 'kids-crochet') {
            const isKidsCrochet = norm(product.category) === 'crochet' || norm(product.category) === 'kidswear' || product.tags?.some((t) => ['kids', 'baby', 'crochet'].includes(t.toLowerCase()));
            if (!isKidsCrochet) return false;
          } else if (selectedCategory === 'floral-crochet') {
            const nameOrDesc = `${product.name} ${product.description || ''} ${product.tags?.join(' ') || ''}`.toLowerCase();
            const isFloral = nameOrDesc.includes('floral') || nameOrDesc.includes('flower') || nameOrDesc.includes('bloom') || nameOrDesc.includes('petal');
            if (!isFloral) return false;
          } else if (selectedCategory === 'gifts') {
            const isGift = product.customizable || product.badge === 'Featured' || product.tags?.some((t) => ['gift', 'set', 'crochet'].includes(t.toLowerCase()));
            if (!isGift) return false;
          } else {
            const normProdCat = (product.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const normSubCat = (product.subcategory || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const matchesCat = normProdCat === normCat || normSubCat === normCat || product.tags?.some((t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '') === normCat);
            if (!matchesCat) return false;
          }
        }

        if (selectedSizes.length > 0) {
          const hasSize = product.sizes?.some((s) => selectedSizes.includes(s));
          if (!hasSize) return false;
        }

        if (product.price > priceRange) return false;

        // Custom filters: OR logic within single filter, AND across filters
        for (const [fSlug, selectedVals] of Object.entries(customFilterSelections)) {
          if (Array.isArray(selectedVals) && selectedVals.length > 0) {
            const prodFv = product.filterValues?.find((fv) => fv.filterSlug === fSlug);
            if (!prodFv || !prodFv.values || !prodFv.values.some((v) => selectedVals.includes(v))) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'most-sold') {
          const aCount = a.soldCount ?? (a.badge === 'Bestseller' ? 100 : 0);
          const bCount = b.soldCount ?? (b.badge === 'Bestseller' ? 100 : 0);
          return bCount - aCount;
        }
        if (sortBy === 'most-wishlisted') return (b.wishlistCount || 0) - (a.wishlistCount || 0);
        if (sortBy === 'low-stock') return (a.stock ?? 0) - (b.stock ?? 0);
        return a.featured ? -1 : 1;
      });
  }, [productsList, selectedCategory, selectedSizes, priceRange, customFilterSelections, sortBy]);

  const activeSEO = categorySEOConfig[selectedCategory] || categorySEOConfig.all;

  return (
    <div className="shop-page-theme pt-24 pb-0 bg-ivory">
      <div className="site-container">
        {/* Header Hero Section with Galaxy Background */}
        <div className="shop-header-hero relative mb-8 p-6 md:p-10 rounded-2xl border border-warmBrown/20 shadow-sm overflow-hidden min-h-[220px] flex items-center">
          {/* Galaxy background component */}
          <div className="absolute inset-0 z-0 opacity-65 pointer-events-auto">
            <Galaxy
              transparent={true}
              mouseRepulsion={true}
              mouseInteraction={true}
              density={0.25}
              glowIntensity={0.2}
              saturation={0.7}
              hueShift={35}
              starSpeed={0.3}
              rotationSpeed={0.05}
              twinkleIntensity={0.3}
              repulsionStrength={2}
            />
          </div>

          {/* Header Content overlay */}
          <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <SectionHeading
                label="Shop Collection"
                headline={activeSEO.h1}
                as="h1"
                headlineClassName="text-display-md"
              />
              <p className="text-body-sm text-charcoal-600 font-light mt-2 max-w-lg">
                {activeSEO.subtext}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="shop-btn-secondary px-4 py-2 bg-ivory/90 backdrop-blur-sm border border-border text-label-md uppercase tracking-[0.14em] text-charcoal hover:border-charcoal transition-colors flex items-center gap-2 shadow-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#191919]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                Search
              </button>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="shop-btn-primary lg:hidden px-4 py-2 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em] flex items-center gap-2 shadow-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-9.75 0h9.75" />
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar (1 col) */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterPanel
              categories={seedCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedSizes={selectedSizes}
              onSelectSize={(size) =>
                setSelectedSizes((prev) =>
                  prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                )
              }
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              customFilterSelections={customFilterSelections}
              onCustomFilterChange={handleCustomFilterChange}
              onReset={resetFilters}
              totalResults={filteredProducts.length}
            />
          </div>

          {/* Product Grid Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort & Count Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <span className="text-body-xs text-charcoal-400 font-sans font-light">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-label-md uppercase tracking-[0.14em] font-sans text-charcoal-400 font-medium">
                  Sort:
                </label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-cream border border-border px-3 py-1.5 text-body-xs font-sans text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="most-sold">Bestsellers</option>
                  <option value="most-wishlisted">Most Popular</option>
                  <option value="low-stock">Limited Stock</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <ProductGrid products={filteredProducts} loading={loadingProducts} />
          </div>
        </div>
      </div>

      {/* Workshop Banner */}
      <WorkshopsSection />

      {/* WhatsApp Community Bar */}
      <WhatsAppCommunityCTA source="shop_page" />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} products={productsList} />

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-ivory h-full overflow-y-auto p-6 space-y-6 animate-slide-in-left">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="font-serif font-light text-xl text-charcoal">Filter Collection</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="text-charcoal-400 hover:text-charcoal text-lg">✕</button>
            </div>
            <FilterPanel
              categories={seedCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setMobileFilterOpen(false);
              }}
              selectedSizes={selectedSizes}
              onSelectSize={(size) =>
                setSelectedSizes((prev) =>
                  prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                )
              }
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              customFilterSelections={customFilterSelections}
              onCustomFilterChange={handleCustomFilterChange}
              onReset={resetFilters}
              totalResults={filteredProducts.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-32 pb-16 text-center">
        <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-body-xs text-charcoal-400 font-light">Loading collection...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
