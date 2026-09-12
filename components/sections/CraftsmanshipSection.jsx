/**
 * CraftsmanshipSection
 * ────────────────────────────────────────────────────────────────────────────
 * Full-bleed background image section with editorial overlay text.
 *
 * BACKGROUND IMAGE:
 *   Folder : public/assets/sections/
 *   File   : craftsmanship-bg.jpg  (or .png / .webp)
 *   Ideal  : Wide landscape image (1920×1080 or similar 16:9)
 *             e.g. close-up crochet texture, yarn detail, hands at work
 *
 * Set HAS_BG_IMAGE = true once the file is saved.
 */

const HAS_BG_IMAGE = true;
const BG_IMAGE_SRC = '/assets/sections/craftsmanship-bg.jpg';

import PlaceholderImage from '@/components/ui/PlaceholderImage';

export default function CraftsmanshipSection() {
  return (
    <section
      className="relative min-h-[70vh] flex items-center overflow-hidden"
      aria-labelledby="craftsmanship-heading"
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        {HAS_BG_IMAGE ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={BG_IMAGE_SRC}
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <PlaceholderImage
            label="Craftsmanship BG — Close-up crochet texture, full-width"
            className="w-full h-full"
            aspect="auto"
          />
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-charcoal/55" aria-hidden="true" />
      <div className="absolute inset-0 overlay-warm" aria-hidden="true" />

      {/* Content — centered, editorial */}
      <div className="relative z-10 w-full py-24 lg:py-32">
        <div className="editorial-container text-center">
          {/* Pre-label */}
          <p className="section-label text-ivory/60 mb-6 reveal">
            The craft
          </p>

          {/* Headline — large serif */}
          <h2
            id="craftsmanship-heading"
            className="font-serif font-light text-ivory text-display-xl leading-[1.08] tracking-[-0.02em] mb-8 reveal reveal-delay-2"
          >
            Every loop<br className="hidden sm:block" /> tells a story.
          </h2>

          {/* Body copy */}
          <p className="text-body-lg text-ivory/75 font-light leading-relaxed max-w-xl mx-auto reveal reveal-delay-3">
            Each piece is thoughtfully handcrafted, one stitch at a time. Hours of care go into every loop, every knot, every finished edge — because the details are where love lives.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 my-8 reveal reveal-delay-4" aria-hidden="true">
            <div className="w-12 h-px bg-ivory/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-ivory/30" />
            <div className="w-12 h-px bg-ivory/30" />
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-12 sm:gap-20 reveal reveal-delay-4">
            {[
              { number: '100%', label: 'Handmade' },
              { number: 'Made to', label: 'Order' },
              { number: 'Crafted', label: 'with love' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif font-light text-ivory text-2xl sm:text-3xl mb-1">{stat.number}</p>
                <p className="text-label-md uppercase tracking-[0.18em] text-ivory/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
