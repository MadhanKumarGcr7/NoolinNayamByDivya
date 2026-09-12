/**
 * SectionHeading
 * ────────────────────────────────────────────────────────────────────────────
 * Editorial section heading component. Follows the pattern:
 *   [small uppercase label]
 *   [large serif headline]
 *   [optional body copy]
 *   [optional divider]
 *
 * Used consistently across all homepage sections.
 */

export default function SectionHeading({
  label,          // Small uppercase label above headline (optional)
  headline,       // Main heading text (required) — rendered as h2 by default
  subtext,        // Body copy below headline (optional)
  as: Tag = 'h2', // Heading tag — override to h1 for unique page headings
  align = 'left', // 'left' | 'center' | 'right'
  divider = false,// Show decorative divider line below label
  className = '',
  headlineClassName = '',
}) {
  const alignClass = {
    left:   'items-start text-left',
    center: 'items-center text-center',
    right:  'items-end text-right',
  }[align] || 'items-start text-left';

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {label && (
        <p className="section-label mb-4">{label}</p>
      )}
      {divider && (
        <div className={`w-12 h-px bg-sand mb-6 ${align === 'center' ? 'mx-auto' : ''}`} />
      )}
      <Tag
        className={`font-serif font-light text-charcoal ${headlineClassName}`}
      >
        {headline}
      </Tag>
      {subtext && (
        <p className="mt-5 text-body-md text-charcoal-600 font-sans font-light leading-relaxed max-w-lg">
          {subtext}
        </p>
      )}
    </div>
  );
}
