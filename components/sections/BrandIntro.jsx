import Image from 'next/image';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import SectionHeading from '@/components/ui/SectionHeading';
import Link from 'next/link';

/**
 * BrandIntro — Homepage Brand Introduction Section
 * ────────────────────────────────────────────────────────────────────────────
 * To add real photography, save your images to:
 *   Main image:   /public/assets/brand/brand-intro-main.jpg  (portrait 3:4, e.g. hands crocheting)
 *   Accent image: /public/assets/brand/brand-intro-accent.jpg (square, e.g. stitch closeup)
 *
 * Then set HAS_MAIN_IMAGE and HAS_ACCENT_IMAGE to true below.
 */

const HAS_MAIN_IMAGE   = true;  // set to true once you've saved brand-intro-main.jpg
const HAS_ACCENT_IMAGE = false; // set to true once you've saved brand-intro-accent.jpg

export default function BrandIntro() {
  return (
    <section className="py-24 lg:py-32 bg-ivory overflow-hidden" aria-labelledby="brand-intro-heading">
      <div className="site-container">
        {/* Asymmetric editorial layout — text left, image right, offset */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">

          {/* Text block — spans 5 of 12 columns */}
          <div className="lg:col-span-5 lg:pr-12 reveal">
            <SectionHeading
              label="The craft"
              headline="Made by hand. Made with heart."
              as="h2"
              headlineClassName="text-display-md"
              className="mb-8"
            />
            <div className="space-y-4 text-body-md text-charcoal-600 font-light leading-relaxed">
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

            {/* Signature phrases */}
            <p className="mt-8 font-serif font-light italic text-display-sm text-charcoal/40">
              &quot;Made slowly.&quot;
            </p>

            <Link
              href="/our-story"
              className="mt-8 inline-flex items-center gap-3 text-label-lg uppercase tracking-[0.16em] text-charcoal hover:text-warmBrown transition-colors duration-300 group"
            >
              <span>Read our story</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Image block — spans 5 of 12, slightly reduced for elegant framing */}
          <div className="lg:col-span-5 lg:col-start-8 relative reveal reveal-delay-2 flex justify-center lg:justify-end">
            {/* Main image */}
            <div className="relative w-full max-w-[420px] hover-zoom rounded-2xl overflow-hidden shadow-warm-md border border-border/40">
              {HAS_MAIN_IMAGE ? (
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                  <Image
                    src="/assets/brand/brand-intro-main.png"
                    alt="Handcrafted crochet — made stitch by stitch"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <PlaceholderImage
                  label="Brand Intro Image — Close-up craft/process photo"
                  className="w-full"
                  aspect="4/5"
                />
              )}
            </div>

            {/* Stat/detail pill */}
            <div className="absolute bottom-4 left-4 lg:-left-6 bg-ivory/95 backdrop-blur-sm border border-border px-4 py-3 rounded-xl shadow-warm-sm">
              <p className="text-label-md uppercase tracking-[0.18em] text-warmBrown mb-0.5">Each piece</p>
              <p className="font-serif font-light text-charcoal text-base sm:text-lg">Made by hand</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
