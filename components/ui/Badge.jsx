/**
 * Badge
 * ────────────────────────────────────────────────────────────────────────────
 * Small product/collection badge. Variants match brand categories.
 */

const variants = {
  default:       'bg-oatmeal text-charcoal-600',
  'new-arrival': 'bg-blush-light text-warmBrown',
  bestseller:    'bg-sand text-warmBrown',
  'made-to-order':'bg-sage-light text-charcoal-600',
  featured:      'bg-charcoal text-ivory',
  sale:          'bg-warmBrown text-ivory',
};

export default function Badge({ label, variant = 'default', className = '' }) {
  if (!label) return null;

  // Auto-detect variant from label text
  const autoVariant = (() => {
    const l = label.toLowerCase();
    if (l.includes('new')) return 'new-arrival';
    if (l.includes('best')) return 'bestseller';
    if (l.includes('made to order')) return 'made-to-order';
    if (l.includes('featured')) return 'featured';
    if (l.includes('sale') || l.includes('off')) return 'sale';
    return 'default';
  })();

  const finalVariant = variant !== 'default' ? variant : autoVariant;

  return (
    <span
      className={`
        inline-block text-label-sm uppercase tracking-[0.16em]
        font-sans font-medium px-2.5 py-1
        ${variants[finalVariant] || variants.default}
        ${className}
      `}
    >
      {label}
    </span>
  );
}
