import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { getWhatsAppUrl } from '@/lib/config';

export const metadata = {
  title: 'Return Policy — Noolin Nayam by Divya',
  description: 'Learn about our handmade made-to-order return policy, size-issue eligibility, and unboxing video requirements.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="pt-28 pb-12 bg-ivory">
      <div className="site-container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <SectionHeading
            eyebrow="Transparency & Craftsmanship"
            title="Return Policy"
            subtitle="Made slowly, stitched with love. Please read our return eligibility terms carefully."
          />
        </div>

        {/* Content Box */}
        <div className="bg-cream border border-border p-6 sm:p-10 shadow-warm-md space-y-8 text-charcoal font-sans">
          <div className="p-4 bg-sage-light/40 border border-sage/40 text-body-xs font-sans text-sage-dark font-medium uppercase tracking-[0.14em]">
            ✓ Official Policy — Applicable to All Custom & Made-to-Order Purchases
          </div>

          <div className="prose prose-stone max-w-none text-body-md font-light leading-relaxed space-y-6">
            <p>
              Every piece from <strong>Noolin Nayam by Divya</strong> is handmade to order with care and attention to detail, so our return policy is intentionally limited:
            </p>

            <div className="border-l-2 border-warmBrown pl-4 space-y-4">
              <div className="bg-ivory border border-border p-4">
                <h3 className="font-serif font-light text-lg text-charcoal mb-1">
                  1. Size Issues Only
                </h3>
                <p className="text-body-sm text-charcoal-600 font-light">
                  Returns are accepted <strong>only if there is a size issue</strong> with the item received. We do not accept returns for any other reason (change of mind, color perception, delivery time, etc.).
                </p>
              </div>

              <div className="bg-ivory border border-border p-4">
                <h3 className="font-serif font-light text-lg text-charcoal mb-1">
                  2. Mandatory Unboxing Video
                </h3>
                <p className="text-body-sm text-charcoal-600 font-light">
                  To be eligible for a size-issue return, you <strong>must have recorded an unboxing video</strong> showing the sealed package being opened for the first time, clearly showing the size/label of the item. Returns without an unboxing video <strong>cannot be accepted or processed.</strong>
                </p>
              </div>

              <div className="bg-ivory border border-border p-4">
                <h3 className="font-serif font-light text-lg text-charcoal mb-1">
                  3. Personal WhatsApp Support
                </h3>
                <p className="text-body-sm text-charcoal-600 font-light">
                  To start a return, use the <strong>&quot;Return this item&quot;</strong> option on your order in your Account dashboard — this will open a WhatsApp chat with us directly so we can assist you personally.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/80">
              <p className="text-body-xs text-charcoal-500 font-light italic">
                By placing an order on our site, you confirm that you have read and agree to this Return Policy.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button href="/shop" variant="primary" size="md">
              CONTINUE SHOPPING
            </Button>
            <a
              href={getWhatsAppUrl('Hi Divya! I have a question about your Return Policy.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal font-medium transition-colors"
            >
              Have Questions? Contact Us on WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
