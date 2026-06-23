/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Brand Color System ─────────────────────────────────────────
      // Full Material Design 3 token set mapped to MARA's warm taupe palette
      colors: {
        'on-tertiary-container':       '#fffbff',
        'on-surface':                  '#1f1b14',
        'secondary-fixed-dim':         '#d5c4b1',
        'on-tertiary-fixed':           '#211b12',
        'on-secondary':                '#ffffff',
        'surface-tint':                '#6c5c48',
        'surface-variant':             '#ebe1d5',
        'tertiary':                    '#635b50',
        'outline':                     '#7f766c',
        'on-surface-variant':          '#4d463e',
        'on-primary-fixed':            '#25190a',
        'tertiary-fixed-dim':          '#d0c5b7',
        'background':                  '#fff8f3',  // Warm cream — page base
        'primary-container':           '#83725d',
        'tertiary-fixed':              '#ede1d2',
        'inverse-surface':             '#353028',
        'on-primary-container':        '#fffbff',
        'on-secondary-fixed':          '#231a0e',
        'error-container':             '#ffdad6',
        'on-tertiary-fixed-variant':   '#4d463b',
        'surface-container-high':      '#f1e7db',
        'secondary-fixed':             '#f1e0cc',
        'surface-container-low':       '#fcf2e6',  // Light cream for product cards
        'on-secondary-container':      '#6d6151',
        'surface-bright':              '#fff8f3',
        'inverse-primary':             '#d9c3ab',
        'on-primary':                  '#ffffff',
        'secondary':                   '#695c4d',
        'on-tertiary':                 '#ffffff',
        'secondary-container':         '#efddc9',
        'primary':                     '#695946',  // Core taupe/muted brown — main brand color
        'surface-container-highest':   '#ebe1d5',
        'primary-fixed':               '#f6dfc6',
        'outline-variant':             '#d0c5ba',
        'tertiary-container':          '#7c7367',
        'primary-fixed-dim':           '#d9c3ab',
        'inverse-on-surface':          '#f9efe3',
        'on-error-container':          '#93000a',
        'on-background':               '#1f1b14',
        'on-primary-fixed-variant':    '#534432',
        'surface-dim':                 '#e2d9cd',
        'surface':                     '#fff8f3',
        'on-secondary-fixed-variant':  '#504536',
        'error':                       '#ba1a1a',
        'surface-container':           '#f6ece0',  // Slightly warmer surface for sections
        'surface-container-lowest':    '#ffffff',
        'on-error':                    '#ffffff',
      },

      // ─── Spacing Scale ───────────────────────────────────────────────
      spacing: {
        'unit':            '4px',
        'margin-desktop':  '80px',
        'margin-mobile':   '20px',
        'gutter':          '24px',
        'section-gap':     '120px',
      },

      // ─── Typography — Two-Family System ─────────────────────────────
      // Bodoni Moda: editorial display & headlines (serif, high contrast)
      // Manrope:     UI labels, body copy (geometric sans, clean legibility)
      fontFamily: {
        'headline-lg':        ['Bodoni Moda', 'serif'],
        'headline-md':        ['Bodoni Moda', 'serif'],
        'display-lg':         ['Bodoni Moda', 'serif'],
        'headline-lg-mobile': ['Bodoni Moda', 'serif'],
        'label-lg':           ['Manrope', 'sans-serif'],
        'label-sm':           ['Manrope', 'sans-serif'],
        'body-md':            ['Manrope', 'sans-serif'],
        'body-lg':            ['Manrope', 'sans-serif'],
      },

      // ─── Type Scale ──────────────────────────────────────────────────
      fontSize: {
        'display-lg':         ['64px',  { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg':        ['40px',  { lineHeight: '1.2',  fontWeight: '400' }],
        'headline-lg-mobile': ['32px',  { lineHeight: '1.2',  fontWeight: '400' }],
        'headline-md':        ['28px',  { lineHeight: '1.3',  fontWeight: '400' }],
        'label-lg':           ['14px',  { lineHeight: '1.2',  letterSpacing: '0.1em',  fontWeight: '600' }],
        'label-sm':           ['12px',  { lineHeight: '1.2',  letterSpacing: '0.05em', fontWeight: '500' }],
        'body-lg':            ['18px',  { lineHeight: '1.6',  fontWeight: '300' }],
        'body-md':            ['16px',  { lineHeight: '1.6',  fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
