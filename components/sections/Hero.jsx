'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { imageConfig } from '@/lib/image-config';

// ─── HERO MEDIA CONFIG ────────────────────────────────────────────────────────
const HERO_MP4 = imageConfig.hero.videoDesktop || '/assets/hero/desktop-hero.mp4';
const HERO_WEBM = imageConfig.hero.videoWebm || '/assets/hero/desktop-hero.webm';
const HERO_POSTER = imageConfig.hero.videoPoster || '/assets/hero/desktop-hero-poster.jpg';
const HERO_DESKTOP_IMAGE = imageConfig.hero.desktop || '/assets/hero/desktop-hero.jpeg';
const HERO_MOBILE_IMAGE = imageConfig.hero.mobile || '/assets/hero/mobile-hero.jpeg';

// Configurable flag for mobile video playback (false = static image on mobile)
const HERO_VIDEO_ON_MOBILE = imageConfig.hero.heroVideoOnMobile ?? false;

export default function Hero() {
  const parallaxRef = useRef(null);
  const videoRef = useRef(null);

  const [useVideo, setUseVideo] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [posterImage, setPosterImage] = useState(HERO_POSTER);

  useEffect(() => {
    const checkMobile = () => {
      const mobileState = window.innerWidth < 768;
      setIsMobile(mobileState);

      // Disable video on mobile if HERO_VIDEO_ON_MOBILE is false
      if (mobileState && !HERO_VIDEO_ON_MOBILE) {
        setUseVideo(false);
        setPosterImage(HERO_MOBILE_IMAGE);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 1. Accessibility Check: prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      setUseVideo(false);
    }

    // Listener for reduced motion setting changes
    const handleMotionChange = (e) => {
      if (e.matches) setUseVideo(false);
    };
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    // Subtle parallax on scroll
    const el = parallaxRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrolled = window.scrollY;
      el.style.transform = `translateY(${scrolled * 0.15}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleVideoError = () => {
    // If video file fails or isn't placed yet, fall back seamlessly to static image
    setUseVideo(false);
  };

  const handlePosterError = () => {
    // Fall back to desktop-hero.jpeg or mobile-hero.jpeg if poster frame fails
    setPosterImage(isMobile ? HERO_MOBILE_IMAGE : HERO_DESKTOP_IMAGE);
  };

  return (
    <>
      {/* ── 1. FULL-VIEWPORT HERO BACKGROUND (Desktop Video vs Mobile Static Image) ── */}
      <section
        className="relative w-full h-screen overflow-hidden bg-charcoal"
        aria-label="Hero — Noolin Nayam by Divya"
      >
        {/* Background container with parallax */}
        <div
          ref={parallaxRef}
          className="absolute inset-0 scale-105"
          style={{ willChange: 'transform' }}
        >
          {useVideo && !isMobile ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              loop
              onError={handleVideoError}
              className="w-full h-full object-cover object-center hidden md:block"
            >
              <source src={HERO_WEBM} type="video/webm" />
              <source src={HERO_MP4} type="video/mp4" />
              <img
                src={posterImage}
                alt="Handcrafted crochet and kidswear background"
                onError={handlePosterError}
                className="w-full h-full object-cover object-center"
              />
            </video>
          ) : null}

          {/* Static Mobile / Fallback Hero Image (Pure static, no video on mobile) */}
          {(!useVideo || isMobile) && (
            <div className="relative w-full h-full">
              <picture>
                <source media="(max-width: 767px)" srcset={HERO_MOBILE_IMAGE} />
                <source media="(min-width: 768px)" srcset={HERO_DESKTOP_IMAGE} />
                <img
                  src={isMobile ? HERO_MOBILE_IMAGE : posterImage}
                  alt="Handcrafted crochet and kidswear by Noolin Nayam by Divya"
                  onError={handlePosterError}
                  className="w-full h-full object-cover object-center"
                />
              </picture>
            </div>
          )}
        </div>

        {/* Subtle top shadow for header navigation readability */}
        <div
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Subtle bottom shadow for smooth section transition */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-charcoal/40 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-fade-in"
          aria-hidden="true"
        >
          <span className="text-label-sm uppercase tracking-[0.22em] text-ivory/80 font-sans font-medium drop-shadow-sm">
            Scroll
          </span>
          <div className="w-px h-10 bg-ivory/40 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-ivory animate-[slide-in-right_1.5s_ease_infinite]"
              style={{ animationName: 'scrollLine' }}
            />
          </div>
        </div>

        <style jsx>{`
          @keyframes scrollLine {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}</style>
      </section>

      {/* ── 2. HANDCRAFTED MOMENTS SECTION (BELOW HERO) ── */}
      <section className="w-full bg-mocha-soft py-16 sm:py-24 border-b border-sand/40 relative z-20">
        <div className="site-container">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
            {/* Pre-label */}
            <p className="text-label-md sm:text-label-lg uppercase tracking-[0.24em] text-warmBrown font-sans font-medium mb-3">
              Handcrafted with love
            </p>

            {/* Headline */}
            <h1 className="font-serif font-light text-charcoal text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.01em] mb-4">
              Handmade Crochet &amp; Beautiful Kids Creations
            </h1>

            {/* Decorative divider */}
            <div className="w-12 h-px bg-warmBrown/40 my-3" aria-hidden="true" />

            {/* Supporting Copy */}
            <p className="text-body-md sm:text-body-lg text-charcoal-600 font-light font-sans max-w-lg mb-8 leading-relaxed">
              Beautifully made crochet & kidswear, created stitch by stitch.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-charcoal text-ivory px-8 py-4 text-label-lg uppercase tracking-[0.16em] font-medium hover:bg-warmBrown transition-colors duration-300 group shadow-warm-sm"
              >
                <span>Shop Collection</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/custom-orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-charcoal/30 text-charcoal px-8 py-4 text-label-lg uppercase tracking-[0.16em] font-medium hover:bg-charcoal/5 transition-colors duration-300"
              >
                Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
