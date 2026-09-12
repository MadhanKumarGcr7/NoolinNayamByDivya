/**
 * Image Configuration
 * ────────────────────────────────────────────────────────────────────────────
 * Centralized registry of all image paths used across the site.
 * Update these paths once your real photography is added to /public/assets/.
 *
 * Asset folder structure:
 *   public/assets/hero/       ← desktop-hero.jpg + mobile-hero.jpg
 *   public/assets/products/   ← per-product image folders (product-slug/1.jpg etc.)
 *   public/assets/kidswear/   ← lifestyle kidswear images
 *   public/assets/crochet/    ← yarn, texture, craft detail images
 *   public/assets/story/      ← founder / atelier images
 *   public/assets/gallery/    ← instagram-style grid images (8–12 images)
 */

export const imageConfig = {
  // ─── HERO ──────────────────────────────────────────────────────────────────
  // Full-viewport hero. Desktop and mobile have separate crops.
  hero: {
    desktop: '/assets/hero/desktop-hero.jpeg', // Recommend: 1920×1080 or 2560×1440
    mobile:  '/assets/hero/mobile-hero.jpg',   // Recommend: 750×1200 portrait crop
    videoDesktop: '/assets/hero/desktop-hero.mp4', // Desktop background video
    videoWebm:    '/assets/hero/desktop-hero.webm', // Optional WebM background video
    videoPoster:  '/assets/hero/desktop-hero-poster.jpg', // Video fallback/poster frame
    videoMobile:  '/assets/hero/mobile-hero.mp4', // Optional mobile video
    heroVideoOnMobile: false, // Default to static image on mobile for performance
    alt:     'Handcrafted crochet and kidswear by noolinnaayambydivya',
  },

  // ─── BRAND INTRO ───────────────────────────────────────────────────────────
  brandIntro: {
    src: '/assets/crochet/brand-intro.jpg',   // Close-up craft/process image
    alt: 'Handmade crochet detail — made with care',
  },

  // ─── CRAFTSMANSHIP ─────────────────────────────────────────────────────────
  craftsmanship: {
    background: '/assets/crochet/craftsmanship-bg.jpg', // Full-width immersive
    alt: 'Every loop tells a story — handcrafted crochet',
  },

  // ─── CROCHET FEATURE (magazine spread) ─────────────────────────────────────
  crochetFeature: [
    { src: '/assets/crochet/yarn-texture.jpg',     alt: 'Natural yarn textures',              aspect: 'portrait' },
    { src: '/assets/crochet/craft-detail.jpg',     alt: 'Crochet craft detail close-up',      aspect: 'square'   },
    { src: '/assets/crochet/finished-garment.jpg', alt: 'Finished handmade crochet garment',  aspect: 'portrait' },
    { src: '/assets/crochet/hands-crafting.jpg',   alt: 'Hands crafting a crochet piece',     aspect: 'square'   },
    { src: '/assets/crochet/stitch-detail.jpg',    alt: 'Crochet stitch detail',              aspect: 'portrait' },
  ],

  // ─── KIDSWEAR ──────────────────────────────────────────────────────────────
  kidswear: {
    hero: '/assets/kidswear/kidswear-hero.jpg',   // Editorial lifestyle photo
    alt:  'Handmade kidswear — soft silhouettes and beautiful details',
  },

  // ─── FEATURED COLLECTIONS (4 tiles) ───────────────────────────────────────
  collections: [
    { src: '/assets/crochet/collection-crochet.jpg',   alt: 'Crochet Stories collection'   },
    { src: '/assets/kidswear/collection-dresses.jpg',  alt: 'Little Dresses collection'    },
    { src: '/assets/kidswear/collection-moments.jpg',  alt: 'Mini Moments collection'      },
    { src: '/assets/crochet/collection-custom.jpg',    alt: 'Custom Creations collection'  },
  ],

  // ─── OUR STORY ─────────────────────────────────────────────────────────────
  story: [
    { src: '/assets/story/story-01.jpg', alt: 'The story behind noolinnaayambydivya' },
    { src: '/assets/story/story-02.jpg', alt: 'Handcrafting with passion'             },
  ],

  // ─── INSTAGRAM GALLERY (8–12 images) ───────────────────────────────────────
  gallery: [
    { src: '/assets/gallery/gallery-01.jpg', alt: 'Handmade crochet piece' },
    { src: '/assets/gallery/gallery-02.jpg', alt: 'Little kidswear outfit' },
    { src: '/assets/gallery/gallery-03.jpg', alt: 'Crochet detail shot'    },
    { src: '/assets/gallery/gallery-04.jpg', alt: 'Custom crochet dress'   },
    { src: '/assets/gallery/gallery-05.jpg', alt: 'Baby crochet outfit'    },
    { src: '/assets/gallery/gallery-06.jpg', alt: 'Handmade kids dress'    },
    { src: '/assets/gallery/gallery-07.jpg', alt: 'Crochet texture detail' },
    { src: '/assets/gallery/gallery-08.jpg', alt: 'Lifestyle kidswear'     },
    { src: '/assets/gallery/gallery-09.jpg', alt: 'Mini crochet moments'   },
  ],

  // ─── LOGO ──────────────────────────────────────────────────────────────────
  logo: {
    light: '/logo/logo-light.svg',  // For use on dark/image backgrounds
    dark:  '/logo/logo-dark.svg',   // For use on light backgrounds
    alt:   'noolinnaayambydivya',
  },
};

export default imageConfig;
