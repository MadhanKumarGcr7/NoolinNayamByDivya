/**
 * Badge
 * ────────────────────────────────────────────────────────────────────────────
 * Small product/collection badge. Variants match brand categories.
 */

const variants = {
  default:       'bg-[#E2D3CB] text-[#191919] border border-[#E2D3CB]',
  'new-arrival': 'bg-[#E2D3CB] text-[#191919] border border-[#CAB8A2]',
  bestseller:    'bg-[#CAB8A2] text-[#191919] border border-[#CAB8A2]',
  'made-to-order':'bg-[#E2D3CB] text-[#191919] border border-[#CAB8A2]',
  featured:      'bg-[#191919] text-white border border-[#191919]',
  sale:          'bg-[#BD9F86] text-[#191919] border border-[#BD9F86]',
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
