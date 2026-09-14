import SectionHeading from '@/components/ui/SectionHeading';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import Link from 'next/link';

export const metadata = {
  title: 'Our Story — Noolin Nayam by Divya',
  description: 'Discover the real story behind Noolin Nayam by Divya — from commute crochet sessions during an investment banking career to nearly 200 handmade orders crafted stitch by stitch.',
};

/**
 * ─── PHOTO CONFIGURATION ───────────────────────────────────────────────────
 * Save your images to: public/assets/our-story/
 *
 * Section 1 → our-story-01.jpg  (The Beginnings — commute / quiet crafting)
 * Section 2 → our-story-02.jpg  (The Shift — early handcrafted pieces)
 * Section 3 → our-story-03.jpg  (The Connection — making process / Instagram)
 * Section 4 → our-story-04.jpg  (Present Day — finished collection today)
 *
 * Set each flag to true after saving the matching image file.
 * Supports .jpg, .jpeg, .png, .webp — just match the extension below.
 * ───────────────────────────────────────────────────────────────────────────
 */
const IMAGES = {
  section1: { src: '/assets/our-story/our-story-01.jpg', ready: true },
  section2: { src: '/assets/our-story/our-story-02.jpg', ready: true },
  section3: { src: '/assets/our-story/our-story-03.jpg', ready: true },
  section4: { src: '/assets/our-story/our-story-04.jpg', ready: true },
};

/** Helper: renders a real image or placeholder depending on the ready flag */
function StoryImage({ slot, label, aspect = '4/3' }) {
  const img = IMAGES[slot];
  if (img?.ready) {
    return (
      <div className="w-full overflow-hidden shadow-warm-md border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          alt={label}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    );
  }
  return (
    <PlaceholderImage
      label={label}
      aspect={aspect}
      className="w-full shadow-warm-md border border-border"
    />
  );
}

export default function OurStoryPage() {
  return (
    <div className="pt-28 pb-20 bg-ivory">
      {/* Page Header */}
      <div className="bg-mocha-gradient border-b border-border/60 py-20 mb-20 shadow-warm-xs">
        <div className="editorial-container text-center">
          <SectionHeading
            label="Our Beginnings"
            headline="Our Story"
            subtext="What began in quiet commute pockets between meetings has grown into a slow, handcrafted atelier crafted stitch by stitch."
            align="center"
            as="h1"
            headlineClassName="text-display-md sm:text-display-lg"
          />
        </div>
      </div>

      {/* Editorial Story Sections */}
      <div className="editorial-container space-y-24 lg:space-y-36">

        {/* Section 1 — A hobby that found its own rhythm */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-medium">
              01 / The Beginnings
            </span>
            <h2 className="font-serif font-light text-charcoal text-3xl sm:text-4xl lg:text-display-sm leading-snug">
              A hobby that found its own rhythm
            </h2>
            <div className="w-12 h-px bg-warmBrown/40" aria-hidden="true" />
            <p className="text-body-md text-charcoal-600 font-light font-sans leading-relaxed">
              The story of Noolin Nayam by Divya didn&apos;t begin in a studio. It began in the in-between moments of a career in investment banking — two years working in Chennai, and now based in Coimbatore. Long days, long commutes, and a quiet need for something slower and more grounding led to crochet: yarn and hook picked up during car rides to the office, and in whatever free time could be found.
            </p>
          </div>

          <div className="lg:col-span-6 hover-zoom">
            <StoryImage
              slot="section1"
              label="Our Story 01 — Commute & Quiet Crafting Session"
              aspect="4/3"
            />
          </div>
        </div>

        {/* Section 2 — From a personal interest to something shared */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-6">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-medium">
              02 / The Shift
            </span>
            <h2 className="font-serif font-light text-charcoal text-3xl sm:text-4xl lg:text-display-sm leading-snug">
              From a personal interest to something shared
            </h2>
            <div className="w-12 h-px bg-warmBrown/40" aria-hidden="true" />
            <p className="text-body-md text-charcoal-600 font-light font-sans leading-relaxed">
              What began as a way to unwind slowly became a craft worth sharing. The first pieces went to colleagues and friends — made simply out of interest, shared through conversation and word of mouth. As more people asked for pieces of their own, what had been a quiet hobby began to take a shape of its own.
            </p>
          </div>

          <div className="lg:col-span-6 lg:order-1 hover-zoom">
            <StoryImage
              slot="section2"
              label="Our Story 02 — Early Handcrafted Pieces & Yarn Work"
              aspect="4/3"
            />
          </div>
        </div>

        {/* Section 3 — Growing, one stitch and one connection at a time */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-medium">
              03 / The Connection
            </span>
            <h2 className="font-serif font-light text-charcoal text-3xl sm:text-4xl lg:text-display-sm leading-snug">
              Growing, one stitch and one connection at a time
            </h2>
            <div className="w-12 h-px bg-warmBrown/40" aria-hidden="true" />
            <p className="text-body-md text-charcoal-600 font-light font-sans leading-relaxed">
              An Instagram page followed — a small, honest window into the making process and the finished pieces. Through networking, word of mouth, and a growing community of people who valued handmade things, the collection found its way to nearly 200 homes, each piece made to order, one at a time.
            </p>
          </div>

          <div className="lg:col-span-6 hover-zoom">
            <StoryImage
              slot="section3"
              label="Our Story 03 — Making Process & Instagram Atelier Showcase"
              aspect="4/3"
            />
          </div>
        </div>

        {/* Section 4 — Here, now */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-6">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-medium">
              04 / Present Day
            </span>
            <h2 className="font-serif font-light text-charcoal text-3xl sm:text-4xl lg:text-display-sm leading-snug">
              Here, now
            </h2>
            <div className="w-12 h-px bg-warmBrown/40" aria-hidden="true" />
            <p className="text-body-md text-charcoal-600 font-light font-sans leading-relaxed">
              Noolin Nayam by Divya today is that same care, simply given a proper home. Every crochet piece, every kidswear design, every custom order is still made the way it always has been — thoughtfully, by hand, one stitch at a time. What began between meetings and commutes has grown into a small, meaningful business — and every order continues that same story.
            </p>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/shop"
                className="px-6 py-3.5 bg-charcoal text-ivory text-label-md uppercase tracking-[0.16em] font-medium hover:bg-warmBrown transition-colors shadow-warm-xs"
              >
                Explore Collection
              </Link>
              <Link
                href="/custom-orders"
                className="px-6 py-3.5 border border-charcoal/30 text-charcoal text-label-md uppercase tracking-[0.16em] font-medium hover:bg-charcoal/5 transition-colors"
              >
                Request Custom Piece
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 hover-zoom">
            <StoryImage
              slot="section4"
              label="Our Story 04 — Finished Collection & Atelier Today"
              aspect="4/3"
            />
          </div>
        </div>

        {/* Atelier Principles Cards */}
        <div className="pt-16 border-t border-border/60">
          <SectionHeading
            label="What We Stand For"
            headline="Our Atelier Principles"
            align="center"
            as="h2"
            headlineClassName="text-display-sm mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Slow Craftsmanship',
                desc: 'We refuse to rush. Each garment is given the time it deserves to ensure flawless tension, soft drape, and lasting quality.',
              },
              {
                title: 'Gentle Materials',
                desc: "We select soft-spun, natural cotton yarns that respect delicate newborn and children\u2019s skin.",
              },
              {
                title: 'Heirloom Keepsakes',
                desc: 'Our pieces are designed to be worn for special moments, photographed with joy, and passed down through families.',
              },
            ].map((principle) => (
              <div key={principle.title} className="bg-cream p-8 border border-border space-y-3">
                <h3 className="font-serif font-light text-charcoal text-2xl">{principle.title}</h3>
                <p className="text-body-sm text-charcoal-600 font-light leading-relaxed">{principle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
