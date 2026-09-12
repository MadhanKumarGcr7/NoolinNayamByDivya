/**
 * KidswearSection
 * ────────────────────────────────────────────────────────────────────────────
 * Homepage section featuring Kidswear & Babywear lifestyle imagery.
 *
 * IMAGE INSTRUCTIONS:
 *   Folder : public/assets/sections/
 *   File   : kidswear-lifestyle.jpg  (or .png / .webp)
 *
 * Set HAS_IMAGE = true once you save the photo.
 */

const HAS_IMAGE = true;
const IMAGE_SRC = '/assets/sections/kidswear-lifestyle.jpg';

import PlaceholderImage from '@/components/ui/PlaceholderImage';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';

export default function KidswearSection() {
  return (
    <section className="py-24 lg:py-32 bg-ivory overflow-hidden" aria-labelledby="kidswear-heading">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Image Block - 7 cols */}
          <div className="lg:col-span-7 relative reveal">
            <div className="hover-zoom relative z-10 overflow-hidden shadow-warm-lg border border-border">
              {HAS_IMAGE ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={IMAGE_SRC}
                  alt="Kidswear Lifestyle — Soft silhouettes & childhood memories"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <PlaceholderImage
                  label="Kidswear Lifestyle — Soft silhouettes & childhood memories photo"
                  aspect="16/9"
                  className="w-full"
                />
              )}
            </div>
            
            {/* Decorative background panel */}
            <div className="absolute -bottom-6 -left-6 w-full h-full bg-cream -z-0 hidden sm:block" aria-hidden="true" />
            
            {/* Floating Editorial Quote badge */}
            <div className="absolute top-6 right-6 z-20 bg-ivory/90 backdrop-blur-sm p-5 max-w-xs border border-border shadow-warm-md hidden md:block">
              <p className="font-serif italic font-light text-charcoal text-lg leading-snug">
                &quot;Little pieces, big memories.&quot;
              </p>
            </div>
          </div>

          {/* Content Block - 5 cols */}
          <div className="lg:col-span-5 reveal reveal-delay-2">
            <SectionHeading
              label="Kidswear & Babywear"
              headline="Made for little personalities."
              subtext="Soft silhouettes, beautiful details, and pieces made for memories. We craft gentle clothes that respect childhood wonder and comfort."
              as="h2"
              headlineClassName="text-display-md"
              className="mb-8"
            />

            <ul className="space-y-4 text-body-sm text-charcoal-600 font-light mb-10">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-warmBrown" />
                <span>Hypoallergenic & skin-friendly organic fabrics</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-warmBrown" />
                <span>Relaxed fits for ease of movement & play</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-warmBrown" />
                <span>Hand-finished hems and durable seams</span>
              </li>
            </ul>

            <Button href="/shop?category=kidswear" variant="primary" size="lg" arrow>
              EXPLORE KIDSWEAR
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
