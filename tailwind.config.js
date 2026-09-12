/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
    './store/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // ─── BRAND COLOR PALETTE ─────────────────────────────────────────────
      // Warm, neutral-first. Restrained accents only.
      // Do NOT add bright colors — this is a luxury brand.
      colors: {
        // Ivory spectrum (primary backgrounds)
        ivory:     { DEFAULT: '#FAF7F2', 50: '#FEFCFA', 100: '#FAF7F2', 200: '#F4EDE0', 300: '#EDE0CC' },
        cream:     { DEFAULT: '#F5EFE4', 50: '#FBF8F3', 100: '#F5EFE4', 200: '#EBDFCe', 300: '#DDD0BB' },
        oatmeal:   { DEFAULT: '#E8DDD0', 100: '#E8DDD0', 200: '#D9CABC', 300: '#C8B5A5' },
        sand:      { DEFAULT: '#D4C4B0', 100: '#D4C4B0', 200: '#C4B09A', 300: '#B09A82' },
        // Warm accents (use sparingly — one accent per section max)
        blush:     { DEFAULT: '#E8C4B8', light: '#F2D8D0', dark: '#D4A898', muted: '#C49888' },
        sage:      { DEFAULT: '#B8C4B0', light: '#CCD6C6', dark: '#9EAE96', muted: '#8A9882' },
        // Text & contrast
        charcoal:  { DEFAULT: '#2C2520', 800: '#3D3330', 600: '#5C5048', 400: '#8A7E76', 200: '#C4BDB8' },
        warmBrown: { DEFAULT: '#6B4F3A', light: '#8B6F5A', dark: '#4A3528' },
        // Semantic aliases
        background: '#FAF7F2',
        surface:    '#F5EFE4',
        surfaceAlt: '#EDE0CC',
        border:     '#DDD0BB',
      },

      // ─── TYPOGRAPHY ───────────────────────────────────────────────────────
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        sans:  ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Editorial display — fluid, responsive
        'display-2xl': ['clamp(3.5rem,8vw,7rem)',    { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl':  ['clamp(2.75rem,6vw,5.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-lg':  ['clamp(2.25rem,5vw,4rem)',   { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'display-md':  ['clamp(1.875rem,4vw,3rem)',  { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm':  ['clamp(1.5rem,3vw,2.25rem)', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        // Body
        'body-xl': ['1.25rem',   { lineHeight: '1.7' }],
        'body-lg': ['1.125rem',  { lineHeight: '1.7' }],
        'body-md': ['1rem',      { lineHeight: '1.65' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        'body-xs': ['0.875rem',  { lineHeight: '1.55' }],
        // Labels / nav — uppercase, tracked
        'label-xl': ['0.8125rem', { lineHeight: '1', letterSpacing: '0.14em' }],
        'label-lg': ['0.75rem',   { lineHeight: '1', letterSpacing: '0.16em' }],
        'label-md': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        'label-sm': ['0.625rem',  { lineHeight: '1', letterSpacing: '0.2em'  }],
      },

      // ─── SPACING ──────────────────────────────────────────────────────────
      spacing: {
        '13': '3.25rem', '15': '3.75rem', '18': '4.5rem',
        '22': '5.5rem',  '26': '6.5rem',  '30': '7.5rem',
        '34': '8.5rem',  '38': '9.5rem',  '42': '10.5rem',
        '46': '11.5rem', '50': '12.5rem', '54': '13.5rem',
        '58': '14.5rem', '62': '15.5rem', '66': '16.5rem',
        '70': '17.5rem', '74': '18.5rem', '78': '19.5rem',
        '82': '20.5rem', '86': '21.5rem', '90': '22.5rem',
        '94': '23.5rem', '98': '24.5rem', '100': '25rem',
        '110': '27.5rem', '120': '30rem', '130': '32.5rem',
        '140': '35rem',   '150': '37.5rem', '160': '40rem',
      },

      maxWidth: {
        '8xl': '88rem', '9xl': '96rem', '10xl': '104rem',
        'screen-3xl': '1920px',
      },

      // ─── BORDER RADIUS ────────────────────────────────────────────────────
      // Minimal — luxury avoids heavy rounding
      borderRadius: {
        'none': '0',
        'xs':   '0.125rem',
        'sm':   '0.25rem',
        DEFAULT:'0.375rem',
        'md':   '0.5rem',
        'lg':   '0.75rem',
        'xl':   '1rem',
        'full': '9999px',
      },

      // ─── TRANSITIONS ──────────────────────────────────────────────────────
      transitionDuration: {
        '400': '400ms', '600': '600ms', '800': '800ms',
        '1000': '1000ms', '1200': '1200ms', '1500': '1500ms',
      },
      transitionTimingFunction: {
        'luxury':       'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-out-expo':'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      },

      // ─── KEYFRAMES & ANIMATIONS ───────────────────────────────────────────
      // Slow and calm — luxury signal, never gimmicky
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'image-reveal': {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
      },
      animation: {
        'fade-up':         'fade-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-up-slow':    'fade-up 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-up-slower':  'fade-up 1.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-in':         'fade-in 0.6s ease both',
        'fade-in-slow':    'fade-in 1.0s ease both',
        'slide-in-right':  'slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-out-right': 'slide-out-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'scale-in':        'scale-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'image-reveal':    'image-reveal 1.2s cubic-bezier(0.19, 1, 0.22, 1) both',
      },

      // ─── ASPECT RATIOS ────────────────────────────────────────────────────
      aspectRatio: {
        'portrait':  '3/4',
        'editorial': '2/3',
        'wide':      '16/9',
        'square':    '1/1',
      },

      // ─── BOX SHADOW ───────────────────────────────────────────────────────
      // Warm-tinted, subtle — never heavy drop shadows
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(44,37,32,0.08)',
        'warm-md': '0 4px 16px 0 rgba(44,37,32,0.08)',
        'warm-lg': '0 8px 32px 0 rgba(44,37,32,0.10)',
        'warm-xl': '0 20px 60px 0 rgba(44,37,32,0.12)',
        'inset-warm': 'inset 0 0 0 1px rgba(44,37,32,0.12)',
      },
    },
  },
  plugins: [],
};
