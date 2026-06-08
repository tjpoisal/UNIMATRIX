import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0e1030',
        surface: '#111827',
        'surface-elevated': '#1F2937',
        text: '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        'border': '#334155',
        accent: '#ff7a00',
        'accent-secondary': '#A855F7',
      },
      backgroundColor: {
        bg: '#0e1030',
        surface: '#111827',
        'surface-elevated': '#1F2937',
      },
      textColor: {
        text: '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      },
      borderColor: {
        border: '#334155',
      },
      fontFamily: {
        sans: 'var(--font-geist-sans)',
        mono: 'var(--font-geist-mono)',
      },
    },
  },
  plugins: [],
} satisfies Config;
