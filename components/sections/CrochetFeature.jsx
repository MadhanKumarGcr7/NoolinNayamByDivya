import PlaceholderImage from '@/components/ui/PlaceholderImage';
import SectionHeading from '@/components/ui/SectionHeading';
import Link from 'next/link';

export default function CrochetFeature() {
  return (
    <section className="py-24 lg:py-32 bg-copper-soft border-y border-border/60 overflow-hidden" aria-labelledby="crochet-feature-heading">
      <div className="site-container">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20 reveal">
          <SectionHeading
            label="Handcrafted Atelier"
            headline="The beauty of handmade."
            subtext="From thread to treasure — each crochet loop is formed with patience, precision, and passion."
            align="center"
            as="h2"
            headlineClassName="text-display-md"
          />
        </div>

        {/* Magazine-spread staggered image layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column - 5 cols */}
          <div className="md:col-span-5 space-y-6 lg:space-y-8 reveal">
            <div className="hover-zoom aspect-portrait relative overflow-hidden bg-ivory shadow-warm-md">
              <img
                src="/assets/crochet/yarn-texture.jpg"
                alt="Yarn texture & natural fibers"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <PlaceholderImage
                label="Crochet Feature 1 — Yarn texture & natural fibers"
                aspect="3/4"
                className="w-full h-full hidden"
              />
            </div>
            <div className="section-highlight-copper-vertical p-8 border border-border/60 rounded-xl shadow-warm-xs">
              <p className="text-label-md uppercase tracking-[0.18em] text-warmBrown mb-2">Technique</p>
              <h3 className="font-serif font-light text-charcoal text-2xl mb-3">Intricate Open-Stitch</h3>
              <p className="text-body-sm text-charcoal-600 font-light leading-relaxed">
                Breathable, soft, and textured. Our signature crochet patterns blend traditional artisan techniques with modern minimalist silhouettes.
              </p>
            </div>
          </div>

          {/* Middle Column - 4 cols (offset vertically on desktop) */}
          <div className="md:col-span-4 md:-translate-y-8 space-y-6 lg:space-y-8 reveal reveal-delay-2">
            <div className="hover-zoom aspect-square relative overflow-hidden bg-ivory shadow-warm-md">
              <img
                src="/assets/crochet/craft-detail.jpg"
                alt="Hands crafting garment detail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <PlaceholderImage
                label="Crochet Feature 2 — Hands crafting garment detail"
                aspect="1/1"
                className="w-full h-full hidden"
              />
            </div>
            <div className="hover-zoom aspect-portrait relative overflow-hidden bg-ivory shadow-warm-md">
              <img
                src="/assets/crochet/finished-garment.jpg"
                alt="Finished crochet dress drape"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <PlaceholderImage
                label="Crochet Feature 3 — Finished crochet dress drape"
                aspect="3/4"
                className="w-full h-full hidden"
              />
            </div>
          </div>

          {/* Right Column - 3 cols */}
          <div className="md:col-span-3 space-y-6 lg:space-y-8 reveal reveal-delay-3">
            <div className="bg-ivory p-6 border border-border/60 text-center">
              <p className="font-serif italic font-light text-charcoal text-xl mb-2">&quot;Stitched with love.&quot;</p>
              <p className="text-body-xs text-charcoal-400 font-light uppercase tracking-[0.14em]">100% Cotton Yarn</p>
            </div>
            <div className="hover-zoom aspect-portrait relative overflow-hidden bg-ivory shadow-warm-md">
              <img
                src="/assets/crochet/hands-crafting.jpg"
                alt="Detail close-up stitch"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <PlaceholderImage
                label="Crochet Feature 4 — Detail close-up stitch"
                aspect="3/4"
                className="w-full h-full hidden"
              />
            </div>
            <div className="pt-2 text-center md:text-left">
              <Link
                href="/shop?category=crochet"
                className="inline-flex items-center gap-2 text-label-lg uppercase tracking-[0.16em] text-charcoal hover:text-warmBrown transition-colors group"
              >
                <span>Explore All Crochet</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
