/**
 * PlaceholderImage
 * ────────────────────────────────────────────────────────────────────────────
 * Warm-toned labeled placeholder for every image slot where real photography
 * will be inserted. Clearly labels what goes where so photography drop-in
 * requires no UI changes — just replace the src in image-config.js.
 */

'use client';

export default function PlaceholderImage({ label = 'Image', className = '', aspect = '3/4' }) {
  const aspectClass = {
    '3/4':  'aspect-portrait',
    '2/3':  'aspect-editorial',
    '1/1':  'aspect-square',
    '16/9': 'aspect-wide',
    'auto': '',
  }[aspect] || 'aspect-portrait';

  return (
    <div
      className={`${aspectClass} ${className} relative overflow-hidden flex items-center justify-center`}
      style={{
        background: 'linear-gradient(135deg, #EDE0CC 0%, #D9CABC 40%, #C8B5A5 100%)',
      }}
      aria-label={label}
      role="img"
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(107,79,58,0.08) 0px, rgba(107,79,58,0.08) 1px, transparent 1px, transparent 8px)',
        }}
      />

      {/* Label */}
      <div className="relative z-10 text-center px-4 py-3">
        <div className="flex items-center justify-center mb-2">
          {/* Camera icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-warmBrown opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </div>
        <p
          className="text-label-md uppercase tracking-[0.16em] text-warmBrown opacity-60 font-sans font-medium leading-relaxed"
          style={{ maxWidth: '160px' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
