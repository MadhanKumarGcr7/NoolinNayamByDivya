import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = {
  title: 'Shipping & Returns — Noolin Nayam by Divya',
};

export default function ShippingPolicyPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="editorial-container">
        <SectionHeading
          label="Help & Policy"
          headline="Shipping & Returns"
          as="h1"
          headlineClassName="text-display-md mb-8"
        />
        <div className="prose prose-stone text-body-sm text-charcoal-600 font-light leading-relaxed space-y-6">
          <h2 className="font-serif text-xl text-charcoal font-normal pt-2">Made to Order Crafting Timeline</h2>
          <p>
            Because every item is handmade slowly with care, please allow <strong>4 to 7 business days</strong> for crafting prior to dispatch. You will receive tracking information once your order is handed over to our courier partner.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-normal pt-4">Shipping Rates & Delivery Times</h2>
          <p>• <strong>Free Shipping:</strong> On all orders above ₹999 within India.</p>
          <p>• <strong>Standard Shipping:</strong> ₹100 flat fee for orders under ₹999.</p>
          <p>• <strong>Delivery Time:</strong> 3 to 6 business days after dispatch depending on location.</p>

          <h2 id="returns" className="font-serif text-xl text-charcoal font-normal pt-4">Returns & Exchanges</h2>
          <p>
            Due to the hygienic nature of kidswear and the made-to-order process of handmade crochet, we offer exchanges for size issues or transit damages reported within 48 hours of delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
