import { ProductCard } from '@/components/sections/FeaturedProducts';

export default function RelatedProducts({ currentProduct, allProducts = [] }) {
  const related = allProducts
    .filter((p) => p.id !== currentProduct.id && (p.category === currentProduct.category || p.featured))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="py-16 border-t border-border/60" aria-labelledby="related-heading">
      <div className="flex items-center justify-between mb-8">
        <h2 id="related-heading" className="font-serif font-light text-charcoal text-display-sm">
          You may also love.
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
