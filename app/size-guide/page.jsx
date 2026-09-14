import Image from 'next/image';
import Link from 'next/link';
import { brandConfig } from '@/lib/config';

export const metadata = {
  title: `Size Guide — ${brandConfig.displayName}`,
  description: 'Detailed measurement and size charts for baby, kidswear, skirts, tops, shorts, and pants by Noolin Nayam by Divya.',
};

const SIZE_CHARTS = [
  {
    id: 'short-top',
    title: 'Short Top Size Chart',
    category: 'Tops & Blouses',
    image: '/assets/size-guide/short-top-size-chart.jpg',
    description: 'Bust front alone and garment length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'full-skirt',
    title: 'Full Skirt Size Chart',
    category: 'Full Skirts',
    image: '/assets/size-guide/full-skirt-size-chart.jpg',
    description: 'Waist and full floor/ankle length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'half-skirt',
    title: 'Half Skirt Size Chart',
    category: 'Knee & Mid Skirts',
    image: '/assets/size-guide/half-skirt-size-chart.jpg',
    description: 'Waist and mid-length skirt measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'pant',
    title: 'Pant Size Chart',
    category: 'Trousers & Pants',
    image: '/assets/size-guide/pant-size-chart.jpg',
    description: 'Waist and outseam length measurements in inches for ages 1 to 15 years.',
  },
  {
    id: 'shorts',
    title: 'Shorts Size Chart',
    category: 'Shorts',
    image: '/assets/size-guide/shorts-size-chart.jpg',
    description: 'Waist and side length measurements in inches for ages 1 to 15 years.',
  },
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Header Banner */}
      <section className="section-highlight-copper py-16 px-6 text-center text-charcoal shadow-sm">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="text-label-sm uppercase tracking-[0.24em] text-warmBrown-700 font-semibold block">
            Crafted for Perfect Comfort & Fit
          </span>
          <h1 className="font-serif text-heading-xl font-bold text-charcoal">
            Official Size Guide
          </h1>
          <p className="text-body-md text-charcoal-700 max-w-2xl mx-auto font-sans leading-relaxed">
            Find the ideal fit for your little ones with our comprehensive garment measurement charts in inches. All items are hand-tailored with love.
          </p>
        </div>
      </section>

      {/* Measurement Instructions */}
      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <div className="bg-oatmeal/60 border border-warmBrown/20 rounded-2xl p-8 shadow-sm">
          <h2 className="font-serif text-heading-md font-semibold text-charcoal mb-4 flex items-center gap-3">
            <span>📐</span> How to Measure Your Child
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-body-sm text-charcoal-700">
            <div className="bg-ivory p-5 rounded-xl border border-border">
              <h3 className="font-semibold text-warmBrown font-sans text-label-md uppercase mb-2">1. Chest / Bust</h3>
              <p>Measure under arms around the fullest part of the chest with soft measuring tape flat against the body.</p>
            </div>
            <div className="bg-ivory p-5 rounded-xl border border-border">
              <h3 className="font-semibold text-warmBrown font-sans text-label-md uppercase mb-2">2. Waist</h3>
              <p>Measure around the natural waistline where elastic waistbands comfortably sit on the torso.</p>
            </div>
            <div className="bg-ivory p-5 rounded-xl border border-border">
              <h3 className="font-semibold text-warmBrown font-sans text-label-md uppercase mb-2">3. Length</h3>
              <p>For tops, measure from shoulder seam down. For skirts/pants, measure from waist down to desired hemline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Size Charts Showcase Grid */}
      <section className="max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-heading-lg text-charcoal">Garment Size Charts</h2>
          <p className="text-body-sm text-charcoal-600">All measurements are provided in inches for ages 1 - 15 Years.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SIZE_CHARTS.map((chart) => (
            <div
              key={chart.id}
              className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="p-4 border-b border-border/60 bg-oatmeal/30 flex items-center justify-between">
                <div>
                  <span className="text-label-xs uppercase tracking-wider text-warmBrown font-semibold block">
                    {chart.category}
                  </span>
                  <h3 className="font-serif text-heading-sm font-semibold text-charcoal">
                    {chart.title}
                  </h3>
                </div>
              </div>

              <div className="relative w-full aspect-[2/3] bg-oatmeal/20 p-2 overflow-hidden">
                <Image
                  src={chart.image}
                  alt={`${chart.title} - Noolin Nayam by Divya`}
                  fill
                  className="object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <div className="p-5 mt-auto bg-ivory border-t border-border/40">
                <p className="text-body-xs text-charcoal-600 mb-4">{chart.description}</p>
                <a
                  href={chart.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-label-xs font-medium uppercase tracking-[0.16em] bg-charcoal text-ivory rounded-lg hover:bg-warmBrown hover:text-charcoal transition-colors"
                >
                  View High-Res Chart ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Size Request Banner */}
      <section className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <div className="bg-warmBrown/10 border border-warmBrown/30 rounded-2xl p-10 space-y-4 shadow-sm">
          <h2 className="font-serif text-heading-md font-semibold text-charcoal">
            Can't Find exact measurements for your child?
          </h2>
          <p className="text-body-sm text-charcoal-700 max-w-xl mx-auto">
            We offer custom hand-crafted sizing for every age and height! Submit your custom measurements and preferred design for a tailored outfit.
          </p>
          <div className="pt-2">
            <Link
              href="/custom-orders"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-label-md font-medium uppercase tracking-[0.16em] bg-charcoal text-ivory rounded-lg hover:bg-warmBrown hover:text-charcoal transition-all shadow-sm"
            >
              Order Custom Sizing ↗
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
