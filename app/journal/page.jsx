import SectionHeading from '@/components/ui/SectionHeading';
import Link from 'next/link';

export const metadata = {
  title: 'Journal — Noolin Nayam by Divya',
  description: 'Stories, yarn guides, and styling inspiration from our handmade atelier.',
};

export default function JournalPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="bg-cream border-b border-border/60 py-16 mb-16">
        <div className="editorial-container text-center">
          <SectionHeading
            label="Stories & Reflections"
            headline="The Atelier Journal"
            subtext="Notes on handmade craft, caring for crochet heirlooms, and dressing little ones with care."
            align="center"
            as="h1"
            headlineClassName="text-display-lg"
          />
        </div>
      </div>

      <div className="editorial-container text-center py-16">
        <div className="bg-cream p-12 border border-border max-w-lg mx-auto">
          <p className="text-label-md uppercase tracking-[0.18em] text-warmBrown font-sans font-medium mb-3">Coming Soon</p>
          <h2 className="font-serif font-light text-charcoal text-3xl mb-4">Journal Entries In Preparation</h2>
          <p className="text-body-sm text-charcoal-600 font-light leading-relaxed mb-6">
            We are curating thoughtful articles on crochet care, choosing natural baby fabrics, and styling custom birthday outfits.
          </p>
          <Link href="/shop" className="text-label-md uppercase tracking-[0.14em] text-charcoal border-b border-charcoal pb-1 hover:text-warmBrown">
            Explore the Shop in the meantime
          </Link>
        </div>
      </div>
    </div>
  );
}
