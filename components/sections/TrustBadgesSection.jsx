'use client';

import StarBorder from '@/components/ui/StarBorder';

const trustBadges = [
  {
    id: 'handmade-love',
    title: 'HANDMADE WITH LOVE',
    subtitle: 'SLOW FASHION',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        {/* Leaf sprigs */}
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Cupped hands */}
        <path d="M30 64 C35 55 42 62 50 64 C58 62 65 55 70 64 C64 74 36 74 30 64 Z" fill="#D98A78" stroke="#4A2E25" strokeWidth="1.2" />
        {/* Heart floating above hands */}
        <path d="M50 48 C44 40 36 44 42 52 L50 60 L58 52 C64 44 56 40 50 48 Z" fill="#B85548" stroke="#4A2E25" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'premium-quality',
    title: 'PREMIUM QUALITY',
    subtitle: 'SUPERIOR YARN',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Ribbon banner tails */}
        <path d="M38 60 L34 80 L44 74 L50 80 L46 60 Z M62 60 L54 80 L60 74 L66 80 L62 60 Z" fill="#C27A68" stroke="#4A2E25" strokeWidth="1" />
        {/* Award Rosette Badge */}
        <circle cx="50" cy="46" r="18" fill="#F8F3EC" stroke="#4A2E25" strokeWidth="1.5" />
        {/* Scalloped edge */}
        <circle cx="50" cy="46" r="14" fill="#B85548" />
        {/* Heart in center */}
        <path d="M50 42 C46 36 40 40 44 47 L50 53 L56 47 C60 40 54 36 50 42 Z" fill="#F8F3EC" />
      </svg>
    ),
  },
  {
    id: 'safe-packaging',
    title: 'SAFE & SECURE',
    subtitle: 'PACKAGING',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Gift Box */}
        <path d="M30 46 L70 46 L70 72 L30 72 Z" fill="#C27A68" stroke="#4A2E25" strokeWidth="1.5" />
        <path d="M26 40 L74 40 L74 46 L26 46 Z" fill="#D98A78" stroke="#4A2E25" strokeWidth="1.5" />
        {/* Vertical ribbon */}
        <path d="M47 40 L53 40 L53 72 L47 72 Z" fill="#F8F3EC" stroke="#4A2E25" strokeWidth="0.8" />
        {/* Flower ornament on gift */}
        <circle cx="50" cy="38" r="4" fill="#768065" stroke="#4A2E25" strokeWidth="0.8" />
        <circle cx="50" cy="38" r="1.5" fill="#B85548" />
      </svg>
    ),
  },
  {
    id: 'worldwide-shipping',
    title: 'WORLDWIDE',
    subtitle: 'SHIPPING',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Delivery Truck */}
        <path d="M24 44 L54 44 L54 66 L24 66 Z" fill="#F8F3EC" stroke="#4A2E25" strokeWidth="1.5" />
        <path d="M54 50 L66 50 L74 58 L74 66 L54 66 Z" fill="#C27A68" stroke="#4A2E25" strokeWidth="1.5" />
        {/* Wheels */}
        <circle cx="36" cy="66" r="6" fill="#4A3525" stroke="#F8F3EC" strokeWidth="1.5" />
        <circle cx="64" cy="66" r="6" fill="#4A3525" stroke="#F8F3EC" strokeWidth="1.5" />
        {/* Heart on truck side */}
        <path d="M39 52 C37 48 33 50 36 55 L39 58 L42 55 C45 50 41 48 39 52 Z" fill="#B85548" />
      </svg>
    ),
  },
  {
    id: 'secure-payment',
    title: 'SECURE',
    subtitle: 'PAYMENT',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Credit Card */}
        <rect x="24" y="38" width="46" height="30" rx="3" fill="#C27A68" stroke="#4A2E25" strokeWidth="1.5" />
        <line x1="24" y1="46" x2="70" y2="46" stroke="#4A2E25" strokeWidth="2.5" />
        {/* Padlock */}
        <rect x="58" y="52" width="18" height="18" rx="2" fill="#F8F3EC" stroke="#4A2E25" strokeWidth="1.2" />
        <path d="M62 52 V46 C62 42 72 42 72 46 V52" stroke="#4A2E25" strokeWidth="1.5" fill="none" />
        <circle cx="67" cy="60" r="2" fill="#B85548" />
      </svg>
    ),
  },
  {
    id: 'customer-support',
    title: 'CUSTOMER',
    subtitle: 'SUPPORT',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Headset Arc */}
        <path d="M30 52 C30 32 70 32 70 52" stroke="#4A3525" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Ear cups */}
        <rect x="24" y="48" width="10" height="16" rx="3" fill="#B85548" stroke="#4A2E25" strokeWidth="1.2" />
        <rect x="66" y="48" width="10" height="16" rx="3" fill="#B85548" stroke="#4A2E25" strokeWidth="1.2" />
        {/* Mic arm */}
        <path d="M70 58 Q72 70 58 70" stroke="#4A3525" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="56" cy="70" r="2.5" fill="#B85548" />
        {/* Heart in middle */}
        <path d="M50 48 C47 43 42 46 45 51 L50 56 L55 51 C58 46 53 43 50 48 Z" fill="#B85548" />
      </svg>
    ),
  },
  {
    id: 'eco-friendly',
    title: 'ECO-FRIENDLY',
    subtitle: 'PRACTICES',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20">
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Twin Green Leaves */}
        <path d="M50 68 C45 50 26 44 32 32 C48 34 50 56 50 68 Z" fill="#768065" stroke="#4A2E25" strokeWidth="1.2" />
        <path d="M50 68 C55 48 74 40 68 28 C52 32 50 54 50 68 Z" fill="#88987C" stroke="#4A2E25" strokeWidth="1.2" />
        <path d="M50 68 V34" stroke="#4A2E25" strokeWidth="1.2" />
      </svg>
    ),
  },
];

export default function TrustBadgesSection() {
  return (
    <section className="py-16 sm:py-20 bg-ivory text-charcoal overflow-hidden border-b border-sand/40">
      <div className="site-container">
        {/* 7 Circular Trust Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6 justify-items-center mb-14">
          {trustBadges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center text-center group">
              <div className="p-1 transition-transform duration-300 group-hover:scale-105">
                {badge.svgIcon}
              </div>
              <div className="mt-2.5 space-y-0.5">
                <h4 className="font-serif font-medium text-charcoal text-xs sm:text-sm tracking-[0.06em] uppercase">
                  {badge.title}
                </h4>
                <p className="text-[9px] sm:text-[10px] font-sans text-charcoal-400 tracking-[0.16em] uppercase font-light">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tamil & English Motto Banner */}
        <StarBorder
          as="div"
          className="quote-banner-star-border max-w-4xl mx-auto w-full shadow-warm-lg"
          color="#E8C9A0"
          speed="9s"
          thickness={1}
          backgroundColor="#211C18"
          textColor="#F3E9DF"
          borderColor="#3A312B"
        >
          <div className="relative py-8 px-6 sm:px-12 text-center overflow-hidden">
          {/* Decorative Thread Graphics Left & Right with Live Stitching Animation */}
          <div className="hidden sm:flex items-center justify-between absolute inset-x-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-90">
            {/* Left Thread with Fine Needle & French Knot Accent */}
            <svg viewBox="0 0 150 40" className="w-32 h-10 fill-none text-[#D98A78]">
              <g className="animate-needle-glide">
                <path d="M 4 22 L 28 19 L 28 21 Z" fill="currentColor" opacity="0.85" />
                <ellipse cx="24" cy="20" rx="3.5" ry="1.2" fill="#2A2623" />
              </g>
              <path
                d="M 16 21 C 18 14, 24 11, 27 17 C 30 23, 36 27, 46 19 C 56 11, 66 27, 78 19 C 85 14, 90 14, 92 18 C 94 23, 90 26, 87 23 C 85 20, 89 16, 98 19 C 110 23, 126 16, 144 20"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="thread-stitch-left"
              />
              <circle cx="68" cy="23" r="1.8" fill="currentColor" className="knot-pop-1" />
              <circle cx="118" cy="20" r="1.5" fill="currentColor" className="knot-pop-2" />
            </svg>

            {/* Right Thread with Fine Needle & French Knot Accent (Mirrored) */}
            <svg viewBox="0 0 150 40" className="w-32 h-10 fill-none text-[#D98A78] transform scale-x-[-1]">
              <g className="animate-needle-glide">
                <path d="M 4 22 L 28 19 L 28 21 Z" fill="currentColor" opacity="0.85" />
                <ellipse cx="24" cy="20" rx="3.5" ry="1.2" fill="#2A2623" />
              </g>
              <path
                d="M 16 21 C 18 14, 24 11, 27 17 C 30 23, 36 27, 46 19 C 56 11, 66 27, 78 19 C 85 14, 90 14, 92 18 C 94 23, 90 26, 87 23 C 85 20, 89 16, 98 19 C 110 23, 126 16, 144 20"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="thread-stitch-right"
              />
              <circle cx="68" cy="23" r="1.8" fill="currentColor" className="knot-pop-1" />
              <circle cx="118" cy="20" r="1.5" fill="currentColor" className="knot-pop-2" />
            </svg>
          </div>

          <div className="relative z-10 space-y-2">
            {/* Tamil Motto */}
            <h3 className="font-serif font-light text-xl sm:text-3xl text-sand tracking-[0.06em] leading-relaxed flex items-center justify-center gap-3">
              <span>ஒவ்வொரு நூலும் ஒரு கவிதை</span>
              <span className="text-terracotta text-lg sm:text-2xl">♥</span>
            </h3>

            {/* Subtext Divider */}
            <div className="w-16 h-px bg-sand/30 mx-auto my-2" />

            {/* English Motto */}
            <p className="text-label-md sm:text-label-lg uppercase tracking-[0.3em] text-ivory/70 font-sans font-light">
              EVERY THREAD IS A POEM
            </p>
          </div>

          <style jsx>{`
            .thread-stitch-left {
              stroke-dasharray: 220;
              stroke-dashoffset: 220;
              animation: stitchDraw 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards, threadFlow 4s ease-in-out infinite 2.5s;
            }
            .thread-stitch-right {
              stroke-dasharray: 220;
              stroke-dashoffset: 220;
              animation: stitchDraw 2.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards, threadFlow 4s ease-in-out infinite 2.8s;
            }
            .animate-needle-glide {
              animation: needleGlide 2.8s ease-in-out infinite alternate;
            }
            .knot-pop-1 {
              animation: knotPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards;
              opacity: 0;
            }
            .knot-pop-2 {
              animation: knotPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.8s forwards;
              opacity: 0;
            }

            @keyframes stitchDraw {
              0% { stroke-dashoffset: 220; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes needleGlide {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-1.2px) rotate(-1deg); }
              100% { transform: translateY(1px) rotate(0.5deg); }
            }
            @keyframes knotPop {
              0% { opacity: 0; transform: scale(0); }
              70% { opacity: 1; transform: scale(1.3); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes threadFlow {
              0%, 100% { opacity: 0.85; stroke-dashoffset: 0; }
              50% { opacity: 1; stroke-dashoffset: -4; }
            }
          `}</style>
        </div>
        </StarBorder>
      </div>
    </section>
  );
}
