'use client';

import WorkshopsSection from '@/components/sections/WorkshopsSection';
import WhatsAppCommunityCTA from '@/components/sections/WhatsAppCommunityCTA';

export default function PublicWorkshopsPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      {/* Page Hero Header */}
      <div className="bg-mocha-gradient border-b border-border/60 py-16 mb-12 shadow-warm-xs">
        <div className="site-container text-center max-w-3xl mx-auto reveal">
          <p className="section-label mb-3">Community & Hands-On Craft</p>
          <h1 className="font-serif font-light text-charcoal text-display-md sm:text-display-lg leading-tight">
            Crochet Workshops & Gatherings.
          </h1>
          <p className="text-body-md text-charcoal-600 font-light mt-4 leading-relaxed">
            Stitch slowly in cozy company. Join our hands-on workshops in Bengaluru or online, designed for all skill levels from complete beginners to advanced crocheters.
          </p>
        </div>
      </div>

      {/* Main Workshops Grid & Reservation Flow */}
      <WorkshopsSection showHeader={false} limit={12} />

      {/* Community Callout */}
      <div id="whatsapp-community" className="mt-16">
        <WhatsAppCommunityCTA source="workshop_page" />
      </div>
    </div>
  );
}
