import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import CustomerReviewsSection from '@/components/product/CustomerReviewsSection';
import { brandConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const product = await prisma.product.findFirst({
      where: { slug, status: 'active' },
      include: { images: { orderBy: { display_order: 'asc' } } },
    });
    if (!product) return {};

    return {
      title: `${product.name} — ${brandConfig.displayName}`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [{ url: product.images?.[0]?.url || brandConfig.seo.ogImage }],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = params;
  let product = null;

  try {
    const p = await prisma.product.findFirst({
      where: { slug, status: 'active' },
      include: {
        category: true,
        images: { orderBy: { display_order: 'asc' } },
        variants: true,
      },
    });

    if (p) {
      const images = p.images.map(img => img.url);
      const sizes = Array.from(new Set(p.variants.map(v => v.size).filter(Boolean)));
      const colors = Array.from(new Set(p.variants.map(v => v.color).filter(Boolean))).map(name => ({ name }));
      const stock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);

      product = {
        _id: String(p.id),
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        category: p.category.slug,
        categoryName: p.category.name,
        material: p.material,
        care: p.care,
        customizable: p.customizable,
        featured: p.featured,
        newArrival: p.new_arrival,
        status: p.status,
        createdAt: p.created_at,
        images,
        sizes,
        colors,
        stock,
        variants: p.variants.map(v => ({
          id: String(v.id),
          size: v.size,
          color: v.color,
          stock: v.stock,
          outOfStock: v.out_of_stock,
        })),
      };
    }
  } catch (err) {
    console.error('Error loading product detail:', err);
  }

  if (!product) {
    notFound();
  }

  let allProducts = [];
  try {
    const dbAll = await prisma.product.findMany({
      where: { status: 'active', NOT: { slug } },
      take: 4,
      include: {
        category: true,
        images: { orderBy: { display_order: 'asc' } },
        variants: true,
      },
    });

    allProducts = dbAll.map((p) => ({
      _id: String(p.id),
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      images: p.images.map(img => img.url),
    }));
  } catch {
    allProducts = [];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: brandConfig.shipping.currency,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-28 pb-6 bg-ivory">
        <div className="site-container">
          <nav aria-label="Breadcrumb" className="mb-8 reveal">
            <ol className="flex items-center gap-2 text-body-xs font-sans text-charcoal-400">
              <li>
                <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
              </li>
              <li>/</li>
              <li className="text-charcoal font-medium truncate max-w-xs sm:max-w-none">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
            <div className="lg:col-span-7">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            <div className="lg:col-span-5">
              <ProductInfo product={product} />
            </div>
          </div>

          <CustomerReviewsSection productSlug={product.slug} productName={product.name} />

          {allProducts.length > 0 && (
            <div className="mt-24 pt-16 border-t border-border">
              <RelatedProducts currentProductId={product.id} products={allProducts} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
