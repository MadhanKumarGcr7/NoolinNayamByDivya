import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = {
  title: 'Terms & Conditions — Noolin Nayam by Divya',
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="editorial-container">
        <SectionHeading
          label="Legal"
          headline="Terms & Conditions"
          as="h1"
          headlineClassName="text-display-md mb-8"
        />
        <div className="prose prose-stone text-body-sm text-charcoal-600 font-light leading-relaxed space-y-6">
          <p>Last updated: August 2026</p>
          <p>Welcome to <strong>Noolin Nayam by Divya</strong>. By accessing or using our website and purchasing our handcrafted products, you agree to be bound by these terms.</p>
          <h2 className="font-serif text-xl text-charcoal font-normal pt-4">Handmade Nature & Subtle Variations</h2>
          <p>Each piece is individually handcrafted stitch by stitch. Subtle variations in yarn texture, tension, or exact color shade are natural hallmarks of authentic handmade craft, not defects.</p>
          <h2 className="font-serif text-xl text-charcoal font-normal pt-4">Custom Orders</h2>
          <p>Custom orders tailored to specific measurements or colors are crafted upon confirmation and cannot be cancelled once yarn cutting and crocheting have commenced.</p>
        </div>
      </div>
    </div>
  );
}
