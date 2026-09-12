'use client';

import Hero from '@/components/sections/Hero';
import CategoryIconsSection from '@/components/sections/CategoryIconsSection';
import BrandIntro from '@/components/sections/BrandIntro';
import TrustBadgesSection from '@/components/sections/TrustBadgesSection';
import FeaturedCollections from '@/components/sections/FeaturedCollections';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import CraftsmanshipSection from '@/components/sections/CraftsmanshipSection';
import CrochetFeature from '@/components/sections/CrochetFeature';
import KidswearSection from '@/components/sections/KidswearSection';
import CustomOrderTeaser from '@/components/sections/CustomOrderTeaser';
import BrandStoryTeaser from '@/components/sections/BrandStoryTeaser';
import Testimonials from '@/components/sections/Testimonials';
import InstagramGallery from '@/components/sections/InstagramGallery';
import Newsletter from '@/components/sections/Newsletter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* 3. Hero */}
      <Hero />

      {/* 4. Circular Category Icons */}
      <CategoryIconsSection />

      {/* 5. Brand Introduction */}
      <BrandIntro />

      {/* 6. Featured Collections */}
      <FeaturedCollections />

      {/* 7. Featured Products */}
      <FeaturedProducts />

      {/* 8. Craftsmanship Story */}
      <CraftsmanshipSection />

      {/* 9. Trust & Value Propositions Banner */}
      <TrustBadgesSection />

      {/* 10. Crochet Feature */}
      <CrochetFeature />

      {/* 11. Kidswear Section */}
      <KidswearSection />

      {/* 12. Custom Order Section */}
      <CustomOrderTeaser />

      {/* 14. Brand Story Teaser */}
      <BrandStoryTeaser />

      {/* 15. Testimonials */}
      <Testimonials />

      {/* 16. Instagram / Social Gallery */}
      <InstagramGallery />

      {/* 17. Newsletter */}
      <Newsletter />
    </div>
  );
}
