import type { Config } from 'tailwindcss';

/**
 * Design tokens — implements docs/DESIGN_SYSTEM.md §2–§6 (traceable to
 * docs/PROJECT_BIBLE.md §22). Three-tier tokens: primitives here map to
 * semantic aliases so the PROVISIONAL brand palette (⚠️ H10) can be swapped
 * for the real brand manual by editing only these values — components unchanged.
 */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,ts,tsx}'],
  theme: {
    // Breakpoints — mobile-first (DESIGN_SYSTEM §6): 320 base, then 640/768/1024/1280.
    // NOTE: this REPLACES Tailwind's defaults (intentionally drops the 1536px
    // `2xl` breakpoint, which is out of the design system's range).
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        // ── Primitives (⚠️ PROVISIONAL H10) ──────────────────────────────
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        green: {
          50: '#ecfdf5',
          600: '#059669',
          700: '#047857',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          300: '#d1d5db',
          500: '#6b7280',
          600: '#4b5563',
          900: '#111827',
        },
        amber: { 500: '#f59e0b' },
        red: { 600: '#dc2626' },
        // ── Semantic aliases (consumed by components) ────────────────────
        text: {
          primary: '#111827', // gray-900  (AA ~17.7:1 on white)
          secondary: '#4b5563', // gray-600 (AA ~7.6:1)
          muted: '#6b7280', // gray-500   (AA ~4.8:1)
          inverse: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f9fafb', // gray-50
          muted: '#f3f4f6', // gray-100
        },
        border: {
          DEFAULT: '#d1d5db', // gray-300
        },
        action: {
          DEFAULT: '#1d4ed8', // blue-700 (AA ~6.3:1)
          hover: '#1e40af', // blue-800
        },
        success: {
          DEFAULT: '#047857', // green-700 (sustainability/success only)
        },
        danger: { DEFAULT: '#dc2626' },
        warning: { DEFAULT: '#f59e0b' },
        focus: '#1d4ed8', // blue-700 focus ring (DESIGN_SYSTEM §10)
      },
      fontFamily: {
        // Inter variable, single family (DESIGN_SYSTEM §4).
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Fluid scale via clamp() (DESIGN_SYSTEM §4.2).
        overline: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        'body-sm': ['0.875rem', { lineHeight: '1.4rem' }],
        body: ['1rem', { lineHeight: '1.6rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        h4: ['clamp(1.125rem, 1rem + 0.6vw, 1.375rem)', { lineHeight: '1.3' }],
        h3: [
          'clamp(1.375rem, 1.2rem + 0.9vw, 1.75rem)',
          { lineHeight: '1.25' },
        ],
        h2: ['clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)', { lineHeight: '1.2' }],
        h1: ['clamp(2.25rem, 1.8rem + 2.4vw, 3.5rem)', { lineHeight: '1.1' }],
        display: [
          'clamp(2.75rem, 2rem + 3.6vw, 4.5rem)',
          { lineHeight: '1.05' },
        ],
      },
      // Spacing: the 4px base scale (DESIGN_SYSTEM §5.1) matches Tailwind's
      // default scale exactly, so it is inherited rather than redeclared.
      maxWidth: {
        content: '1200px', // page max width (DESIGN_SYSTEM §5)
        prose: '68ch', // technical prose max (60–75ch)
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        lg: '0.75rem',
      },
      boxShadow: {
        // Minimal depth for premium sobriety (DESIGN_SYSTEM §8).
        sm: '0 1px 2px 0 rgb(17 24 39 / 0.05)',
        md: '0 4px 6px -1px rgb(17 24 39 / 0.08)',
        lg: '0 10px 20px -3px rgb(17 24 39 / 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;
