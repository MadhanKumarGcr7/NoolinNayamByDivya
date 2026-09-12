import Link from 'next/link';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

const collections = [
  {
    id: 'crochet-stories',
    name: 'Crochet Stories',
    description: 'Handcrafted textures, lovingly looped.',
    href: '/shop?category=crochet',
    label: 'Collection Image — Crochet',
    imageSrc: '/assets/collections/crochet-stories.jpg',
  },
  {
    id: 'little-dresses',
    name: 'Little Dresses',
    description: 'Soft silhouettes for little personalities.',
    href: '/shop?category=kidswear',
    label: 'Collection Image — Little Dresses',
    imageSrc: '/assets/collections/little-dresses.jpg',
  },
  {
    id: 'custom-creations',
    name: 'Custom Creations',
    description: "Dream it. We'll crochet it.",
    href: '/custom-orders',
    label: 'Collection Image — Custom Creations',
    imageSrc: '/assets/collections/custom-creations.jpg',
  },
];

function CollectionTile({ collection }) {
  return (
    <Link
      href={collection.href}
      className="group relative overflow-hidden block rounded-2xl w-full shadow-warm-md border border-border/40"
      style={{ paddingBottom: '125%' /* 4:5 aspect ratio — all cards exactly equal height */ }}
      aria-label={`Explore ${collection.name}`}
    >
      {/* Image */}
      <div className="absolute inset-0 transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105">
        {collection.imageSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={collection.imageSrc}
            alt={collection.name}
            className="w-full h-full object-cover block"
            onError={(e) => {
              // Fallback to placeholder if file is missing
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'block';
              }
            }}
          />
        ) : null}
        <div style={{ display: collection.imageSrc ? 'none' : 'block', width: '100%', height: '100%' }}>
          <PlaceholderImage label={collection.label} className="w-full h-full" aspect="auto" />
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
        <p className="text-label-md uppercase tracking-[0.18em] text-ivory/60 font-sans mb-2">
          Collection
        </p>
        <h3 className="font-serif font-light text-ivory text-2xl sm:text-3xl mb-2">
          {collection.name}
        </h3>
        <p className="text-body-sm text-ivory/80 font-light mb-5 leading-relaxed">
          {collection.description}
        </p>
        <div className="inline-flex items-center gap-2 text-label-md uppercase tracking-[0.16em] text-ivory group-hover:text-sand transition-colors duration-300">
          <span>Explore</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedCollections() {
  return (
    <section className="py-20 lg:py-24 bg-surface" aria-labelledby="collections-heading">
      <div className="site-container">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <p className="section-label mb-3">Collections</p>
            <h2 id="collections-heading" className="font-serif font-light text-charcoal text-display-md">
              Shop by story.
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-label-lg uppercase tracking-[0.16em] text-charcoal-400 hover:text-charcoal transition-colors group"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* 3 Equal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {collections.map((col) => (
            <CollectionTile key={col.id} collection={col} />
          ))}
        </div>
      </div>
    </section>
  );
}
