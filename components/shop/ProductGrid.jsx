import { ProductCard } from '@/components/sections/FeaturedProducts';

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div className="aspect-portrait bg-cream placeholder-shimmer rounded-xs" />
            <div className="h-4 w-3/4 bg-cream placeholder-shimmer rounded-xs" />
            <div className="h-4 w-1/2 bg-cream placeholder-shimmer rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-cream/40 border border-border/50 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-charcoal-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
        </svg>
        <h3 className="font-serif font-light text-charcoal text-2xl mb-2">No pieces found</h3>
        <p className="text-body-sm text-charcoal-600 font-light max-w-sm">
          Try resetting your filters or selecting a different category to view our handcrafted items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
