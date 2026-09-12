import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import CustomerReviewsSection from '@/components/product/CustomerReviewsSection';
import { brandConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    await connectDB();
    const product = await Product.findOne({ slug, status: 'active' }).lean();
    if (!product) return {};

    return {
      title: `${product.name} — ${brandConfig.displayName}`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [{ url: product.images?.[0] || brandConfig.seo.ogImage }],
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
    await connectDB();
    const dbProduct = await Product.findOne({ slug, status: 'active' }).lean();
    if (dbProduct) {
      product = {
        ...dbProduct,
        id: dbProduct._id.toString(),
      };
    }
  } catch (err) {
    console.error('Error loading product detail:', err);
  }

  // If product is missing or hidden/draft/deleted -> return 404
  if (!product) {
    notFound();
  }

  // Related products from MongoDB
  let allProducts = [];
  try {
    const dbAll = await Product.find({ status: 'active', slug: { $ne: slug } }).limit(4).lean();
    allProducts = dbAll.map((p) => ({ ...p, id: p._id.toString() }));
  } catch {
    allProducts = [];
  }

  // Schema.org Product Structured Data for SEO
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
          {/* Breadcrumb Navigation */}
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

          {/* Product Hero — Gallery + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
            {/* Left: Gallery (7 cols on lg) */}
            <div className="lg:col-span-7">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: Info & Purchase Form (5 cols on lg) */}
            <div className="lg:col-span-5">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Customer Reviews & Rating Summary Section */}
          <CustomerReviewsSection productSlug={product.slug} productName={product.name} />

          {/* Related Products Carousel */}
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
