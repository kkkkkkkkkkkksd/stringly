/** @type {import('tailwindcss').Config} */
// Токены направления A · Indigo & Slate (см. docs/14-design-system.md).
// Палитра — статичными значениями; поверхности/текст/границы — через CSS-переменные,
// чтобы одна разметка работала и в светлой, и в тёмной теме.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          tint: '#EEF2FF',
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
          800: '#3730A3', 900: '#312E81',
        },
        slate: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
          400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
          800: '#1E293B', 900: '#0F172A', 950: '#020617',
        },
        surface: 'var(--bg-surface)',
        page: 'var(--bg-page)',
        subtle: 'var(--bg-subtle)',
        ink: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
        faint: 'var(--text-tertiary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: { sm: '6px', md: '8px', lg: '12px' },
      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,.06)',
        md: '0 4px 12px rgba(15,23,42,.08)',
        pop: '0 8px 24px rgba(15,23,42,.12)',
      },
    },
  },
  plugins: [],
};
