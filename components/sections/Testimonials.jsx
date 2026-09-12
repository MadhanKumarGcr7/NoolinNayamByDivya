'use client';

import { useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';

// Clearly marked placeholder testimonials per Section 13 content rules
const testimonials = [
  {
    id: 1,
    quote:
      "The crochet dress we ordered for my daughter's first birthday was beyond stunning. The yarn was so soft against her skin, and the craftsmanship is something we will cherish forever.",
    author: "[PLACEHOLDER — Happy Parent]",
    location: "Chennai",
    product: "Ivory Bloom Crochet Dress",
  },
  {
    id: 2,
    quote:
      "Divya customized the color palette specifically to match our family photoshoot theme. The attention to detail and personal care is unmatched.",
    author: "[PLACEHOLDER — Customer Review]",
    location: "Bengaluru",
    product: "Sand & Blush Photoshoot Set",
  },
  {
    id: 3,
    quote:
      "You can truly feel the love stitched into every loop. It arrived beautifully packaged, feeling like a high-end luxury boutique creation.",
    author: "[PLACEHOLDER — Customer Review]",
    location: "Mumbai",
    product: "Blush Petal Baby Romper",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section className="py-24 lg:py-32 bg-ivory text-charcoal border-y border-border/50" aria-labelledby="testimonials-heading">
      <div className="editorial-container">
        <div className="text-center mb-12 reveal">
          <SectionHeading
            label="Kind Words"
            headline="From our community."
            align="center"
            as="h2"
            headlineClassName="text-display-md"
          />
        </div>

        {/* Minimalist typography quote block */}
        <div className="relative max-w-3xl mx-auto text-center px-4 min-h-[220px] flex flex-col justify-center reveal reveal-delay-2">
          {/* Quote Mark */}
          <span className="font-serif text-display-2xl text-sand/40 leading-none select-none block mb-[-2rem] pointer-events-none" aria-hidden="true">
            “
          </span>

          <blockquote className="transition-all duration-500 ease-luxury">
            <p className="font-serif font-light text-charcoal text-2xl sm:text-3xl lg:text-4xl leading-relaxed mb-6 italic">
              &quot;{testimonials[current].quote}&quot;
            </p>
            <cite className="not-italic block">
              <span className="text-label-lg uppercase tracking-[0.18em] font-sans font-medium text-charcoal block mb-1">
                {testimonials[current].author}
              </span>
              <span className="text-body-xs font-sans text-charcoal-400 font-light">
                {testimonials[current].location} • <span className="italic font-serif text-warmBrown">{testimonials[current].product}</span>
              </span>
            </cite>
          </blockquote>
        </div>

        {/* Minimal Slider Controls */}
        <div className="flex items-center justify-center gap-6 mt-12 reveal reveal-delay-3">
          <button
            onClick={prev}
            aria-label="Previous quote"
            className="p-2 text-charcoal-400 hover:text-charcoal transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 rounded-full ${current === idx ? 'w-8 bg-warmBrown' : 'w-1.5 bg-sand'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next quote"
            className="p-2 text-charcoal-400 hover:text-charcoal transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
