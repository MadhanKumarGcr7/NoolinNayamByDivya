import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { getWhatsAppUrl } from '@/lib/config';

export default function CustomOrderTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-surfaceAlt relative overflow-hidden" aria-labelledby="custom-teaser-heading">
      {/* Subtle background decoration */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(107, 79, 58, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(232, 196, 184, 0.2) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="site-container relative z-10">
        <div className="max-w-4xl mx-auto text-center reveal">
          <SectionHeading
            label=" Bespoke Atelier Service"
            headline="Dream it. We'll crochet it."
            subtext="Have a vision for a birthday frock, baby shower outfit, or sibling matching set? We specialize in turning your custom ideas into handcrafted reality."
            align="center"
            as="h2"
            headlineClassName="text-display-lg"
            className="mb-12"
          />

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-left">
            {[
              {
                title: 'Custom Sizing & Fit',
                desc: 'Tailored measurements for newborns to young children to ensure effortless comfort.',
              },
              {
                title: 'Custom Palette',
                desc: 'Choose from our curated spectrum of soft yarns, muted tones, and custom shades.',
              },
              {
                title: 'Occasion Outfits',
                desc: 'Bespoke designs for birthdays, naming ceremonies, family portraits, and festive events.',
              },
              {
                title: 'Sibling Matching',
                desc: 'Coordinated sets designed for brothers and sisters to make moments extra sweet.',
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className="bg-ivory/80 backdrop-blur-sm p-6 border border-border/80 shadow-warm-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-label-sm uppercase tracking-[0.2em] text-warmBrown font-sans font-semibold mb-2 block">
                    0{idx + 1}
                  </span>
                  <h3 className="font-serif font-light text-charcoal text-xl mb-2">{item.title}</h3>
                  <p className="text-body-xs text-charcoal-600 font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal reveal-delay-2">
            <Button href="/custom-orders" variant="primary" size="xl" arrow>
              CREATE YOUR CUSTOM PIECE
            </Button>

            <a
              href={getWhatsAppUrl("Hi! I'm interested in discussing a custom order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-5 border border-charcoal text-charcoal text-label-xl uppercase tracking-[0.16em] font-medium hover:bg-charcoal hover:text-ivory transition-all duration-400"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
