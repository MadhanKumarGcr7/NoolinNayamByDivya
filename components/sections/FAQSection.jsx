'use client';

import { useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import { brandConfig, getWhatsAppUrl } from '@/lib/config';

export const faqList = [
  {
    id: 1,
    question: '1. Are all the crochet products handmade?',
    answer: 'Yes! 💕 Each piece is carefully handmade with attention to detail, making every creation unique.',
    category: 'Products',
  },
  {
    id: 2,
    question: '2. Can I customize a crochet product?',
    answer: 'Yes! ✨ Customization may be available for selected products. You can enquire about different colors, sizes, designs, names, or other specific requirements.',
    category: 'Customization',
  },
  {
    id: 3,
    question: '3. How can I enquire about a product?',
    answer: 'Simply click the “Enquire on WhatsApp” button on the product page. You’ll be connected directly with us, where you can ask about the product, pricing, customization, and availability.',
    category: 'Ordering',
  },
  {
    id: 4,
    question: '4. How much do the products cost?',
    answer: 'Prices vary depending on the design, size, materials, and customization. Please contact us on WhatsApp for the exact price of a product.',
    category: 'Pricing',
  },
  {
    id: 5,
    question: '5. How long does it take to make a crochet product?',
    answer: 'Since every piece is handmade, the preparation time depends on the product and customization. We’ll provide an estimated completion time when you enquire.',
    category: 'Ordering',
  },
  {
    id: 6,
    question: '6. Can I choose a different color?',
    answer: 'Yes! 🎨 Depending on the design, you may be able to choose from different colors. Send us your preferred color on WhatsApp and we’ll check the available options.',
    category: 'Customization',
  },
  {
    id: 7,
    question: '7. Do you make custom orders?',
    answer: 'Yes! 💖 We love creating personalized crochet pieces. Share your idea, reference image, preferred colors, or requirements with us, and we\'ll let you know what’s possible.',
    category: 'Customization',
  },
  {
    id: 8,
    question: '8. Do you deliver?',
    answer: 'Yes, delivery options are available. 📦 Delivery time and charges may vary depending on the destination and product.',
    category: 'Delivery',
  },
  {
    id: 9,
    question: '9. Can I see more pictures or videos of a product?',
    answer: 'Of course! 📸 If you’d like to see additional photos, videos, or different angles of a product, just enquire with us on WhatsApp.',
    category: 'Ordering',
  },
  {
    id: 10,
    question: '10. Do you accept returns or exchanges?',
    answer: 'As many crochet products are handmade and may be customized specifically for you, return and exchange policies can vary. Please check with us before confirming a customized request.',
    category: 'Policies',
  },
  {
    id: 11,
    question: '11. How should I care for my crochet products?',
    answer: 'To keep your crochet piece looking beautiful, handle it gently and follow the care instructions provided with the product. Avoid excessive moisture and rough handling.',
    category: 'Care',
  },
  {
    id: 12,
    question: '12. Can I request a completely new design?',
    answer: 'Absolutely! 🌸 If you have an idea that isn\'t currently listed on our website, feel free to share it with us. We\'ll let you know if we can create it.',
    category: 'Customization',
  },
  {
    id: 13,
    question: '13. How can I contact you?',
    answer: 'You can reach us directly through WhatsApp using the enquiry button available throughout the website. 💬',
    category: 'Contact',
  },
];

export default function FAQSection({ showHeader = true, title = "Frequently Asked Questions", className = "" }) {
  const [openId, setOpenId] = useState(1); // Default open first question
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqList.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className={`py-12 bg-ivory ${className}`} aria-labelledby="faq-heading">
      <div className="site-container max-w-4xl mx-auto">
        {showHeader && (
          <div className="text-center mb-10 reveal">
            <SectionHeading
              label="Help Center & Advice"
              headline={title}
              align="center"
              as="h2"
              headlineClassName="text-display-sm sm:text-display-md"
            />
            <p className="text-body-sm text-charcoal-600 font-light mt-3 max-w-xl mx-auto">
              Everything you need to know about our handcrafted crochet items, custom orders, delivery, and care.
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search questions (e.g., custom orders, delivery, care)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-cream border border-border text-body-sm text-charcoal placeholder-charcoal-400 font-sans focus:outline-none focus:border-warmBrown transition-colors pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-cream/40 border border-border transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-cream/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif font-light text-charcoal text-lg sm:text-xl pr-4">
                    {faq.question}
                  </span>
                  <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-warmBrown shrink-0 font-light text-lg">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-body-sm text-charcoal-600 font-light leading-relaxed border-t border-border/40 bg-ivory/60 animate-fadeIn">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                    
                    {faq.question.includes('WhatsApp') && (
                      <div className="mt-3">
                        <a
                          href={getWhatsAppUrl(`Hi Divya! I have a question regarding: ${faq.question}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-label-xs uppercase tracking-[0.14em] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 hover:bg-emerald-100 transition-colors font-medium"
                        >
                          💬 Enquire on WhatsApp ({brandConfig.whatsappPhone})
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-10 bg-cream/30 border border-border p-6">
              <p className="text-body-sm text-charcoal-600 font-light mb-3">No matching questions found for &ldquo;{searchQuery}&rdquo;.</p>
              <a
                href={getWhatsAppUrl(`Hi Divya! I have a question: ${searchQuery}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label-xs uppercase tracking-[0.14em] text-warmBrown underline font-medium"
              >
                Ask Us Directly on WhatsApp →
              </a>
            </div>
          )}
        </div>

        {/* WhatsApp Direct Contact Banner */}
        <div className="mt-12 text-center p-8 bg-cream border border-border">
          <h3 className="font-serif font-light text-charcoal text-xl mb-2">Have another question?</h3>
          <p className="text-body-sm text-charcoal-600 font-light mb-5 max-w-md mx-auto">
            We are always happy to answer your questions and help you pick or customize the perfect handmade piece.
          </p>
          <a
            href={getWhatsAppUrl('Hi Divya! I have a question about your crochet products.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-ivory text-label-md uppercase tracking-[0.16em] hover:bg-warmBrown transition-colors font-medium"
          >
            💬 Ask Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
