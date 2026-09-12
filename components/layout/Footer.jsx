import Link from 'next/link';
import { brandConfig } from '@/lib/config';
import { getWhatsAppUrl } from '@/lib/config';

const footerColumns = [
  {
    heading: 'Shop',
    links: [
      { href: '/shop?category=crochet',   label: 'Crochet'       },
      { href: '/shop?category=kidswear',  label: 'Kidswear'      },
      { href: '/shop?category=new-arrivals', label: 'New Arrivals' },
      { href: '/custom-orders',           label: 'Custom Orders' },
    ],
  },
  {
    heading: 'About',
    links: [
      { href: '/our-story',     label: 'Our Story'      },
      { href: '/workshops',     label: 'Workshops & Community' },
      { href: '/craftsmanship', label: 'Craftsmanship'  },
      { href: '/journal',       label: 'Journal'        },
    ],
  },
  {
    heading: 'Help',
    links: [
      { href: '/contact',          label: 'Contact'        },
      { href: '/shipping-policy',  label: 'Shipping'       },
      { href: '/return-policy',    label: 'Return Policy'  },
      { href: '/size-guide',       label: 'Size Guide'     },
      { href: '/care-guide',       label: 'Care Guide'     },
      { href: '/faq',              label: 'FAQ'            },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-ivory/80" role="contentinfo">
      {/* Main footer */}
      <div className="site-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-serif font-light text-ivory text-2xl tracking-[0.04em] hover:opacity-80 transition-opacity block mb-4"
            >
              Noolin Nayam by Divya
            </Link>
            <p className="text-body-sm text-ivory/60 font-light italic font-serif mb-6 max-w-xs leading-relaxed">
              &quot;Handcrafted with love.&quot;
            </p>
            <p className="text-body-xs text-ivory/50 font-sans font-light leading-relaxed max-w-xs">
              Beautifully made crochet and kidswear, created stitch by stitch. Every piece made slowly, with care.
            </p>

            {/* Circular Social & Action Badges */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {/* Instagram */}
              <a
                href={brandConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-[#B86B5A] text-ivory flex items-center justify-center transition-transform hover:scale-110 shadow-sm border border-ivory/20"
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-[#768065] text-ivory flex items-center justify-center transition-transform hover:scale-110 shadow-sm border border-ivory/20"
                title="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href={brandConfig.social.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-10 h-10 rounded-full bg-[#9E5343] text-ivory flex items-center justify-center transition-transform hover:scale-110 shadow-sm border border-ivory/20"
                title="Pinterest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${brandConfig.email}`}
                aria-label="Email Us"
                className="w-10 h-10 rounded-full bg-[#E5D3C5] text-charcoal flex items-center justify-center transition-transform hover:scale-110 shadow-sm border border-charcoal/20"
                title="Email Us"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </a>

              {/* Phone */}
              <a
                href={`tel:${brandConfig.phone}`}
                aria-label="Call Us"
                className="w-10 h-10 rounded-full bg-[#B86B5A] text-ivory flex items-center justify-center transition-transform hover:scale-110 shadow-sm border border-ivory/20"
                title="Call Us"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.45-5.244-3.798-6.695-6.695l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-label-lg uppercase tracking-[0.18em] font-sans font-medium text-ivory/40 mb-5">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-ivory/60 font-light hover:text-ivory transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ivory/10">
        <div className="site-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-label-md text-ivory/30 font-sans font-light uppercase tracking-[0.16em]">
              © {year} Noolin Nayam by Divya. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {[
                { href: '/privacy-policy',         label: 'Privacy Policy'      },
                { href: '/terms-and-conditions',   label: 'Terms & Conditions'  },
                { href: '/shipping-policy',        label: 'Shipping Policy'     },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-label-sm text-ivory/30 hover:text-ivory/60 transition-colors uppercase tracking-[0.14em]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
