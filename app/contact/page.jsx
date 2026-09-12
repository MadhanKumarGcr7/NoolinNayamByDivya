import SectionHeading from '@/components/ui/SectionHeading';
import FAQSection from '@/components/sections/FAQSection';
import ContactForm from '@/components/contact/ContactForm';
import { brandConfig, getWhatsAppUrl } from '@/lib/config';

export const metadata = {
  title: 'Contact Us — Noolin Nayam by Divya',
  description: 'Get in touch with our studio for inquiries, custom orders, or assistance.',
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="bg-surface border-b border-border/60 py-16 mb-16">
        <div className="editorial-container text-center">
          <SectionHeading
            label="Get In Touch"
            headline="We'd love to hear from you."
            subtext="Have a question about a product, custom sizing, or an existing order? Reach out anytime."
            align="center"
            as="h1"
            headlineClassName="text-display-lg"
          />
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-cream border border-border p-8 space-y-6">
              <h2 className="font-serif font-light text-charcoal text-2xl border-b border-border pb-3">
                Studio Reach
              </h2>

              <div>
                <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium mb-1">Email Inquiry</p>
                <a href={`mailto:${brandConfig.email}`} className="text-body-md font-sans text-charcoal hover:underline">
                  {brandConfig.email}
                </a>
              </div>

              <div>
                <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium mb-1">WhatsApp & Direct Call</p>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-body-md font-sans text-charcoal hover:underline">
                  {brandConfig.phone}
                </a>
              </div>

              <div>
                <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium mb-1">Studio Atelier Location</p>
                <p className="text-body-sm font-sans text-charcoal-600 font-light leading-relaxed">
                  [PLACEHOLDER — Studio Location Address / City, Tamil Nadu, India]
                </p>
              </div>

              <div>
                <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium mb-1">Social</p>
                <a href={brandConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-body-sm font-sans text-charcoal hover:underline block">
                  Instagram: {brandConfig.social.instagramHandle}
                </a>
              </div>
            </div>

            {/* Quick WhatsApp Action Box */}
            <div className="bg-surfaceAlt border border-border p-6 text-center space-y-3">
              <h3 className="font-serif font-light text-charcoal text-xl">Need Immediate Assistance?</h3>
              <p className="text-body-xs text-charcoal-600 font-light">Chat directly with Divya on WhatsApp for fast responses regarding custom orders.</p>
              <a
                href={getWhatsAppUrl('Hi Divya! I have a question about Noolin Nayam by Divya.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em] hover:bg-warmBrown transition-colors"
              >
                <span>Open WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* Embedded FAQ Section */}
        <FAQSection showHeader={true} className="border-t border-border/80 pt-12" />
      </div>
    </div>
  );
}
