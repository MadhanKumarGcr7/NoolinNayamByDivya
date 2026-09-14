/**
 * Button
 * ────────────────────────────────────────────────────────────────────────────
 * Brand button component. Variants: primary, secondary, ghost, outline.
 * No rounded corners on primary/secondary (luxury aesthetic).
 * Optional arrow suffix for CTA buttons.
 */

'use client';

const variants = {
  primary: `
    bg-[#191919] text-white border border-[#191919]
    hover:bg-[#333333] hover:border-[#333333]
    focus-visible:ring-2 focus-visible:ring-[#191919] focus-visible:ring-offset-2
  `,
  secondary: `
    bg-[#CAB8A2] text-[#191919] border border-[#CAB8A2]
    hover:bg-[#beaa92] hover:border-[#beaa92]
  `,
  ghost: `
    bg-transparent text-charcoal border border-transparent
    hover:border-[#191919]
  `,
  outline: `
    bg-transparent text-[#191919] border border-[#191919]
    hover:bg-[#191919] hover:text-white
  `,
  blush: `
    bg-[#E2D3CB] text-[#191919] border border-[#E2D3CB]
    hover:bg-[#d8c7be] hover:border-[#d8c7be]
  `,
};

const sizes = {
  sm:  'px-5 py-2.5 text-label-md',
  md:  'px-7 py-3.5 text-label-lg',
  lg:  'px-9 py-4   text-label-xl',
  xl:  'px-11 py-5  text-label-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow = false,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  href,
  ...props
}) {
  const base = `
    inline-flex items-center justify-center gap-2.5
    uppercase tracking-[0.16em] font-sans font-medium
    transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
    select-none whitespace-nowrap
    disabled:opacity-40 disabled:cursor-not-allowed
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `;

  const content = (
    <>
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      <span>{children}</span>
      {arrow && !loading && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={`group ${base}`} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={`group ${base}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}
