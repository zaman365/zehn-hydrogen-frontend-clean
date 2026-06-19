/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx,js,jsx}', './app/components/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Primary: Space Grotesk for all text (headings use weight 700)
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Body alias: Space Grotesk (kept for backward compatibility)
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Display: Inter for page-level headings (collection titles, etc.)
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // ZEHN Typography Scale with Responsive Variants
        // Space Grotesk Bold (700) for headings
        'h1': ['21px', {lineHeight: '25px', letterSpacing: '-0.03em', fontWeight: '700'}],
        'h1-sm': ['27px', {lineHeight: '32px', letterSpacing: '-0.03em', fontWeight: '700'}],
        'h1-lg': ['36px', {lineHeight: '42px', letterSpacing: '-0.03em', fontWeight: '700'}],
        'h2': ['26px', {lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700'}],
        'h2-sm': ['30px', {lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700'}],
        'h2-lg': ['38px', {lineHeight: '46px', letterSpacing: '-0.02em', fontWeight: '700'}],
        'h3': ['20px', {lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '700'}],
        'h3-sm': ['24px', {lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700'}],
        'h3-lg': ['30px', {lineHeight: '38px', letterSpacing: '-0.01em', fontWeight: '700'}],
        // Space Grotesk Medium (500) for subheadings
        'subheadline': ['17px', {lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '500'}],
        'subheadline-sm': ['19px', {lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '500'}],
        'subheadline-lg': ['22px', {lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '500'}],
        // Space Grotesk Regular (400) for body text
        'body': ['14px', {lineHeight: '22px', letterSpacing: '0em', fontWeight: '400'}],
        'body-lg': ['16px', {lineHeight: '26px', letterSpacing: '0em', fontWeight: '400'}],
      },
      letterSpacing: {
        'tight-4': '-0.04em',
        'tight-2': '-0.02em',
      },
      colors: {
        // ZEHN Brand Color Palette
        zehn: {
          indigo: '#0F1426',        // Anodized Indigo - primary, dark mode background
          slate: '#8E97A4',         // Industrial Slate - secondary
          signal: '#FF5F1F',        // Safety Signal - accent
          platinum: '#F4F4F5',      // Platinum - light mode background
        },
        // Semantic color tokens for light/dark mode support
        primary: {
          DEFAULT: '#0F1426',       // Anodized Indigo
          foreground: '#F4F4F5',    // Platinum (text on primary)
        },
        secondary: {
          DEFAULT: '#8E97A4',       // Industrial Slate
          foreground: '#F4F4F5',    // Light text on secondary
        },
        accent: {
          DEFAULT: '#FF5F1F',       // Safety Signal
          foreground: '#F4F4F5',    // Light text on accent
        },
        background: '#F4F4F5',      // Platinum - light mode
        foreground: '#0F1426',      // Anodized Indigo - dark text
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0F1426',
        },
        muted: {
          DEFAULT: '#8E97A4',
          foreground: '#F4F4F5',
        },
        border: '#8E97A4',
      },
      animation: {
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
