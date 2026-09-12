import SectionHeading from '@/components/ui/SectionHeading';
import CustomOrderForm from '@/components/forms/CustomOrderForm';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

export const metadata = {
  title: 'Custom Crochet Creations | Handmade Crochet Orders | Noolin Nayam by Divya',
  description: 'Looking for a unique handmade crochet creation? Explore custom crochet designs from Noolin Nayam by Divya and create something made especially for you.',
  keywords: 'custom crochet, custom crochet orders, personalized crochet, handmade custom crochet, crochet custom designs, customized crochet gifts',
};

export default function CustomOrdersPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      {/* Header */}
      <div className="bg-surface border-b border-border/60 py-16 mb-16">
        <div className="site-container text-center">
          <SectionHeading
            label="Bespoke Atelier"
            headline="Custom Handmade Crochet Creations"
            subtext="Have a unique vision for a birthday frock, baby shower outfit, or sibling matching set? Browse our design inspiration gallery or share your requirements below, and we'll craft your custom piece stitch by stitch."
            align="center"
            as="h1"
            headlineClassName="text-display-lg"
          />
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Form Column (8 cols) */}
          <div className="lg:col-span-8">
            <CustomOrderForm />
          </div>

          {/* Side Editorial Info (4 cols) */}
          <div className="lg:col-span-4 space-y-8 sticky top-32">
            <div className="bg-cream border border-border p-6 space-y-4">
              <h3 className="font-serif font-light text-charcoal text-2xl border-b border-border pb-3">
                How Custom Orders Work
              </h3>

              <ul className="space-y-4 text-body-sm text-charcoal-600 font-light" role="list">
                <li className="flex gap-3">
                  <span className="font-serif font-light text-warmBrown text-lg">01.</span>
                  <div>
                    <strong className="font-medium text-charcoal block">Submit Your Vision</strong>
                    Share your preferred colors, sizing, occasion, and design ideas.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif font-light text-warmBrown text-lg">02.</span>
                  <div>
                    <strong className="font-medium text-charcoal block">Yarn & Style Alignment</strong>
                    Divya will contact you to confirm yarn choices, exact measurements, and timeline.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif font-light text-warmBrown text-lg">03.</span>
                  <div>
                    <strong className="font-medium text-charcoal block">Handcrafted Slowly</strong>
                    Your garment is crocheted stitch by stitch with meticulous attention to detail.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif font-light text-warmBrown text-lg">04.</span>
                  <div>
                    <strong className="font-medium text-charcoal block">Delivered with Love</strong>
                    Beautifully packaged and shipped straight to your doorstep.
                  </div>
                </li>
              </ul>
            </div>

            {/* Editorial Craft Photo Placeholder */}
            <div className="hover-zoom">
              <PlaceholderImage
                label="Custom Craft Studio — Hands crocheting custom dress"
                aspect="3/4"
                className="w-full shadow-warm-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
