'use client';

import Link from 'next/link';

const categories = [
  {
    id: 'crochet-creations',
    title: 'CROCHET',
    subtitle: 'CREATIONS',
    href: '/shop?category=crochet',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24">
        {/* Outer double circle */}
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        {/* Leaf sprigs left & right */}
        <path d="M18 42 C16 48 20 54 22 58 M17 46 C13 45 11 40 13 37 M21 52 C17 53 14 58 17 61" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M82 42 C84 48 80 54 78 58 M83 46 C87 45 89 40 87 37 M79 52 C83 53 86 58 83 61" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Yarn ball */}
        <circle cx="48" cy="54" r="20" fill="#C27A68" stroke="#4A2E25" strokeWidth="1.5" />
        <path d="M34 50 C40 40 56 40 62 50 M32 55 C42 65 54 65 64 55 M38 42 C50 56 50 62 44 72 M52 36 C42 50 58 64 58 72" stroke="#FAF4EE" strokeWidth="1.5" fill="none" opacity="0.85" />
        {/* Crochet Hook */}
        <path d="M26 74 L68 28 C70 26 74 26 76 28 C77 29 76 31 74 32 C72 32 69 31 68 33 L26 74" stroke="#4A3525" strokeWidth="2.5" strokeLinecap="round" fill="#8C5C40" />
        <path d="M72 26 Q76 22 74 20 Q70 20 68 24" stroke="#4A3525" strokeWidth="2" fill="none" />
        {/* Heart trail */}
        <path d="M60 66 Q66 70 70 66 Q74 62 70 58 C68 62 64 64 60 66 Z" fill="#B85548" stroke="#4A2E25" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    id: 'kids-wear',
    title: 'KIDS WEAR',
    subtitle: 'COMFORT & STYLE',
    href: '/shop?category=kidswear',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24">
        {/* Outer double circle */}
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        {/* Leaf sprigs */}
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Wooden Hanger */}
        <path d="M50 24 C52 20 54 20 54 23 C54 27 48 29 48 33 L34 40 L66 40 Z" stroke="#8C5C40" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Kid dress */}
        <path d="M42 38 L36 44 L40 48 L44 44 L50 46 L56 44 L60 48 L64 44 L58 38 Z" fill="#D98A78" stroke="#4A2E25" strokeWidth="1.2" />
        <path d="M40 48 Q32 74 28 76 L72 76 Q68 74 60 48 Z" fill="#F5E6D8" stroke="#4A2E25" strokeWidth="1.2" />
        {/* Floral Embroidery on dress */}
        <circle cx="50" cy="56" r="2.5" fill="#B85548" />
        <circle cx="45" cy="62" r="2" fill="#B85548" />
        <circle cx="55" cy="62" r="2" fill="#B85548" />
        <path d="M42 66 Q50 68 58 66" stroke="#6E7D63" strokeWidth="1.2" fill="none" />
        {/* Bow tie */}
        <path d="M47 48 Q50 50 53 48 Q55 52 50 51 Q45 52 47 48 Z" fill="#B85548" />
      </svg>
    ),
  },
  {
    id: 'women-wear',
    title: 'WOMEN WEAR',
    subtitle: 'TIMELESS ELEGANCE',
    href: '/shop?category=crochet',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24">
        {/* Outer double circle */}
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        {/* Leaf sprigs */}
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Wooden Hanger */}
        <path d="M50 20 C52 16 54 16 54 19 C54 23 48 25 48 29 L35 36 L65 36 Z" stroke="#8C5C40" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Women Wrap Dress */}
        <path d="M42 34 L33 44 C33 44 44 50 50 50 C56 50 67 44 67 44 L58 34 Z" fill="#C27A68" stroke="#4A2E25" strokeWidth="1.2" />
        <path d="M45 49 L24 80 Q50 84 76 80 L55 49 Z" fill="#B86B5A" stroke="#4A2E25" strokeWidth="1.2" />
        <path d="M48 48 Q44 62 36 78 M52 48 Q58 62 64 78" stroke="#F5E6D8" strokeWidth="1" fill="none" opacity="0.8" />
        {/* Waist tie */}
        <path d="M42 49 Q50 52 58 49" stroke="#4A2E25" strokeWidth="2" fill="none" />
        <path d="M54 50 Q58 60 56 66 M56 50 Q62 58 64 64" stroke="#4A2E25" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: 'accessories',
    title: 'ACCESSORIES',
    subtitle: 'HANDMADE CHARM',
    href: '/shop?category=crochet',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24">
        {/* Outer double circle */}
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        {/* Leaf sprigs */}
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Bag Handles */}
        <path d="M40 44 C40 30 60 30 60 44" stroke="#4A3525" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Crochet Bag */}
        <path d="M30 44 L70 44 C72 44 74 46 73 50 L68 74 C67 78 63 80 58 80 L42 80 C37 80 33 78 32 74 L27 50 C26 46 28 44 30 44 Z" fill="#B86B5A" stroke="#4A2E25" strokeWidth="1.5" />
        {/* Woven Texture lines */}
        <path d="M32 52 H68 M31 60 H69 M30 68 H70 M33 74 H67" stroke="#D98A78" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
        {/* Daisy Flower Charm */}
        <circle cx="66" cy="62" r="7" fill="#F8F3EC" stroke="#4A2E25" strokeWidth="1" />
        <circle cx="66" cy="62" r="2.5" fill="#D98A78" />
        {/* Tassel */}
        <path d="M66 69 L64 78 M66 69 L67 78 M66 69 L70 77" stroke="#8C5C40" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'workshops',
    title: 'WORKSHOPS',
    subtitle: 'LEARN & CREATE',
    href: '/workshops',
    svgIcon: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24">
        {/* Outer double circle */}
        <circle cx="50" cy="50" r="46" fill="#F8F3EC" stroke="#4A3F35" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#8C7A6B" strokeWidth="0.75" strokeDasharray="3 2" />
        {/* Leaf sprigs */}
        <path d="M16 48 C14 55 20 62 22 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        <path d="M84 48 C86 55 80 62 78 66" stroke="#6E7D63" strokeWidth="1.5" fill="#88987C" opacity="0.9" />
        {/* Cup */}
        <path d="M34 52 L66 52 L62 76 C61 79 57 81 53 81 L47 81 C43 81 39 79 38 76 Z" fill="#F8F3EC" stroke="#4A2E25" strokeWidth="1.5" />
        <path d="M65 56 C71 56 73 66 63 68" stroke="#4A2E25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M50 63 Q53 66 50 69 Q47 66 50 63 Z" fill="#B85548" />
        {/* Tools sticking out of mug */}
        {/* Yarn ball inside */}
        <circle cx="42" cy="48" r="9" fill="#B86B5A" stroke="#4A2E25" strokeWidth="1" />
        <circle cx="56" cy="46" r="8" fill="#768065" stroke="#4A2E25" strokeWidth="1" />
        {/* Hooks & Scissors */}
        <path d="M38 42 L28 22 M48 42 L48 18 M58 40 L68 22" stroke="#4A3525" strokeWidth="2" strokeLinecap="round" />
        {/* Scissors rings */}
        <circle cx="64" cy="20" r="3.5" fill="none" stroke="#4A3525" strokeWidth="1.2" />
        <circle cx="71" cy="24" r="3.5" fill="none" stroke="#4A3525" strokeWidth="1.2" />
      </svg>
    ),
  },
];

export default function CategoryIconsSection() {
  return (
    <section className="py-14 sm:py-20 bg-cream/60 border-y border-sand/30 overflow-hidden">
      <div className="site-container">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <p className="text-label-md uppercase tracking-[0.24em] text-warmBrown font-sans font-medium mb-2">
            Explore Handcrafted Categories
          </p>
          <h2 className="font-serif font-light text-charcoal text-2xl sm:text-4xl">
            Curated Collections &amp; Craft
          </h2>
          <div className="w-10 h-px bg-warmBrown/40 mx-auto mt-3" />
        </div>

        {/* 5 Circular Category Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none"
            >
              {/* Circular Badge wrapper */}
              <div className="relative p-2 rounded-full transition-shadow duration-300 group-hover:shadow-warm-md">
                {cat.svgIcon}
              </div>

              {/* Title & Subtitle */}
              <div className="mt-3.5 space-y-0.5">
                <h3 className="font-serif font-medium text-charcoal text-sm sm:text-base tracking-[0.08em] uppercase group-hover:text-warmBrown transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[10px] sm:text-xs font-sans text-charcoal-500 tracking-[0.18em] uppercase font-light">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
