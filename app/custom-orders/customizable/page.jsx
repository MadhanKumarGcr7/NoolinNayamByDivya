import SectionHeading from '@/components/ui/SectionHeading';
import CustomizationList from '@/components/custom-orders/CustomizationList';
import Link from 'next/link';

export const metadata = {
  title: 'Customizable Crochet Pieces | Available for Custom Orders | Noolin Nayam by Divya',
  description: 'Browse handcrafted crochet pieces available for custom colors, sizing, and personalized modifications from Noolin Nayam by Divya.',
  keywords: 'customizable crochet, custom crochet designs, personalized crochet dresses, custom crochet orders',
};

export default function CustomizablePiecesPage() {
  return (
    <div className="pt-28 pb-16 bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-surface border-b border-border/60 py-12 mb-12">
        <div className="site-container text-center space-y-3">
          <SectionHeading
            label="Bespoke Catalog"
            headline="Pieces Available for Customization"
            subtext="Select any piece below to start a custom order request pre-attached with your base design selection."
            align="center"
            as="h1"
            headlineClassName="text-display-lg"
          />
          <div className="pt-2">
            <Link
              href="/custom-orders"
              className="text-label-md uppercase tracking-[0.14em] font-sans text-warmBrown hover:text-charcoal transition-colors underline font-medium"
            >
              Have your own unique idea instead? Submit General Request →
            </Link>
          </div>
        </div>
      </div>

      <div className="site-container">
        <CustomizationList />
      </div>
    </div>
  );
}
