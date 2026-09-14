import SectionHeading from '@/components/ui/SectionHeading';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

export const metadata = {
  title: 'Craftsmanship — Noolin Nayam by Divya',
  description: 'Explore the handmade crochet atelier process: from yarn selection to loop-by-loop crafting.',
};

export default function CraftsmanshipPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="bg-mocha-gradient border-b border-border/60 py-20 mb-16 shadow-warm-xs">
        <div className="editorial-container text-center">
          <SectionHeading
            label="The Atelier Process"
            headline="Stitch by Stitch, Loop by Loop"
            subtext="Discover how raw cotton fibers are transformed into treasured handmade garments."
            align="center"
            as="h1"
            headlineClassName="text-display-lg"
          />
        </div>
      </div>

      <div className="editorial-container space-y-20">
        {/* Step 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-semibold">Step 01</span>
            <h2 className="font-serif font-light text-charcoal text-display-sm">Yarn & Thread Selection</h2>
            <p className="text-body-md text-charcoal-600 font-light leading-relaxed">
              We source premium 100% cotton yarns, specifically soft-spun to avoid harshness against sensitive skin. Each shade in our palette is chosen to reflect warmth, calm, and classic beauty.
            </p>
          </div>
          <div className="md:col-span-6 hover-zoom">
            <PlaceholderImage label="Craft Step 01 — Yarn skeins & natural fibers photo" aspect="4/3" className="w-full shadow-warm-md" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center flex-row-reverse">
          <div className="md:col-span-6 md:order-2 space-y-4">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-semibold">Step 02</span>
            <h2 className="font-serif font-light text-charcoal text-display-sm">Precision Pattern Work</h2>
            <p className="text-body-md text-charcoal-600 font-light leading-relaxed">
              Whether executing an intricate floral lace motif or a solid soft-knit smock, every loop requires uniform hook gauge tension. A single dress can contain thousands of individual hand movements.
            </p>
          </div>
          <div className="md:col-span-6 md:order-1 hover-zoom">
            <PlaceholderImage label="Craft Step 02 — Hands holding crochet hook & pattern work" aspect="4/3" className="w-full shadow-warm-md" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-sans font-semibold">Step 03</span>
            <h2 className="font-serif font-light text-charcoal text-display-sm">Hand-Finishing & Quality Audit</h2>
            <p className="text-body-md text-charcoal-600 font-light leading-relaxed">
              Loose threads are neatly woven in, edges are hand-blocked for proper drape, and button fittings are reinforced. No item leaves the studio without Divya’s final personal review.
            </p>
          </div>
          <div className="md:col-span-6 hover-zoom">
            <PlaceholderImage label="Craft Step 03 — Final hand-blocking & garment check photo" aspect="4/3" className="w-full shadow-warm-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
