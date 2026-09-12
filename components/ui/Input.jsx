/**
 * Input
 * ────────────────────────────────────────────────────────────────────────────
 * Styled form input. Minimal, warm, accessible.
 */

'use client';

export default function Input({
  label,
  id,
  error,
  className = '',
  wrapperClassName = '',
  type = 'text',
  required = false,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal-600"
        >
          {label}
          {required && <span className="text-warmBrown ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full px-4 py-3
          bg-ivory border border-border
          text-charcoal text-body-sm font-sans font-light
          placeholder:text-charcoal-200
          transition-colors duration-200
          focus:outline-none focus:border-charcoal
          hover:border-charcoal-400
          ${error ? 'border-warmBrown focus:border-warmBrown' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-body-xs text-warmBrown font-sans mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea variant
 */
export function Textarea({
  label,
  id,
  error,
  rows = 4,
  className = '',
  wrapperClassName = '',
  required = false,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal-600"
        >
          {label}
          {required && <span className="text-warmBrown ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full px-4 py-3 resize-none
          bg-ivory border border-border
          text-charcoal text-body-sm font-sans font-light
          placeholder:text-charcoal-200
          transition-colors duration-200
          focus:outline-none focus:border-charcoal
          hover:border-charcoal-400
          ${error ? 'border-warmBrown focus:border-warmBrown' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-body-xs text-warmBrown font-sans mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Select variant
 */
export function Select({
  label,
  id,
  error,
  options = [],
  className = '',
  wrapperClassName = '',
  required = false,
  placeholder = 'Select an option',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal-600"
        >
          {label}
          {required && <span className="text-warmBrown ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={id}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full px-4 py-3 appearance-none
          bg-ivory border border-border
          text-charcoal text-body-sm font-sans font-light
          transition-colors duration-200
          focus:outline-none focus:border-charcoal
          hover:border-charcoal-400
          cursor-pointer
          ${error ? 'border-warmBrown' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-body-xs text-warmBrown font-sans mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
