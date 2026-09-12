/**
 * BrandStoryTeaser — Homepage Our Origins / Founder Story Teaser
 * ────────────────────────────────────────────────────────────────────────────
 * IMAGE INSTRUCTIONS:
 *   Folder : public/assets/brand/
 *   File   : brand-story-teaser.jpg (or .png / .webp)
 *
 * Set HAS_IMAGE = true once you save the photo.
 */

const HAS_IMAGE = true;
const IMAGE_SRC = '/assets/brand/brand-story-teaser.jpg';

import Link from 'next/link';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

export default function BrandStoryTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-cream overflow-hidden" aria-labelledby="story-teaser-heading">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Column - 7 cols */}
          <div className="lg:col-span-7 reveal">
            <p className="section-label mb-3">Our Origins</p>
            <h2 id="story-teaser-heading" className="font-serif font-light text-charcoal text-display-md mb-6">
              Made by hand. Made with heart.
            </h2>

            <div className="space-y-4 text-body-md text-charcoal-600 font-light leading-relaxed mb-8">
              <p>
                Noolin Nayam by Divya began in the quiet, unplanned pockets of a very full life — car rides to work, a few free evenings, a love for crochet that grew stitch by stitch.
              </p>
              <p>
                What started as a way to unwind eventually became something more: pieces made for friends, then colleagues, then strangers who found their way to a small Instagram page.
              </p>
              <p>
                Today, nearly 200 handmade pieces later, that same care and attention lives in every order — now made for you.
              </p>
            </div>

            <Link
              href="/our-story"
              className="inline-flex items-center gap-3 text-label-lg uppercase tracking-[0.16em] text-charcoal border-b border-charcoal pb-1 hover:text-warmBrown hover:border-warmBrown transition-colors group"
            >
              <span>Read Our Full Story</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Image Column - 5 cols (slightly smaller & refined) */}
          <div className="lg:col-span-5 reveal reveal-delay-2 flex justify-center">
            <div className="hover-zoom relative overflow-hidden shadow-warm-lg border border-border max-w-md w-full">
              {HAS_IMAGE ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={IMAGE_SRC}
                  alt="Story Teaser — Founder at work / Studio & Yarn atelier"
                  className="w-full max-h-[460px] object-cover block"
                />
              ) : (
                <PlaceholderImage
                  label="Story Teaser — Founder at work / Studio & Yarn atelier photo"
                  aspect="3/4"
                  className="w-full"
                />
              )}
              <div className="absolute bottom-6 right-6 bg-ivory/90 backdrop-blur-sm p-5 border border-border shadow-warm-sm max-w-xs">
                <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown mb-1">Handmade Studio</p>
                <p className="font-serif italic text-charcoal text-lg">&quot;Little pieces, big memories.&quot;</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
