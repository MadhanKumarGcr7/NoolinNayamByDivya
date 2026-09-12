'use client';

import { brandConfig } from '@/lib/config';

const INSTAGRAM_POSTS = [
  { id: '1', url: 'https://www.instagram.com/reel/Dcdxvwhhf6q', image: '/assets/reels/ig-1.jpg', alt: 'Handcrafted crochet dress details' },
  { id: '2', url: 'https://www.instagram.com/reel/Db3KUywB6Px', image: '/assets/reels/ig-2.jpg', alt: 'Organic cotton yarn & crochet work' },
  { id: '3', url: 'https://www.instagram.com/reel/DbVnRWRhdpk', image: '/assets/reels/ig-3.jpg', alt: 'Little kidswear crochet frock' },
  { id: '4', url: 'https://www.instagram.com/reel/Db8TZ55BfW3', image: '/assets/reels/ig-4.jpg', alt: 'Artisan hands stitching crochet open-lace' },
  { id: '5', url: 'https://www.instagram.com/reel/Dc6HWKeBxxw', image: '/assets/reels/ig-5.jpg', alt: 'Minimalist embroidered kids smock top' },
];

export default function InstagramGallery() {
  return (
    <section className="py-20 lg:py-28 bg-cream overflow-hidden" aria-labelledby="instagram-heading">
      <div className="site-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 reveal">
          <div>
            <p className="section-label mb-2">Social Atelier</p>
            <h2 id="instagram-heading" className="font-serif font-light text-charcoal text-display-md">
              Follow our little world.
            </h2>
          </div>
          <a
            href={brandConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-label-lg uppercase tracking-[0.16em] text-warmBrown hover:text-charcoal transition-colors group font-medium"
          >
            <span>{brandConfig.social.instagramHandle}</span>
            <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>

        {/* Clean Instagram Thumbnails Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 reveal reveal-delay-2">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden block aspect-square rounded-2xl bg-ivory shadow-warm-sm hover:shadow-warm-md transition-all duration-500"
              aria-label={`View Instagram post: ${post.alt}`}
            >
              <img
                src={post.image}
                alt={post.alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-charcoal/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-ivory">
                <svg className="w-7 h-7 fill-current transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center reveal reveal-delay-3">
          <a
            href={brandConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 border border-charcoal text-charcoal text-label-lg uppercase tracking-[0.16em] hover:bg-charcoal hover:text-ivory transition-colors duration-400 font-medium"
          >
            FOLLOW ON INSTAGRAM
          </a>
        </div>
      </div>
    </section>
  );
}
